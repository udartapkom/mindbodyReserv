export type KnowledgeBlockType =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'image'
  | 'link';

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
  /** Plain text; inline links as markdown: [label](https://...) */
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

export enum KnowledgeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
