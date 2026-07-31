import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { User } from '../users/entities/user.entity';
import { toAuthUserSummary, toPublicProfile } from '../users/user.mapper';
import { UserRole, canAccessAdminPanel } from '../users/user-role.enum';
import { UsersService } from '../users/users.service';
import { AuthTokensResponse, UserProfileResponse } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

type AccessTokenPayload = {
  sub: string;
  phone: string;
  role: UserRole;
  type: 'access';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const existingUser = await this.usersService.findByPhone(dto.phone);

    if (existingUser) {
      throw new ConflictException('User with this phone already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.createUser({
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      phoneCountry: dto.phoneCountry ?? null,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.authenticateByPhonePassword(dto);
    return this.issueTokens(user);
  }

  /** Admin panel only — admin and editor may sign in. */
  async adminLogin(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.authenticateByPhonePassword(dto);

    if (!canAccessAdminPanel(user.role)) {
      throw new ForbiddenException('Доступ только для сотрудников');
    }

    return this.issueTokens(user);
  }

  private async authenticateByPhonePassword(dto: LoginDto): Promise<User> {
    const user = await this.usersService.findByPhone(dto.phone);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return user;
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date() ||
      !storedToken.user.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    storedToken.revokedAt = new Date();
    await this.refreshTokensRepository.save(storedToken);

    return this.issueTokens(storedToken.user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.revokedAt) {
      return;
    }

    storedToken.revokedAt = new Date();
    await this.refreshTokensRepository.save(storedToken);
  }

  /** Invalidate all sessions (e.g. after role demotion or block). */
  async revokeAllRefreshTokens(userId: string): Promise<number> {
    const result = await this.refreshTokensRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: () => 'NOW()' })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected ?? 0;
  }

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.enrichPublicProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    const user = await this.usersService.updateProfile(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      avatarUrl: dto.avatarUrl,
      notifySupportReplies: dto.notifySupportReplies,
      notifyNewMaterials: dto.notifyNewMaterials,
      notifyDailyQuote: dto.notifyDailyQuote,
    });

    return this.enrichPublicProfile(user);
  }

  async uploadAvatar(
    userId: string,
    file: { buffer: Buffer; contentType: string; extension: string },
  ): Promise<UserProfileResponse> {
    const user = await this.usersService.uploadAvatar(userId, file);
    return this.enrichPublicProfile(user);
  }

  private async enrichPublicProfile(user: User): Promise<UserProfileResponse> {
    const profile = toPublicProfile(user);
    return {
      ...profile,
      avatarUrl: await this.usersService.resolveAvatarUrl(user.avatarUrl),
    };
  }

  private async enrichAuthUserSummary(user: User) {
    const summary = toAuthUserSummary(user);
    return {
      ...summary,
      avatarUrl: await this.usersService.resolveAvatarUrl(user.avatarUrl),
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.usersService.updatePassword(userId, passwordHash);

    return { success: true };
  }

  private async issueTokens(user: User): Promise<AuthTokensResponse> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date(
      Date.now() + this.parseDurationMs(refreshExpiresIn),
    );

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      }),
    );

    return {
      accessToken,
      refreshToken,
      user: await this.enrichAuthUserSummary(user),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseDurationMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
