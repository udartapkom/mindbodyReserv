import type { ReactNode } from "react";

const INLINE_RE = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\))/g;

function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

/** Strip lightweight markdown for word-count / plain-text uses. */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");
}

/** Render **bold** and [label](url) inside a text string. */
export function renderInlineMarkdown(
  text: string,
  linkClassName?: string,
): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  INLINE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      nodes.push(<strong key={`b-${key++}`}>{match[2]}</strong>);
    } else {
      const label = match[3] ?? "";
      const href = match[4] ?? "";
      const external = isExternalHref(href);
      nodes.push(
        <a
          key={`a-${key++}`}
          className={linkClassName}
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  if (nodes.length === 0) return text;
  if (nodes.length === 1) return nodes[0];
  return nodes;
}
