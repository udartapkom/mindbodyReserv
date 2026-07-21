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
    <article className={styles.page}>
      <Link className={styles.page__back} href="/instructions">
        ← К списку инструкций
      </Link>

      {article.coverUrl ? (
        <img
          className={styles.page__cover}
          src={article.coverUrl}
          alt={article.title}
        />
      ) : null}

      <h1 className={styles.page__title}>{article.title}</h1>

      {article.summary ? (
        <p className={styles.page__summary}>{article.summary}</p>
      ) : null}

      <div className={styles.page__content}>
        <MaterialContent blocks={article.blocks} />
      </div>
    </article>
  );
}

export default InstructionPage;
