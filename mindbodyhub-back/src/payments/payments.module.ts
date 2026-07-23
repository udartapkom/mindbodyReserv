import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffsModule } from '../tariffs/tariffs.module';
import { UsersModule } from '../users/users.module';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PlategaClient } from './platega.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    TariffsModule,
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PlategaClient],
  exports: [PaymentsService],
})
export class PaymentsModule {}
