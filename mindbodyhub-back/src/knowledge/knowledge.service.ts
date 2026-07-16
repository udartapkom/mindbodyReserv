import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { UpdateKnowledgeArticleDto } from './dto/update-knowledge-article.dto';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { KnowledgeStatus } from './knowledge.types';
import { normalizeKnowledgeBlocks, slugify } from './knowledge.utils';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private readonly articlesRepository: Repository<KnowledgeArticle>,
  ) {}

  findAll(): Promise<KnowledgeArticle[]> {
    return this.articlesRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  findPublished(): Promise<KnowledgeArticle[]> {
    return this.articlesRepository.find({
      where: { status: KnowledgeStatus.PUBLISHED },
      order: { publishedAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<KnowledgeArticle | null> {
    return this.articlesRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<KnowledgeArticle | null> {
    return this.articlesRepository.findOne({ where: { slug } });
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

  async create(data: CreateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    const title = data.title.trim();
    const slug = await this.ensureUniqueSlug(data.slug?.trim() || title);
    const blocks =
      data.blocks !== undefined ? normalizeKnowledgeBlocks(data.blocks) : [];

    const article = this.articlesRepository.create({
      title,
      slug,
      summary: data.summary?.trim() || null,
      coverUrl: data.coverUrl?.trim() || null,
      blocks,
      status: KnowledgeStatus.DRAFT,
      publishedAt: null,
    });

    return this.articlesRepository.save(article);
  }

  async update(
    id: string,
    data: UpdateKnowledgeArticleDto,
  ): Promise<KnowledgeArticle> {
    const article = await this.findById(id);
    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    if (data.title !== undefined) {
      article.title = data.title.trim();
    }

    if (data.slug !== undefined) {
      const nextSlug = await this.ensureUniqueSlug(data.slug.trim(), id);
      const conflict = await this.findBySlug(nextSlug);
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Slug "${nextSlug}" уже занят`);
      }
      article.slug = nextSlug;
    }

    if (data.summary !== undefined) {
      article.summary = data.summary?.trim() || null;
    }

    if (data.coverUrl !== undefined) {
      article.coverUrl = data.coverUrl?.trim() || null;
    }

    if (data.blocks !== undefined) {
      article.blocks = normalizeKnowledgeBlocks(data.blocks);
    }

    return this.articlesRepository.save(article);
  }

  async publish(id: string): Promise<KnowledgeArticle> {
    const article = await this.findById(id);
    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    article.status = KnowledgeStatus.PUBLISHED;
    article.publishedAt = article.publishedAt ?? new Date();
    return this.articlesRepository.save(article);
  }

  async unpublish(id: string): Promise<KnowledgeArticle> {
    const article = await this.findById(id);
    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    article.status = KnowledgeStatus.DRAFT;
    return this.articlesRepository.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findById(id);
    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    await this.articlesRepository.remove(article);
  }
}
