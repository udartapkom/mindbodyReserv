export type MaterialHeadingBlock = {
  id: string;
  type: "heading";
  text: string;
};

export type MaterialSubheadingBlock = {
  id: string;
  type: "subheading";
  text: string;
};

export type MaterialParagraphBlock = {
  id: string;
  type: "paragraph";
  text: string;
};

export type MaterialImageBlock = {
  id: string;
  type: "image";
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
  status: string;
  tariffType: string;
  blocks: MaterialBlock[];
  coverUrl: string | null;
  summary: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const FREE_ACCESS_TYPE = "free";
export const REGISTERED_ACCESS_TYPE = "registered";
