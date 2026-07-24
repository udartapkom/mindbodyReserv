export type Tariff = {
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
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTariffPayload = {
  type: string;
  title: string;
  titleColor?: string | null;
  price: string;
  priceAmount?: number | null;
  period: string;
  durationDays?: number;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateTariffPayload = Partial<CreateTariffPayload>;

export type TariffComparisonRow = {
  id: string;
  feature: string;
  included: Record<string, boolean>;
  sortOrder: number;
};

export type TariffComparison = {
  rows: TariffComparisonRow[];
};

export type UpdateTariffComparisonPayload = {
  rows: Array<{
    feature: string;
    included: Record<string, boolean>;
    sortOrder?: number;
  }>;
};
