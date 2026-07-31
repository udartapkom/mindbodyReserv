export type MaterialHeadingBlock = {
  id: string;
  type: "heading";
  text: string;
};

export type MaterialSubheadingBlock = {
  id: string;
  type: "subheading";
  text: string;
  /** Visual/semantic size: 2 = H2, 3 = H3 (default) */
  level?: 2 | 3;
};

export type MaterialParagraphBlock = {
  id: string;
  type: "paragraph";
  /** Plain text; inline: **bold**, [label](url) */
  text: string;
};

export type MaterialImageBlock = {
  id: string;
  type: "image";
  key: string;
  url: string;
  alt: string;
  /** Show alt text as visible caption under the image */
  showAlt?: boolean;
};

export type MaterialListBlock = {
  id: string;
  type: "list";
  style: "ul" | "ol";
  items: string[];
};

export type MaterialQuoteBlock = {
  id: string;
  type: "quote";
  text: string;
  /** quote = blockquote; callout = highlighted tip */
  variant?: "quote" | "callout";
};

export type MaterialLinkBlock = {
  id: string;
  type: "link";
  text: string;
  url: string;
};

export type MaterialBlock =
  | MaterialHeadingBlock
  | MaterialSubheadingBlock
  | MaterialParagraphBlock
  | MaterialImageBlock
  | MaterialListBlock
  | MaterialQuoteBlock
  | MaterialLinkBlock;

export type Material = {
  id: string;
  title: string;
  slug: string;
  status: string;
  tariffType: string;
  blocks: MaterialBlock[];
  coverUrl: string | null;
  summary: string | null;
  showMetadata: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const FREE_ACCESS_TYPE = "free";
export const REGISTERED_ACCESS_TYPE = "registered";
