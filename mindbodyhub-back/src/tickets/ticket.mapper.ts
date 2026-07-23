import { Ticket } from './entities/ticket.entity';
import { TicketDto } from './ticket.types';

export function toTicketDto(ticket: Ticket): TicketDto {
  return {
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
}
