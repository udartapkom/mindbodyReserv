import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { Insight } from './entities/insight.entity';
import { InsightStatus } from './insight.types';
import { normalizeInsightBlocks, slugify } from './insight.utils';

const MOSCOW_TZ = 'Europe/Moscow';

export type InsightsPage = {
  items: Insight[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Insight)
    private readonly insightsRepository: Repository<Insight>,
  ) {}

  findAll(): Promise<Insight[]> {
    return this.insightsRepository.find({
      order: { publishedAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Insight | null> {
    return this.insightsRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Insight | null> {
    return this.insightsRepository.findOne({ where: { slug } });
  }

  /** End of "today" in Moscow — published insights up to this day. */
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

  private async ensureUniqueSlug(
    base: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = slugify(base);
    let attempt = 0;

    while (true) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
      const existing = await this.findBySlug(candidate);

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      attempt += 1;
    }
  }

  async findPublishedPage(page = 1, limit = 10): Promise<InsightsPage> {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
    const until = this.endOfTodayMoscow();

    const [items, total] = await this.insightsRepository.findAndCount({
      where: {
        status: InsightStatus.PUBLISHED,
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

  async findPublishedBySlug(slug: string): Promise<Insight | null> {
    const insight = await this.findBySlug(slug);
    if (!insight || insight.status !== InsightStatus.PUBLISHED) {
      return null;
    }
    if (!insight.publishedAt) {
      return null;
    }
    if (insight.publishedAt > this.endOfTodayMoscow()) {
      return null;
    }
    return insight;
  }

  /** Insight whose publishedAt falls on today's Moscow calendar day. */
  async findToday(): Promise<Insight | null> {
    const start = this.startOfTodayMoscow();
    const end = this.endOfTodayMoscow();

    return this.insightsRepository
      .createQueryBuilder('insight')
      .where('insight.status = :status', { status: InsightStatus.PUBLISHED })
      .andWhere('insight.published_at IS NOT NULL')
      .andWhere('insight.published_at >= :start', { start })
      .andWhere('insight.published_at <= :end', { end })
      .orderBy('insight.published_at', 'DESC')
      .addOrderBy('insight.created_at', 'DESC')
      .getOne();
  }

  async create(data: CreateInsightDto): Promise<Insight> {
    const title = data.title.trim();
    const slug = await this.ensureUniqueSlug(data.slug?.trim() || title);
    const blocks =
      data.blocks !== undefined ? normalizeInsightBlocks(data.blocks) : [];
    const publish = data.publish === true;
    let publishedAt = this.parsePublishedAt(data.publishedAt ?? undefined);

    if (publish && !publishedAt) {
      publishedAt = new Date();
    }

    const insight = this.insightsRepository.create({
      title,
      slug,
      blocks,
      status: publish ? InsightStatus.PUBLISHED : InsightStatus.DRAFT,
      publishedAt,
    });

    return this.insightsRepository.save(insight);
  }

  async update(id: string, data: UpdateInsightDto): Promise<Insight> {
    const insight = await this.findById(id);
    if (!insight) {
      throw new NotFoundException('Инсайт не найден');
    }

    if (data.title !== undefined) {
      insight.title = data.title.trim();
    }

    if (data.slug !== undefined) {
      const nextSlug = await this.ensureUniqueSlug(data.slug.trim(), id);
      const conflict = await this.findBySlug(nextSlug);
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Slug "${nextSlug}" уже занят`);
      }
      insight.slug = nextSlug;
    }

    if (data.blocks !== undefined) {
      insight.blocks = normalizeInsightBlocks(data.blocks);
    }

    if (data.publishedAt !== undefined) {
      insight.publishedAt = this.parsePublishedAt(data.publishedAt);
    }

    return this.insightsRepository.save(insight);
  }

  async publish(id: string): Promise<Insight> {
    const insight = await this.findById(id);
    if (!insight) {
      throw new NotFoundException('Инсайт не найден');
    }

    insight.status = InsightStatus.PUBLISHED;
    insight.publishedAt = insight.publishedAt ?? new Date();
    return this.insightsRepository.save(insight);
  }

  async unpublish(id: string): Promise<Insight> {
    const insight = await this.findById(id);
    if (!insight) {
      throw new NotFoundException('Инсайт не найден');
    }

    insight.status = InsightStatus.DRAFT;
    return this.insightsRepository.save(insight);
  }

  async remove(id: string): Promise<void> {
    const insight = await this.findById(id);
    if (!insight) {
      throw new NotFoundException('Инсайт не найден');
    }

    await this.insightsRepository.remove(insight);
  }
}
