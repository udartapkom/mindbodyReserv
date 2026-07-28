import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { canAccessQuotes } from '../common/tariff/access.types';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './entities/quote.entity';
import { QuoteStatus } from './quote.types';

const MOSCOW_TZ = 'Europe/Moscow';

export type QuotesPage = {
  items: Quote[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
  ) {}

  assertQuotesAccess(options: {
    isAuthenticated?: boolean;
    userTariff?: string | null;
    userRole?: string | null;
  }): void {
    if (!canAccessQuotes(options)) {
      throw new ForbiddenException(
        'Цитаты доступны на платных тарифах',
      );
    }
  }

  findAll(): Promise<Quote[]> {
    return this.quotesRepository.find({
      order: { publishedAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Quote | null> {
    return this.quotesRepository.findOne({ where: { id } });
  }

  /** End of "today" in Moscow, as UTC instant — published quotes up to this day. */
  private endOfTodayMoscow(): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: MOSCOW_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const month = parts.find((p) => p.type === 'month')?.value ?? '01';
    const day = parts.find((p) => p.type === 'day')?.value ?? '01';

    // 23:59:59.999 Moscow ≈ next calendar day 00:00 Moscow minus 1ms
    // Represent as noon Moscow of that day + 12h - 1ms via offset parse:
    // Use Date from ISO with explicit +03:00 (Moscow has no DST).
    return new Date(`${year}-${month}-${day}T23:59:59.999+03:00`);
  }

  private startOfTodayMoscow(): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: MOSCOW_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const month = parts.find((p) => p.type === 'month')?.value ?? '01';
    const day = parts.find((p) => p.type === 'day')?.value ?? '01';

    return new Date(`${year}-${month}-${day}T00:00:00.000+03:00`);
  }

  async findPublishedPage(page = 1, limit = 10): Promise<QuotesPage> {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
    const until = this.endOfTodayMoscow();

    const [items, total] = await this.quotesRepository.findAndCount({
      where: {
        status: QuoteStatus.PUBLISHED,
        publishedAt: LessThanOrEqual(until),
      },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      hasMore: safePage * safeLimit < total,
    };
  }

  async findToday(): Promise<Quote | null> {
    const start = this.startOfTodayMoscow();
    const end = this.endOfTodayMoscow();

    return this.quotesRepository
      .createQueryBuilder('quote')
      .where('quote.status = :status', { status: QuoteStatus.PUBLISHED })
      .andWhere('quote.published_at IS NOT NULL')
      .andWhere('quote.published_at >= :start', { start })
      .andWhere('quote.published_at <= :end', { end })
      .orderBy('quote.published_at', 'DESC')
      .addOrderBy('quote.created_at', 'DESC')
      .getOne();
  }

  private parsePublishedAt(value?: string | null): Date | null {
    if (value === undefined) {
      return null;
    }
    if (value === null || value.trim() === '') {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  async create(data: CreateQuoteDto): Promise<Quote> {
    const body = data.body.trim();
    const author = data.author?.trim() || null;
    const publish = data.publish === true;
    let publishedAt = this.parsePublishedAt(data.publishedAt ?? undefined);

    if (publish && !publishedAt) {
      publishedAt = new Date();
    }

    const quote = this.quotesRepository.create({
      body,
      author,
      status: publish ? QuoteStatus.PUBLISHED : QuoteStatus.DRAFT,
      publishedAt,
    });

    return this.quotesRepository.save(quote);
  }

  async update(id: string, data: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.findById(id);
    if (!quote) {
      throw new NotFoundException('Цитата не найдена');
    }

    if (data.body !== undefined) {
      quote.body = data.body.trim();
    }

    if (data.author !== undefined) {
      quote.author = data.author?.trim() || null;
    }

    if (data.publishedAt !== undefined) {
      quote.publishedAt = this.parsePublishedAt(data.publishedAt);
    }

    return this.quotesRepository.save(quote);
  }

  async publish(id: string): Promise<Quote> {
    const quote = await this.findById(id);
    if (!quote) {
      throw new NotFoundException('Цитата не найдена');
    }

    quote.status = QuoteStatus.PUBLISHED;
    quote.publishedAt = quote.publishedAt ?? new Date();
    return this.quotesRepository.save(quote);
  }

  async unpublish(id: string): Promise<Quote> {
    const quote = await this.findById(id);
    if (!quote) {
      throw new NotFoundException('Цитата не найдена');
    }

    quote.status = QuoteStatus.DRAFT;
    return this.quotesRepository.save(quote);
  }

  async remove(id: string): Promise<void> {
    const quote = await this.findById(id);
    if (!quote) {
      throw new NotFoundException('Цитата не найдена');
    }

    await this.quotesRepository.remove(quote);
  }
}
