import type { ContentBlock } from "@/utils/materialToc";
import { stripInlineMarkdown } from "@/utils/inlineMarkdown";

const WORDS_PER_MINUTE = 190;

function blockText(block: ContentBlock): string {
  switch (block.type) {
    case "heading":
    case "subheading":
    case "paragraph":
    case "quote":
      return stripInlineMarkdown(block.text);
    case "list":
      return block.items.map(stripInlineMarkdown).join(" ");
    case "link":
      return block.text || "";
    case "image":
      return block.showAlt === false ? "" : block.alt || "";
    default:
      return "";
  }
}

export function countWordsInBlocks(blocks: ContentBlock[]): number {
  const text = blocks.map(blockText).join(" ");
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches?.length ?? 0;
}

/** Whole minutes, minimum 1 if there is any text. */
export function estimateReadingMinutes(
  blocks: ContentBlock[],
  wpm = WORDS_PER_MINUTE,
): number {
  const words = countWordsInBlocks(blocks);
  if (words === 0) return 0;
  return Math.max(1, Math.ceil(words / wpm));
}

export function formatReadingTimeLabel(minutes: number): string | null {
  if (minutes <= 0) return null;
  return `~${minutes} мин`;
}

export function formatPublishedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
