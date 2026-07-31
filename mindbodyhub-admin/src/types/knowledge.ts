export const KnowledgeStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type KnowledgeStatus =
  (typeof KnowledgeStatus)[keyof typeof KnowledgeStatus];

export type KnowledgeHeadingBlock = {
  id: string;
  type: 'heading';
  text: string;
};

export type KnowledgeSubheadingBlock = {
  id: string;
  type: 'subheading';
  text: string;
  /** Visual/semantic size: 2 = H2, 3 = H3 (default) */
  level?: 2 | 3;
};

export type KnowledgeParagraphBlock = {
  id: string;
  type: 'paragraph';
  /** Inline: **bold**, [label](url) */
  text: string;
};

export type KnowledgeImageBlock = {
  id: string;
  type: 'image';
  key: string;
  url: string;
  alt: string;
  /** Show alt text as visible caption under the image */
  showAlt?: boolean;
};

export type KnowledgeLinkBlock = {
  id: string;
  type: 'link';
  text: string;
  url: string;
};

export type KnowledgeListBlock = {
  id: string;
  type: 'list';
  style: 'ul' | 'ol';
  items: string[];
};

export type KnowledgeQuoteBlock = {
  id: string;
  type: 'quote';
  text: string;
  /** quote = blockquote; callout = highlighted tip */
  variant?: 'quote' | 'callout';
};

export type KnowledgeBlock =
  | KnowledgeHeadingBlock
  | KnowledgeSubheadingBlock
  | KnowledgeParagraphBlock
  | KnowledgeImageBlock
  | KnowledgeLinkBlock
  | KnowledgeListBlock
  | KnowledgeQuoteBlock;

export type KnowledgeArticle = {
  id: string;
  title: string;
  slug: string;
  status: KnowledgeStatus;
  blocks: KnowledgeBlock[];
  coverUrl: string | null;
  summary: string | null;
  showMetadata: boolean;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateKnowledgeArticlePayload = {
  title: string;
  slug?: string;
  summary?: string | null;
  coverUrl?: string | null;
  showMetadata?: boolean;
  blocks?: KnowledgeBlock[];
};

export type UpdateKnowledgeArticlePayload =
  Partial<CreateKnowledgeArticlePayload>;

export type UploadKnowledgeImageResult = {
  key: string;
  url: string;
  contentType: string;
};
