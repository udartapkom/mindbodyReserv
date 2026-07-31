import type { KnowledgeBlock } from "@/types/knowledge";
import type { MaterialBlock } from "@/types/material";

export type ContentBlock = MaterialBlock | KnowledgeBlock;

export type MaterialTocItem = {
  blockId: string;
  id: string;
  text: string;
  /** 2 = heading / subheading level 2, 3 = subheading level 3 */
  level: 2 | 3;
};

export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

/** Build unique anchor ids for heading-like blocks (stable order). */
export function extractMaterialToc(blocks: ContentBlock[]): MaterialTocItem[] {
  const used = new Map<string, number>();
  const items: MaterialTocItem[] = [];

  for (const block of blocks) {
    if (block.type !== "heading" && block.type !== "subheading") {
      continue;
    }

    const text = block.text.trim();
    if (!text) continue;

    const level: 2 | 3 =
      block.type === "heading" ? 2 : block.level === 2 ? 2 : 3;

    const base = slugifyHeading(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;

    items.push({
      blockId: block.id,
      id,
      text,
      level,
    });
  }

  return items;
}

export function getAdjacentMaterials<T extends { slug: string }>(
  items: T[],
  currentSlug: string,
): { prev: T | null; next: T | null } {
  const index = items.findIndex((item) => item.slug === currentSlug);
  if (index < 0) {
    return { prev: null, next: null };
  }

  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}
