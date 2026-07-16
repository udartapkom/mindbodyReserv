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
};

export type KnowledgeParagraphBlock = {
  id: string;
  type: 'paragraph';
  /** Inline links: [label](https://...) */
  text: string;
};

export type KnowledgeImageBlock = {
  id: string;
  type: 'image';
  key: string;
  url: string;
  alt: string;
};

export type KnowledgeLinkBlock = {
  id: string;
  type: 'link';
  text: string;
  url: string;
};

export type KnowledgeBlock =
  | KnowledgeHeadingBlock
  | KnowledgeSubheadingBlock
  | KnowledgeParagraphBlock
  | KnowledgeImageBlock
  | KnowledgeLinkBlock;

export type KnowledgeArticle = {
  id: string;
  title: string;
  slug: string;
  status: KnowledgeStatus;
  blocks: KnowledgeBlock[];
  coverUrl: string | null;
  summary: string | null;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateKnowledgeArticlePayload = {
  title: string;
  slug?: string;
  summary?: string | null;
  coverUrl?: string | null;
  blocks?: KnowledgeBlock[];
};

export type UpdateKnowledgeArticlePayload =
  Partial<CreateKnowledgeArticlePayload>;

export type UploadKnowledgeImageResult = {
  key: string;
  url: string;
  contentType: string;
};
