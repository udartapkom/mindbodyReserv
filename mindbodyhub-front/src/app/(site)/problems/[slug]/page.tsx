import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { problems as problemsApi } from "@/api/api";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import styles from "./page.module.scss";

type ProblemsPageProps = {
  params: Promise<{ slug: string }>;
};

async function getMaterial(slug: string) {
  try {
    return await problemsApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProblemsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const material = await getMaterial(slug);

  if (!material) {
    return { title: "Материал не найден" };
  }

  return {
    title: material.title,
    description: material.summary ?? undefined,
  };
}

async function ProblemsPage({ params }: ProblemsPageProps) {
  const { slug } = await params;
  const material = await getMaterial(slug);

  if (!material) {
    notFound();
  }

  return (
    <article className={styles.page}>
      {material.coverUrl ? (
        <img
          className={styles.page__cover}
          src={material.coverUrl}
          alt={material.title}
        />
      ) : null}

      <h1 className={styles.page__title}>{material.title}</h1>

      {material.summary ? (
        <p className={styles.page__summary}>{material.summary}</p>
      ) : null}

      <div className={styles.page__content}>
        <MaterialContent blocks={material.blocks} />
      </div>
    </article>
  );
}

export default ProblemsPage;
