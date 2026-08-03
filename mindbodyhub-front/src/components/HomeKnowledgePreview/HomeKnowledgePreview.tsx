import Link from "next/link";
import type { KnowledgeArticle } from "@/types/knowledge";
import styles from "./HomeKnowledgePreview.module.scss";

type HomeKnowledgePreviewProps = {
  articles: KnowledgeArticle[];
};

function HomeKnowledgePreview({ articles }: HomeKnowledgePreviewProps) {
  const preview = articles.slice(0, 3);

  return (
    <section
      className={styles.section}
      aria-labelledby="home-knowledge-title"
    >
      <div className={styles.section__inner}>
        <h2 id="home-knowledge-title" className={styles.section__title}>
          База знаний
        </h2>
        <p className={styles.section__lead}>
          Инструкции и ответы по работе с сервисом — чтобы быстрее сориентироваться.
        </p>

        {preview.length === 0 ? (
          <p className={styles.section__empty}>
            Пока нет опубликованных инструкций.{" "}
            <Link href="/instructions">Открыть раздел</Link>
          </p>
        ) : (
          <ul className={styles.section__list}>
            {preview.map((article) => (
              <li key={article.id}>
                <Link
                  className={styles.section__card}
                  href={`/instructions/${article.slug}`}
                >
                  {article.coverUrl ? (
                    <img
                      className={styles.section__cover}
                      src={article.coverUrl}
                      alt=""
                    />
                  ) : null}
                  <div className={styles.section__body}>
                    <h3 className={styles.section__cardTitle}>
                      {article.title}
                    </h3>
                    {article.summary ? (
                      <p className={styles.section__cardSummary}>
                        {article.summary}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link className={styles.section__cta} href="/instructions">
          Вся база знаний
        </Link>
      </div>
    </section>
  );
}

export default HomeKnowledgePreview;
