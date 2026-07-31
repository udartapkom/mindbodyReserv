import type { Metadata } from "next";
import { problems as problemsApi } from "@/api/api";
import ProblemsPageContent from "./ProblemsPageContent";

type ProblemsPageProps = {
  params: Promise<{ slug: string }>;
};

async function getMaterialTitle(slug: string): Promise<{
  title: string;
  description?: string;
} | null> {
  try {
    const material = await problemsApi.getBySlug(slug);
    return {
      title: material.title,
      description: material.summary ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProblemsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getMaterialTitle(slug);

  if (!meta) {
    return { title: "Материал не найден" };
  }

  return {
    title: meta.title,
    description: meta.description,
  };
}

async function ProblemsPage({ params }: ProblemsPageProps) {
  const { slug } = await params;
  return <ProblemsPageContent slug={slug} />;
}

export default ProblemsPage;
