export const InsightStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type InsightStatus =
  (typeof InsightStatus)[keyof typeof InsightStatus];

export type InsightHeadingBlock = {
  id: string;
  type: 'heading';
  text: string;
};

export type InsightSubheadingBlock = {
  id: string;
  type: 'subheading';
  text: string;
  /** Visual/semantic size: 2 = H2, 3 = H3 (default) */
  level?: 2 | 3;
};

export type InsightParagraphBlock = {
  id: string;
  type: 'paragraph';
  /** Inline: **bold**, [label](url) */
  text: string;
};

export type InsightImageBlock = {
  id: string;
  type: 'image';
  key: string;
  url: string;
  alt: string;
  /** Show alt text as visible caption under the image */
  showAlt?: boolean;
};

export type InsightLinkBlock = {
  id: string;
  type: 'link';
  text: string;
  url: string;
};

export type InsightListBlock = {
  id: string;
  type: 'list';
  style: 'ul' | 'ol';
  items: string[];
};

export type InsightQuoteBlock = {
  id: string;
  type: 'quote';
  text: string;
  /** quote = blockquote; callout = highlighted tip */
  variant?: 'quote' | 'callout';
};

export type InsightBlock =
  | InsightHeadingBlock
  | InsightSubheadingBlock
  | InsightParagraphBlock
  | InsightImageBlock
  | InsightLinkBlock
  | InsightListBlock
  | InsightQuoteBlock;

export type Insight = {
  id: string;
  title: string;
  slug: string;
  status: InsightStatus;
  blocks: InsightBlock[];
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInsightPayload = {
  title: string;
  slug?: string;
  blocks?: InsightBlock[];
  publishedAt?: string | null;
  publish?: boolean;
};

export type UpdateInsightPayload = {
  title?: string;
  slug?: string;
  blocks?: InsightBlock[];
  publishedAt?: string | null;
};

export type UploadInsightImageResult = {
  key: string;
  url: string;
  contentType: string;
};
