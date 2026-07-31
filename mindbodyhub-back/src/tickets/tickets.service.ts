import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushNotifyService } from '../notifications/push-notify.service';
import { VkNotifyService } from '../notifications/vk-notify.service';
import { TicketMessage } from './entities/ticket-message.entity';
import { Ticket } from './entities/ticket.entity';
import {
  TicketMessageAuthor,
  TicketSource,
  TicketStatus,
} from './ticket.types';

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
    @InjectRepository(TicketMessage)
    private readonly messagesRepository: Repository<TicketMessage>,
    private readonly vkNotify: VkNotifyService,
    private readonly pushNotify: PushNotifyService,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Ticket | null> {
    return this.ticketsRepository.findOne({ where: { id } });
  }

  async findMine(userId: string, phone: string): Promise<Ticket[]> {
    await this.claimOrphanTicketsByPhone(userId, phone);

    return this.ticketsRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getOwnedOrThrow(userId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.findById(ticketId);
    if (!ticket || ticket.userId !== userId) {
      throw new NotFoundException('Обращение не найдено');
    }
    return ticket;
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

    const saved = await this.ticketsRepository.save(ticket);

    await this.messagesRepository.save(
      this.messagesRepository.create({
        ticketId: saved.id,
        authorType: TicketMessageAuthor.USER,
        authorUserId: saved.userId,
        body: saved.message,
      }),
    );

    void this.vkNotify.notifyTicketCreated({
      ticketId: saved.id,
      name: saved.name,
      phone: saved.phone,
      message: saved.message,
      source: saved.source,
    });

    return saved;
  }

  async update(id: string, data: UpdateTicketData): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (!ticket) {
      throw new NotFoundException('Обращение не найдено');
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
      throw new NotFoundException('Обращение не найдено');
    }

    await this.ticketsRepository.remove(ticket);
  }

  findMessages(ticketId: string): Promise<TicketMessage[]> {
    return this.messagesRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }

  async addUserMessage(
    userId: string,
    ticketId: string,
    body: string,
  ): Promise<TicketMessage> {
    const ticket = await this.getOwnedOrThrow(userId, ticketId);

    if (ticket.status === TicketStatus.CLOSED) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketsRepository.save(ticket);
    }

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        ticketId: ticket.id,
        authorType: TicketMessageAuthor.USER,
        authorUserId: userId,
        body: body.trim(),
      }),
    );

    ticket.updatedAt = new Date();
    await this.ticketsRepository.save(ticket);

    void this.vkNotify.notifyTicketMessage({
      ticketId: ticket.id,
      name: ticket.name,
      phone: ticket.phone,
      message: message.body,
      from: 'user',
    });

    return message;
  }

  async addAdminMessage(
    adminUserId: string,
    ticketId: string,
    body: string,
  ): Promise<TicketMessage> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Обращение не найдено');
    }

    if (ticket.status === TicketStatus.NEW) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        ticketId: ticket.id,
        authorType: TicketMessageAuthor.ADMIN,
        authorUserId: adminUserId,
        body: body.trim(),
      }),
    );

    ticket.updatedAt = new Date();
    await this.ticketsRepository.save(ticket);

    if (ticket.userId) {
      void this.pushNotify.notifySupportReply(ticket.userId, {
        ticketId: ticket.id,
        preview: body.trim(),
      });
    }

    return message;
  }

  private async claimOrphanTicketsByPhone(
    userId: string,
    phone: string,
  ): Promise<void> {
    await this.ticketsRepository
      .createQueryBuilder()
      .update(Ticket)
      .set({ userId })
      .where('user_id IS NULL')
      .andWhere('phone = :phone', { phone })
      .execute();
  }
}
