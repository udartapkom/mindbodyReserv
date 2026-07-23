export enum TicketStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

export enum TicketSource {
  HOME = 'home',
  SUPPORT = 'support',
  CABINET = 'cabinet',
  OTHER = 'other',
}

export type TicketDto = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: TicketStatus;
  source: TicketSource;
  userId: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};
