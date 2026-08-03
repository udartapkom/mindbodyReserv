import Link from "next/link";
import type { Problem } from "@/api/responsesTypes";
import styles from "./HomeSolutionsPreview.module.scss";

type HomeSolutionsPreviewProps = {
  materials: Problem[];
};

function HomeSolutionsPreview({ materials }: HomeSolutionsPreviewProps) {
  const preview = materials.slice(0, 4);

  return (
    <section
      className={styles.section}
      aria-labelledby="home-solutions-title"
    >
      <div className={styles.section__inner}>
        <h2 id="home-solutions-title" className={styles.section__title}>
          Готовые решения
        </h2>
        <p className={styles.section__lead}>
          Бесплатные материалы: разборы и практики, которые можно читать сразу.
        </p>

        {preview.length === 0 ? (
          <p className={styles.section__empty}>
            Пока нет опубликованных материалов.{" "}
            <Link href="/problems">Открыть раздел</Link>
          </p>
        ) : (
          <ul className={styles.section__list}>
            {preview.map((material) => (
              <li key={material.id}>
                <Link
                  className={styles.section__card}
                  href={`/problems/${material.slug}`}
                >
                  {material.coverUrl ? (
                    <img
                      className={styles.section__cover}
                      src={material.coverUrl}
                      alt=""
                    />
                  ) : (
                    <div
                      className={styles.section__coverPlaceholder}
                      aria-hidden
                    />
                  )}
                  <div className={styles.section__body}>
                    <h3 className={styles.section__cardTitle}>
                      {material.title}
                    </h3>
                    {material.summary ? (
                      <p className={styles.section__cardSummary}>
                        {material.summary}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link className={styles.section__cta} href="/problems">
          Все готовые решения
        </Link>
      </div>
    </section>
  );
}

export default HomeSolutionsPreview;
