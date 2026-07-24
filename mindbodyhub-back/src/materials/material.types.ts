export type MaterialBlockType = 'heading' | 'subheading' | 'paragraph' | 'image';

export {
  FREE_ACCESS_TYPE,
  REGISTERED_ACCESS_TYPE,
} from '../common/tariff/access.types';

export type MaterialHeadingBlock = {
  id: string;
  type: 'heading';
  text: string;
};

export type MaterialSubheadingBlock = {
  id: string;
  type: 'subheading';
  text: string;
  /** Visual/semantic size: 2 = H2, 3 = H3 (default) */
  level?: 2 | 3;
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
  /** Show alt text as visible caption under the image */
  showAlt?: boolean;
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
