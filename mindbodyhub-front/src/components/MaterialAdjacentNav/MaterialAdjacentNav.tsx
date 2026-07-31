import Link from "next/link";
import styles from "./MaterialAdjacentNav.module.scss";

export type AdjacentMaterialLink = {
  slug: string;
  title: string;
  href: string;
};

type MaterialAdjacentNavProps = {
  prev: AdjacentMaterialLink | null;
  next: AdjacentMaterialLink | null;
  className?: string;
};

function MaterialAdjacentNav({ prev, next, className }: MaterialAdjacentNavProps) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      className={[styles.adjacentNav, className].filter(Boolean).join(" ")}
      aria-label="Соседние материалы"
    >
      {prev ? (
        <Link className={styles.adjacentNav__link} href={prev.href}>
          <span className={styles.adjacentNav__label}>← Предыдущий</span>
          <span className={styles.adjacentNav__title}>{prev.title}</span>
        </Link>
      ) : (
        <span className={styles.adjacentNav__placeholder} />
      )}

      {next ? (
        <Link
          className={`${styles.adjacentNav__link} ${styles.adjacentNav__link_next}`}
          href={next.href}
        >
          <span className={styles.adjacentNav__label}>Следующий →</span>
          <span className={styles.adjacentNav__title}>{next.title}</span>
        </Link>
      ) : (
        <span className={styles.adjacentNav__placeholder} />
      )}
    </nav>
  );
}

export default MaterialAdjacentNav;
