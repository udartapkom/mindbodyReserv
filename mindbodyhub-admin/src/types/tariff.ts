export type Tariff = {
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
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTariffPayload = {
  type: string;
  title: string;
  titleColor?: string | null;
  price: string;
  period: string;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateTariffPayload = Partial<CreateTariffPayload>;
