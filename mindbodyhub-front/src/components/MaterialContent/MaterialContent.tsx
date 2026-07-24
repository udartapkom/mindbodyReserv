import type { KnowledgeBlock } from "@/types/knowledge";
import type { MaterialBlock } from "@/types/material";
import styles from "./MaterialContent.module.scss";

type ContentBlock = MaterialBlock | KnowledgeBlock;

type MaterialContentProps = {
  blocks: ContentBlock[];
};

function MaterialContent({ blocks }: MaterialContentProps) {
  if (blocks.length === 0) {
    return (
      <p className={styles.materialContent__empty}>Содержимое пока не добавлено.</p>
    );
  }

  return (
    <div className={styles.materialContent}>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={block.id} className={styles.materialContent__heading}>
                {block.text}
              </h2>
            );
          case "subheading": {
            const isH2 = block.level === 2;
            if (isH2) {
              return (
                <h2
                  key={block.id}
                  className={styles.materialContent__subheadingH2}
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3 key={block.id} className={styles.materialContent__subheading}>
                {block.text}
              </h3>
            );
          }
          case "paragraph":
            return (
              <p key={block.id} className={styles.materialContent__paragraph}>
                {block.text}
              </p>
            );
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
          case "link":
            return (
              <p key={block.id} className={styles.materialContent__paragraph}>
                <a
                  className={styles.materialContent__link}
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block.text || block.url}
                </a>
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default MaterialContent;
