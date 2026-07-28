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

export type QuotesPage = {
  items: Quote[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
