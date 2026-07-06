import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { isValidPhone, normalizePhone } from '../common/utils/phone.util';
import { UserRole } from '../users/user-role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
  }

  async seedAdmin(): Promise<void> {
    const phoneRaw = this.config.get<string>('ADMIN_PHONE');
    const password = this.config.get<string>('ADMIN_PASSWORD');

    if (!phoneRaw || !password) {
      this.logger.log('Admin seed skipped: ADMIN_PHONE or ADMIN_PASSWORD not set');
      return;
    }

    if (!isValidPhone(phoneRaw)) {
      this.logger.warn('Admin seed skipped: ADMIN_PHONE has invalid format');
      return;
    }

    const phone = normalizePhone(phoneRaw);
    const passwordHash = await argon2.hash(password);
    const existingUser = await this.usersService.findByPhone(phone);

    if (existingUser?.role === UserRole.ADMIN) {
      this.logger.log(`Admin seed skipped: ${phone} is already admin`);
      return;
    }

    if (existingUser) {
      const admin = await this.usersService.promoteToAdmin(
        existingUser.id,
        passwordHash,
      );
      this.logger.log(`Admin user promoted: ${admin.phone}`);
      return;
    }

    const admin = await this.usersService.createUser({
      phone,
      passwordHash,
      role: UserRole.ADMIN,
    });

    this.logger.log(`Admin user created: ${admin.phone}`);
  }
}
