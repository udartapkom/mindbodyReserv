import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { knowledge as knowledgeApi } from "@/api/api";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import styles from "./page.module.scss";

type InstructionPageProps = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
  try {
    return await knowledgeApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: InstructionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Инструкция не найдена" };
  }

  return {
    title: article.title,
    description: article.summary ?? undefined,
  };
}

async function InstructionPage({ params }: InstructionPageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.page__backWrap}>
        <Link className={styles.page__back} href="/instructions">
          ← К списку инструкций
        </Link>
      </div>

      <article className={styles.page__shell}>
        {article.coverUrl ? (
          <div className={styles.page__hero}>
            <img
              className={styles.page__cover}
              src={article.coverUrl}
              alt=""
            />
          </div>
        ) : null}

        <header className={styles.page__header}>
          <p className={styles.page__eyebrow}>Инструкция</p>
          <h1 className={styles.page__title}>{article.title}</h1>
          {article.summary ? (
            <p className={styles.page__summary}>{article.summary}</p>
          ) : null}
        </header>

        <div className={styles.page__divider} />

        <div className={styles.page__body}>
          <MaterialContent blocks={article.blocks} />
        </div>
      </article>
    </div>
  );
}

export default InstructionPage;
