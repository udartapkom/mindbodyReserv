import type { Metadata } from "next";
import Link from "next/link";
import { problems } from "@/api/api";
import { FREE_ACCESS_TYPE } from "@/types/material";
import styles from "./page.module.scss";

/** New free materials appear without waiting for a rebuild. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Готовые решения",
  description: "Бесплатные материалы и готовые решения MindBodyHub",
};

async function getFreeMaterials() {
  try {
    return await problems.getProblems(FREE_ACCESS_TYPE);
  } catch {
    return [];
  }
}

async function ProblemsCatalogPage() {
  const materials = await getFreeMaterials();

  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>Готовые решения</h1>
      <p className={styles.page__lead}>
        Бесплатные материалы: разборы и практики, которые можно читать сразу.
      </p>

      {materials.length === 0 ? (
        <p className={styles.page__empty}>Пока нет опубликованных материалов.</p>
      ) : (
        <ul className={styles.page__list}>
          {materials.map((material) => (
            <li key={material.id}>
              <Link
                className={styles.page__card}
                href={`/problems/${material.slug}`}
              >
                {material.coverUrl ? (
                  <img
                    className={styles.page__cover}
                    src={material.coverUrl}
                    alt=""
                  />
                ) : (
                  <div className={styles.page__coverPlaceholder} aria-hidden />
                )}
                <div className={styles.page__body}>
                  <h2 className={styles.page__cardTitle}>{material.title}</h2>
                  {material.summary ? (
                    <p className={styles.page__cardSummary}>{material.summary}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProblemsCatalogPage;
