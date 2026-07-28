import { notFound } from 'next/navigation';
import {
  isPaidMaterialShelf,
  type PaidMaterialShelf,
} from '@/utils/materialAccess';
import MaterialsShelfContent from './MaterialsShelfContent';

type PageProps = {
  params: Promise<{ tariff: string }>;
};

export default async function CabinetMaterialsShelfPage({ params }: PageProps) {
  const { tariff } = await params;
  if (!isPaidMaterialShelf(tariff)) {
    notFound();
  }

  return <MaterialsShelfContent tariff={tariff as PaidMaterialShelf} />;
}
