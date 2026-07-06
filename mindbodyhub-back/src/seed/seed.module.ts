import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminSeedService } from './admin-seed.service';

@Module({
  imports: [UsersModule],
  providers: [AdminSeedService],
})
export class SeedModule {}
