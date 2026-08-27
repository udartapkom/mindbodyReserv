import type { MaterialBlock } from "@/types/material";

/** Same block shape as materials/knowledge — short weekly pieces. */
export type InsightBlock = MaterialBlock;

export type InsightListItem = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
};

export type Insight = {
  id: string;
  title: string;
  slug: string;
  status: string;
  blocks: InsightBlock[];
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type InsightsPageResponse = {
  items: InsightListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
