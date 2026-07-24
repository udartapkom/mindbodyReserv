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

export const TicketMessageAuthor = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type TicketMessageAuthor =
  (typeof TicketMessageAuthor)[keyof typeof TicketMessageAuthor];

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorType: TicketMessageAuthor;
  authorUserId: string | null;
  body: string;
  createdAt: string;
};

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
  messages?: TicketMessage[];
};

export type UpdateTicketPayload = {
  status?: TicketStatus;
  adminNote?: string | null;
};
