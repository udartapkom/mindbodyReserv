import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../auth/auth.service';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { detectImageFromBuffer } from '../common/utils/image-magic.util';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { User } from './entities/user.entity';
import { toPublicProfile } from './user.mapper';
import {
  UserRole,
  canAccessAdminPanel,
} from './user-role.enum';
import { UserLookupItem, UserPublicProfile } from './user.types';
import { UsersService } from './users.service';

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  /** Narrow read-only directory for admin + editor (support context). */
  @Get('lookup')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async lookup(): Promise<UserLookupItem[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tariff: user.tariff,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<UserPublicProfile[]> {
    const users = await this.usersService.findAll();
    return Promise.all(users.map((user) => this.toEnrichedProfile(user)));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserPublicProfile> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toEnrichedProfile(user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ): Promise<UserPublicProfile> {
    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.phone && dto.phone !== existing.phone) {
      const withPhone = await this.usersService.findByPhone(dto.phone);
      if (withPhone && withPhone.id !== id) {
        throw new ConflictException('Пользователь с таким телефоном уже существует');
      }
    }

    const user = await this.usersService.adminUpdateUser(id, {
      ...dto,
      tariffExpiresAt:
        dto.tariffExpiresAt === undefined
          ? undefined
          : dto.tariffExpiresAt === null
            ? null
            : new Date(dto.tariffExpiresAt),
    });

    const lostPanelAccess =
      canAccessAdminPanel(existing.role) && !canAccessAdminPanel(user.role);
    const deactivated = existing.isActive && !user.isActive;
    if (lostPanelAccess || deactivated) {
      await this.authService.revokeAllRefreshTokens(id);
    }

    return this.toEnrichedProfile(user);
  }

  @Post(':id/avatar')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE_BYTES },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<UserPublicProfile> {
    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    const detected = detectImageFromBuffer(file.buffer);
    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      throw new BadRequestException(
        'Допустимы только изображения: jpeg, png, webp',
      );
    }

    const user = await this.usersService.uploadAvatar(id, {
      buffer: file.buffer,
      contentType: detected.mime,
      extension: detected.extension,
    });

    return this.toEnrichedProfile(user);
  }

  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  async block(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<UserPublicProfile> {
    if (currentUser.id === id) {
      throw new BadRequestException('Нельзя заблокировать свой аккаунт');
    }

    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersService.setActive(id, false);
    await this.authService.revokeAllRefreshTokens(id);
    return this.toEnrichedProfile(user);
  }

  @Patch(':id/unblock')
  @Roles(UserRole.ADMIN)
  async unblock(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserPublicProfile> {
    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.usersService.setActive(id, true);
    return this.toEnrichedProfile(user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<{ success: true }> {
    if (currentUser.id === id) {
      throw new BadRequestException('Нельзя удалить свой аккаунт');
    }

    const existing = await this.usersService.findById(id);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.deleteUser(id);
    return { success: true };
  }

  private async toEnrichedProfile(user: User): Promise<UserPublicProfile> {
    const profile = toPublicProfile(user);
    return {
      ...profile,
      avatarUrl: await this.usersService.resolveAvatarUrl(user.avatarUrl),
    };
  }
}
