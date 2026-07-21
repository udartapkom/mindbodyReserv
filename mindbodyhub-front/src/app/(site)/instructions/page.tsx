import type { Metadata } from "next";
import Link from "next/link";
import { knowledge as knowledgeApi } from "@/api/api";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "База знаний",
  description: "Инструкции и полезные материалы MindBodyHub",
};

async function getArticles() {
  try {
    return await knowledgeApi.getArticles();
  } catch {
    return [];
  }
}

async function InstructionsPage() {
  const articles = await getArticles();

  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>База знаний</h1>
      <p className={styles.page__lead}>
        Инструкции и ответы на частые вопросы по работе с сервисом.
      </p>

      {articles.length === 0 ? (
        <p className={styles.page__empty}>Пока нет опубликованных инструкций.</p>
      ) : (
        <ul className={styles.page__list}>
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                className={styles.page__card}
                href={`/instructions/${article.slug}`}
              >
                {article.coverUrl ? (
                  <img
                    className={styles.page__cover}
                    src={article.coverUrl}
                    alt=""
                  />
                ) : null}
                <div className={styles.page__body}>
                  <h2 className={styles.page__cardTitle}>{article.title}</h2>
                  {article.summary ? (
                    <p className={styles.page__cardSummary}>{article.summary}</p>
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

export default InstructionsPage;
