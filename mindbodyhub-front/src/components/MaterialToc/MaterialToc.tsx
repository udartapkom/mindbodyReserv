import type { MaterialTocItem } from "@/utils/materialToc";
import styles from "./MaterialToc.module.scss";

type MaterialTocProps = {
  items: MaterialTocItem[];
  className?: string;
};

function MaterialToc({ items, className }: MaterialTocProps) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav
      className={[styles.materialToc, className].filter(Boolean).join(" ")}
      aria-label="Оглавление"
    >
      <p className={styles.materialToc__title}>Содержание</p>
      <ol className={styles.materialToc__list}>
        {items.map((item) => (
          <li
            key={item.blockId}
            className={
              item.level === 3
                ? `${styles.materialToc__item} ${styles.materialToc__item_nested}`
                : styles.materialToc__item
            }
          >
            <a className={styles.materialToc__link} href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default MaterialToc;
