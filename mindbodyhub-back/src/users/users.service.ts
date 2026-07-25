import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { PhoneCountry } from './phone-country.enum';
import { UserRole } from './user-role.enum';
import { UserTariff } from './user-tariff.enum';
import { User } from './entities/user.entity';

export type CreateUserData = {
  phone: string;
  passwordHash: string;
  role?: UserRole;
  tariff?: UserTariff;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  phoneCountry?: PhoneCountry | null;
};

export type UpdateUserProfileData = {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export type AdminUpdateUserData = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string;
  phoneCountry?: PhoneCountry | null;
  role?: UserRole;
  tariff?: UserTariff;
  tariffExpiresAt?: Date | null;
  isActive?: boolean;
  avatarUrl?: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  countByRole(role: UserRole): Promise<number> {
    return this.usersRepository.count({ where: { role } });
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create({
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role ?? UserRole.USER,
      tariff: data.tariff ?? UserTariff.FREE,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      avatarUrl: data.avatarUrl ?? null,
      phoneCountry: data.phoneCountry ?? null,
    });

    return this.usersRepository.save(user);
  }

  async updateProfile(
    id: string,
    data: UpdateUserProfileData,
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    if (data.firstName !== undefined) {
      user.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      user.lastName = data.lastName;
    }

    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }

    return this.usersRepository.save(user);
  }

  async adminUpdateUser(id: string, data: AdminUpdateUserData): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    if (data.firstName !== undefined) {
      user.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      user.lastName = data.lastName;
    }

    if (data.phone !== undefined) {
      user.phone = data.phone;
    }

    if (data.phoneCountry !== undefined) {
      user.phoneCountry = data.phoneCountry;
    }

    if (data.role !== undefined) {
      user.role = data.role;
    }

    if (data.tariff !== undefined) {
      user.tariff = data.tariff;
      if (data.tariff === UserTariff.FREE && data.tariffExpiresAt === undefined) {
        user.tariffExpiresAt = null;
      }
    }

    if (data.tariffExpiresAt !== undefined) {
      user.tariffExpiresAt = data.tariffExpiresAt;
    }

    if (data.isActive !== undefined) {
      user.isActive = data.isActive;
    }

    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }

    return this.usersRepository.save(user);
  }

  async uploadAvatar(
    id: string,
    file: { buffer: Buffer; contentType: string; extension: string },
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    const key = `${id}/${randomUUID()}${file.extension}`;
    const bucket = this.storageService.getAvatarsBucket();

    await this.storageService.uploadFile({
      bucket,
      key,
      body: file.buffer,
      contentType: file.contentType,
      isPublic: false,
    });

    user.avatarUrl = key;
    return this.usersRepository.save(user);
  }

  async resolveAvatarUrl(avatarUrl: string | null): Promise<string | null> {
    if (!avatarUrl) {
      return null;
    }

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    return this.storageService.getPresignedUrl(
      this.storageService.getAvatarsBucket(),
      avatarUrl,
      3600,
    );
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    user.isActive = isActive;
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    await this.usersRepository.remove(user);
  }

  /** Daily job: paid tariffs past tariffExpiresAt → free */
  async expireOverdueTariffs(): Promise<number> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        tariff: UserTariff.FREE,
        tariffExpiresAt: null,
      })
      .where('tariff != :free', { free: UserTariff.FREE })
      .andWhere('tariff_expires_at IS NOT NULL')
      .andWhere('tariff_expires_at < NOW()')
      .execute();

    return result.affected ?? 0;
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    user.passwordHash = passwordHash;

    return this.usersRepository.save(user);
  }

  async promoteToAdmin(id: string, passwordHash: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    user.role = UserRole.ADMIN;
    user.passwordHash = passwordHash;

    return this.usersRepository.save(user);
  }
}
