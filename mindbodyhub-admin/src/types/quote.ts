export const QuoteStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export type Quote = {
  id: string;
  body: string;
  author: string | null;
  status: QuoteStatus;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuotePayload = {
  body: string;
  author?: string | null;
  publishedAt?: string | null;
  publish?: boolean;
};

export type UpdateQuotePayload = {
  body?: string;
  author?: string | null;
  publishedAt?: string | null;
};
