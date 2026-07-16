export type MaterialBlockType = 'heading' | 'subheading' | 'paragraph' | 'image';

/** Access level when material is not bound to a paid tariff */
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

export enum MaterialStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
