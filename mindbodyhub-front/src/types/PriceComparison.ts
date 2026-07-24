export type PriceComparisonRow = {
  id: string;
  feature: string;
  included: Record<string, boolean>;
  sortOrder: number;
};

export type PriceComparison = {
  rows: PriceComparisonRow[];
};
