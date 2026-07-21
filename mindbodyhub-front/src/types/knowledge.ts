export type KnowledgeHeadingBlock = {
  id: string;
  type: "heading";
  text: string;
};

export type KnowledgeSubheadingBlock = {
  id: string;
  type: "subheading";
  text: string;
};

export type KnowledgeParagraphBlock = {
  id: string;
  type: "paragraph";
  text: string;
};

export type KnowledgeImageBlock = {
  id: string;
  type: "image";
  key: string;
  url: string;
  alt: string;
};

export type KnowledgeLinkBlock = {
  id: string;
  type: "link";
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
  status: string;
  blocks: KnowledgeBlock[];
  coverUrl: string | null;
  summary: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
