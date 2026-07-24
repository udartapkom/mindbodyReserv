import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { TicketDto, TicketMessageDto } from './ticket.types';

export function toTicketMessageDto(message: TicketMessage): TicketMessageDto {
  return {
    id: message.id,
    ticketId: message.ticketId,
    authorType: message.authorType,
    authorUserId: message.authorUserId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}

export function toTicketDto(
  ticket: Ticket,
  messages?: TicketMessage[],
): TicketDto {
  const dto: TicketDto = {
    id: ticket.id,
    name: ticket.name,
    phone: ticket.phone,
    message: ticket.message,
    status: ticket.status,
    source: ticket.source,
    userId: ticket.userId,
    adminNote: ticket.adminNote,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };

  if (messages) {
    dto.messages = messages.map(toTicketMessageDto);
  }

  return dto;
}
