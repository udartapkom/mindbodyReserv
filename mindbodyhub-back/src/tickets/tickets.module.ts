import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TicketMessage } from './entities/ticket-message.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketRateService } from './ticket-rate.service';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage]),
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketRateService],
  exports: [TicketsService],
})
export class TicketsModule {}
