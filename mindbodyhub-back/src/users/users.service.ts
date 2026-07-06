import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.enum';
import { User } from './entities/user.entity';

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

  countByRole(role: UserRole): Promise<number> {
    return this.usersRepository.count({ where: { role } });
  }

  async createUser(data: {
    phone: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User> {
    const user = this.usersRepository.create({
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role ?? UserRole.USER,
    });

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
