import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  isCabinetMaterialShelf,
  type CabinetMaterialShelf,
} from '@/utils/materialAccess';
import MaterialDetailContent from './MaterialDetailContent';

type PageProps = {
  params: Promise<{ tariff: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function CabinetMaterialDetailPage({ params }: PageProps) {
  const { tariff, slug } = await params;
  if (!isCabinetMaterialShelf(tariff)) {
    notFound();
  }

  return (
    <MaterialDetailContent
      tariff={tariff as CabinetMaterialShelf}
      slug={slug}
    />
  );
}
