import type { Metadata } from "next";
import ProblemsPageContent from "./ProblemsPageContent";

type ProblemsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProblemsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
  };
}

async function ProblemsPage({ params }: ProblemsPageProps) {
  const { slug } = await params;
  return <ProblemsPageContent slug={slug} />;
}

export default ProblemsPage;
