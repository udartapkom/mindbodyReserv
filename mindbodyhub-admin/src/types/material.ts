export const MaterialStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type MaterialStatus = (typeof MaterialStatus)[keyof typeof MaterialStatus];

/** Public access when material is not bound to a paid tariff */
export const FREE_ACCESS_TYPE = 'free';

export type MaterialHeadingBlock = {
  id: string;
  type: 'heading';
  text: string;
};

export type MaterialSubheadingBlock = {
  id: string;
  type: 'subheading';
  text: string;
};

export type MaterialParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;
};

export type MaterialImageBlock = {
  id: string;
  type: 'image';
  key: string;
  url: string;
  alt: string;
};

export type MaterialBlock =
  | MaterialHeadingBlock
  | MaterialSubheadingBlock
  | MaterialParagraphBlock
  | MaterialImageBlock;

export type Material = {
  id: string;
  title: string;
  slug: string;
  status: MaterialStatus;
  tariffType: string;
  blocks: MaterialBlock[];
  coverUrl: string | null;
  summary: string | null;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateMaterialPayload = {
  title: string;
  slug?: string;
  tariffType?: string;
  summary?: string | null;
  coverUrl?: string | null;
  blocks?: MaterialBlock[];
};

export type UpdateMaterialPayload = Partial<CreateMaterialPayload>;

export type UploadMaterialImageResult = {
  key: string;
  url: string;
  contentType: string;
};
