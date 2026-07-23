import { FREE_ACCESS_TYPE, REGISTERED_ACCESS_TYPE } from "@/types/material";
import { TARIFF_LABELS } from "@/utils/user";

/** Display order for course groups (paid first). */
export const MATERIAL_ACCESS_GROUP_ORDER = [
  "vip",
  "popular",
  "trial",
  REGISTERED_ACCESS_TYPE,
  FREE_ACCESS_TYPE,
] as const;

export function getMaterialAccessLabel(tariffType: string): string {
  if (tariffType === REGISTERED_ACCESS_TYPE) {
    return "Для зарегистрированных";
  }
  if (!tariffType || tariffType === FREE_ACCESS_TYPE) {
    return "Бесплатный материал";
  }
  if (tariffType === "trial") return "Тариф: Пробный";
  if (tariffType === "popular") return "Тариф: Популярный";
  if (tariffType === "vip") return "Тариф: VIP";
  return `Тариф: ${tariffType}`;
}

export function getMaterialAccessGroupLabel(tariffType: string): string {
  if (tariffType === REGISTERED_ACCESS_TYPE) {
    return "Для зарегистрированных";
  }
  if (!tariffType || tariffType === FREE_ACCESS_TYPE) {
    return "Бесплатные";
  }
  return TARIFF_LABELS[tariffType] ?? tariffType;
}

export function compareMaterialAccessGroups(a: string, b: string): number {
  const order = MATERIAL_ACCESS_GROUP_ORDER as readonly string[];
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  const aRank = ai === -1 ? order.length : ai;
  const bRank = bi === -1 ? order.length : bi;
  if (aRank !== bRank) {
    return aRank - bRank;
  }
  return a.localeCompare(b);
}
