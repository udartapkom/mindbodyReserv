export const TicketStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketSource = {
  HOME: 'home',
  SUPPORT: 'support',
  CABINET: 'cabinet',
  OTHER: 'other',
} as const;

export type TicketSource = (typeof TicketSource)[keyof typeof TicketSource];

export type Ticket = {
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

export type UpdateTicketPayload = {
  status?: TicketStatus;
  adminNote?: string | null;
};
