import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketSource, TicketStatus } from './ticket.types';

export type CreateTicketData = {
  name: string;
  phone: string;
  message: string;
  source?: TicketSource;
  userId?: string | null;
};

export type UpdateTicketData = {
  status?: TicketStatus;
  adminNote?: string | null;
};

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Ticket | null> {
    return this.ticketsRepository.findOne({ where: { id } });
  }

  async create(data: CreateTicketData): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      name: data.name.trim(),
      phone: data.phone,
      message: data.message.trim(),
      source: data.source ?? TicketSource.OTHER,
      userId: data.userId ?? null,
      status: TicketStatus.NEW,
      adminNote: null,
    });

    return this.ticketsRepository.save(ticket);
  }

  async update(id: string, data: UpdateTicketData): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (!ticket) {
      throw new Error(`Ticket ${id} not found`);
    }

    if (data.status !== undefined) {
      ticket.status = data.status;
    }

    if (data.adminNote !== undefined) {
      ticket.adminNote = data.adminNote;
    }

    return this.ticketsRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findById(id);

    if (!ticket) {
      throw new Error(`Ticket ${id} not found`);
    }

    await this.ticketsRepository.remove(ticket);
  }
}
