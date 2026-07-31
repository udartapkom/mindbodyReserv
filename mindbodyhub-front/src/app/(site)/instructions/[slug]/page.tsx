import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { knowledge as knowledgeApi } from "@/api/api";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import MaterialReadingMeta from "@/components/MaterialReadingMeta/MaterialReadingMeta";
import MaterialScrollAids from "@/components/MaterialScrollAids/MaterialScrollAids";
import MaterialShareButton from "@/components/MaterialShareButton/MaterialShareButton";
import MaterialToc from "@/components/MaterialToc/MaterialToc";
import { extractMaterialToc } from "@/utils/materialToc";
import {
  estimateReadingMinutes,
  formatPublishedAt,
  formatReadingTimeLabel,
} from "@/utils/readingTime";
import styles from "./page.module.scss";

/** Fetch article at request time so newly published content is visible. */
export const dynamic = "force-dynamic";

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

  const readingTimeLabel = formatReadingTimeLabel(
    estimateReadingMinutes(article.blocks),
  );
  const publishedLabel =
    article.showMetadata !== false
      ? formatPublishedAt(article.publishedAt)
      : null;

  return (
    <div className={styles.page}>
      <MaterialScrollAids />
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
          {article.showMetadata !== false ? (
            <p className={styles.page__eyebrow}>Инструкция</p>
          ) : null}
          <h1 className={styles.page__title}>{article.title}</h1>
          <div className={styles.page__metaRow}>
            <MaterialReadingMeta
              readingTimeLabel={readingTimeLabel}
              publishedLabel={publishedLabel}
              publishedDateTime={article.publishedAt}
            />
            <MaterialShareButton
              title={article.title}
              text={article.summary}
            />
          </div>
          {article.showMetadata !== false && article.summary ? (
            <p className={styles.page__summary}>{article.summary}</p>
          ) : null}
        </header>

        <div className={styles.page__divider} />

        <div className={styles.page__body}>
          <MaterialToc
            items={extractMaterialToc(article.blocks)}
            className={styles.page__toc}
          />
          <MaterialContent blocks={article.blocks} />
        </div>
      </article>
    </div>
  );
}

export default InstructionPage;
