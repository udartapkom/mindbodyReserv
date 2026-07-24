import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { KnowledgeBlock, KnowledgeStatus } from './knowledge.types';

export type KnowledgeArticleDto = {
  id: string;
  title: string;
  slug: string;
  status: KnowledgeStatus;
  blocks: KnowledgeBlock[];
  coverUrl: string | null;
  summary: string | null;
  showMetadata: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toKnowledgeArticleDto(
  article: KnowledgeArticle,
): KnowledgeArticleDto {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    status: article.status,
    blocks: article.blocks ?? [],
    coverUrl: article.coverUrl,
    summary: article.summary,
    showMetadata: article.showMetadata !== false,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}
