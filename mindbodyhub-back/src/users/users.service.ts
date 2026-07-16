import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
};

export type UpdateUserProfileData = {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export type AdminUpdateUserData = {
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRole;
  tariff?: UserTariff;
  isActive?: boolean;
  avatarUrl?: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    if (data.role !== undefined) {
      user.role = data.role;
    }

    if (data.tariff !== undefined) {
      user.tariff = data.tariff;
    }

    if (data.isActive !== undefined) {
      user.isActive = data.isActive;
    }

    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }

    return this.usersRepository.save(user);
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
