import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { knowledge as knowledgeApi } from "@/api/api";
import MaterialReaderShell from "@/components/MaterialReaderShell/MaterialReaderShell";

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

  return (
    <MaterialReaderShell
      layout="site"
      document={{
        title: article.title,
        summary: article.summary,
        coverUrl: article.coverUrl,
        blocks: article.blocks,
        showMetadata: article.showMetadata,
        publishedAt: article.publishedAt,
      }}
      back={{ href: "/instructions", label: "← К списку инструкций" }}
      eyebrow="Инструкция"
    />
  );
}

export default InstructionPage;
