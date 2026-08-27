import { Insight } from './entities/insight.entity';
import { InsightBlock, InsightStatus } from './insight.types';

export type InsightDto = {
  id: string;
  title: string;
  slug: string;
  status: InsightStatus;
  blocks: InsightBlock[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsightListItemDto = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date | null;
};

export function toInsightDto(insight: Insight): InsightDto {
  return {
    id: insight.id,
    title: insight.title,
    slug: insight.slug,
    status: insight.status,
    blocks: insight.blocks ?? [],
    publishedAt: insight.publishedAt,
    createdAt: insight.createdAt,
    updatedAt: insight.updatedAt,
  };
}

export function toInsightListItemDto(insight: Insight): InsightListItemDto {
  return {
    id: insight.id,
    title: insight.title,
    slug: insight.slug,
    publishedAt: insight.publishedAt,
  };
}
