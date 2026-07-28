import { Quote } from './entities/quote.entity';
import { QuoteStatus } from './quote.types';

export type QuoteDto = {
  id: string;
  body: string;
  author: string | null;
  status: QuoteStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toQuoteDto(quote: Quote): QuoteDto {
  return {
    id: quote.id,
    body: quote.body,
    author: quote.author,
    status: quote.status,
    publishedAt: quote.publishedAt,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  };
}
