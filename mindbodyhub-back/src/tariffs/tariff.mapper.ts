import { Tariff } from './entities/tariff.entity';
import { TariffComparisonRow } from './entities/tariff-comparison-row.entity';

export type TariffDto = {
  id: string;
  type: string;
  title: string;
  titleColor: string | null;
  price: string;
  priceAmount: number | null;
  period: string;
  durationDays: number;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TariffComparisonRowDto = {
  id: string;
  feature: string;
  included: Record<string, boolean>;
  sortOrder: number;
};

export type TariffComparisonDto = {
  rows: TariffComparisonRowDto[];
};

export function toTariffDto(tariff: Tariff): TariffDto {
  return {
    id: tariff.id,
    type: tariff.type,
    title: tariff.title,
    titleColor: tariff.titleColor,
    price: tariff.price,
    priceAmount: tariff.priceAmount ?? null,
    period: tariff.period,
    durationDays: tariff.durationDays ?? 30,
    subTitle: tariff.subTitle,
    description: tariff.description ?? [],
    image: tariff.image,
    imageAlt: tariff.imageAlt,
    sortOrder: tariff.sortOrder,
    isActive: tariff.isActive,
    createdAt: tariff.createdAt,
    updatedAt: tariff.updatedAt,
  };
}

export function toTariffComparisonRowDto(
  row: TariffComparisonRow,
): TariffComparisonRowDto {
  return {
    id: row.id,
    feature: row.feature,
    included: row.included ?? {},
    sortOrder: row.sortOrder,
  };
}
