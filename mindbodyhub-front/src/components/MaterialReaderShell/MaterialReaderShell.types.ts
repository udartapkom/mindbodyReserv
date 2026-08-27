import type { ContentBlock } from "@/utils/materialToc";
import type { AdjacentMaterialLink } from "@/components/MaterialAdjacentNav/MaterialAdjacentNav";

export type MaterialReaderDocument = {
  /** When set, scroll progress is saved for logged-in users. */
  id?: string;
  title: string;
  summary: string | null;
  coverUrl: string | null;
  blocks: ContentBlock[];
  showMetadata: boolean;
  publishedAt: string | null;
};

export type MaterialReaderBackLink = {
  href: string;
  label: string;
};

export type MaterialReaderAdjacent = {
  prev: AdjacentMaterialLink | null;
  next: AdjacentMaterialLink | null;
};

export type MaterialReaderShellProps = {
  document: MaterialReaderDocument;
  back: MaterialReaderBackLink;
  /** Access / section label under showMetadata; null hides the eyebrow. */
  eyebrow?: string | null;
  adjacent?: MaterialReaderAdjacent | null;
  /** Site pages use paper page-surface; cabinet is a compact column. */
  layout?: "site" | "cabinet";
  scrollAids?: {
    materialId?: string;
    offsetForCabinetNav?: boolean;
  };
  /** Default true. Insights omit TOC («Содержание»). */
  showToc?: boolean;
  /** Default true. Insights omit reading-progress chrome. */
  enableScrollAids?: boolean;
  className?: string;
};
