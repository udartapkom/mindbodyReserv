import { notFound } from 'next/navigation';
import {
  isCabinetMaterialShelf,
  type CabinetMaterialShelf,
} from '@/utils/materialAccess';
import MaterialsShelfContent from './MaterialsShelfContent';

type PageProps = {
  params: Promise<{ tariff: string }>;
};

export default async function CabinetMaterialsShelfPage({ params }: PageProps) {
  const { tariff } = await params;
  if (!isCabinetMaterialShelf(tariff)) {
    notFound();
  }

  return <MaterialsShelfContent tariff={tariff as CabinetMaterialShelf} />;
}
