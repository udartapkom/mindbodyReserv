import type { ContentBlock } from "@/utils/materialToc";
import { extractMaterialToc } from "@/utils/materialToc";
import { renderInlineMarkdown } from "@/utils/inlineMarkdown";
import styles from "./MaterialContent.module.scss";

type MaterialContentProps = {
  blocks: ContentBlock[];
};

function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

function MaterialContent({ blocks }: MaterialContentProps) {
  if (blocks.length === 0) {
    return (
      <p className={styles.materialContent__empty}>Содержимое пока не добавлено.</p>
    );
  }

  const toc = extractMaterialToc(blocks);
  const anchorByBlockId = new Map(toc.map((item) => [item.blockId, item.id]));

  return (
    <div className={styles.materialContent}>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={block.id}
                id={anchorByBlockId.get(block.id)}
                className={styles.materialContent__heading}
              >
                {block.text}
              </h2>
            );
          case "subheading": {
            const isH2 = block.level === 2;
            const anchorId = anchorByBlockId.get(block.id);
            if (isH2) {
              return (
                <h2
                  key={block.id}
                  id={anchorId}
                  className={styles.materialContent__subheadingH2}
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={block.id}
                id={anchorId}
                className={styles.materialContent__subheading}
              >
                {block.text}
              </h3>
            );
          }
          case "paragraph":
            return (
              <p key={block.id} className={styles.materialContent__paragraph}>
                {renderInlineMarkdown(block.text, styles.materialContent__link)}
              </p>
            );
          case "list": {
            const items = block.items.filter((item) => item.trim().length > 0);
            if (items.length === 0) return null;
            const ListTag = block.style === "ol" ? "ol" : "ul";
            return (
              <ListTag
                key={block.id}
                className={
                  block.style === "ol"
                    ? styles.materialContent__listOl
                    : styles.materialContent__listUl
                }
              >
                {items.map((item, index) => (
                  <li key={`${block.id}-${index}`} className={styles.materialContent__listItem}>
                    {renderInlineMarkdown(item, styles.materialContent__link)}
                  </li>
                ))}
              </ListTag>
            );
          }
          case "quote": {
            const isCallout = block.variant === "callout";
            if (isCallout) {
              return (
                <aside
                  key={block.id}
                  className={styles.materialContent__callout}
                >
                  {renderInlineMarkdown(block.text, styles.materialContent__link)}
                </aside>
              );
            }
            return (
              <blockquote
                key={block.id}
                className={styles.materialContent__quote}
              >
                {renderInlineMarkdown(block.text, styles.materialContent__link)}
              </blockquote>
            );
          }
          case "image":
            return (
              <figure key={block.id} className={styles.materialContent__figure}>
                <img
                  className={styles.materialContent__image}
                  src={block.url}
                  alt={block.alt || ""}
                  loading="lazy"
                />
                {block.alt && block.showAlt !== false ? (
                  <figcaption className={styles.materialContent__caption}>
                    {block.alt}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "link": {
            const external = isExternalHref(block.url);
            return (
              <p key={block.id} className={styles.materialContent__paragraph}>
                <a
                  className={styles.materialContent__link}
                  href={block.url}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {block.text || block.url}
                </a>
              </p>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

export default MaterialContent;
