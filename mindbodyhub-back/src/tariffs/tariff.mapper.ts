import { Tariff } from './entities/tariff.entity';

export type TariffDto = {
  id: string;
  type: string;
  title: string;
  titleColor: string | null;
  price: string;
  period: string;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toTariffDto(tariff: Tariff): TariffDto {
  return {
    id: tariff.id,
    type: tariff.type,
    title: tariff.title,
    titleColor: tariff.titleColor,
    price: tariff.price,
    period: tariff.period,
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
