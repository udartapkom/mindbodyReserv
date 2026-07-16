import { Module } from '@nestjs/common';
import { TariffsModule } from '../tariffs/tariffs.module';
import { UsersModule } from '../users/users.module';
import { AdminSeedService } from './admin-seed.service';
import { TariffsSeedService } from './tariffs-seed.service';

@Module({
  imports: [UsersModule, TariffsModule],
  providers: [AdminSeedService, TariffsSeedService],
})
export class SeedModule {}
