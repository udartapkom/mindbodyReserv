import { FREE_ACCESS_TYPE, REGISTERED_ACCESS_TYPE } from "@/types/material";
import { TARIFF_LABELS } from "@/utils/user";

export const PAID_MATERIAL_SHELVES = ["trial", "popular", "vip"] as const;
export type PaidMaterialShelf = (typeof PAID_MATERIAL_SHELVES)[number];

/** Shelves shown under cabinet → Materials (registered + paid). */
export const CABINET_MATERIAL_SHELVES = [
  REGISTERED_ACCESS_TYPE,
  ...PAID_MATERIAL_SHELVES,
] as const;
export type CabinetMaterialShelf = (typeof CABINET_MATERIAL_SHELVES)[number];

/** Display order for course groups (paid first). */
export const MATERIAL_ACCESS_GROUP_ORDER = [
  "vip",
  "popular",
  "trial",
  REGISTERED_ACCESS_TYPE,
  FREE_ACCESS_TYPE,
] as const;

export function isPaidMaterialShelf(value: string): value is PaidMaterialShelf {
  return (PAID_MATERIAL_SHELVES as readonly string[]).includes(value);
}

export function isCabinetMaterialShelf(
  value: string,
): value is CabinetMaterialShelf {
  return (CABINET_MATERIAL_SHELVES as readonly string[]).includes(value);
}

/**
 * Strict shelf access: paid tariffs do not overlap (vip → only vip shelf).
 * `registered` — any authenticated user (including free tariff).
 */
export function canAccessMaterialShelf(
  shelfTariff: string,
  userTariff?: string | null,
  isAuthenticated = false,
): boolean {
  const tariff = userTariff?.trim() || "free";
  if (shelfTariff === FREE_ACCESS_TYPE) return true;
  if (shelfTariff === REGISTERED_ACCESS_TYPE) return isAuthenticated;
  if (!isPaidMaterialShelf(shelfTariff)) return false;
  return tariff === shelfTariff;
}

export function getMaterialShelfLabel(tariffType: string): string {
  if (tariffType === REGISTERED_ACCESS_TYPE) {
    return "Для зарегистрированных";
  }
  return TARIFF_LABELS[tariffType] ?? tariffType;
}

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

/** Reader URL for a published material (public vs cabinet shelf). */
export function getMaterialReaderHref(material: {
  slug: string;
  tariffType: string;
}): string {
  if (material.tariffType === FREE_ACCESS_TYPE) {
    return `/problems/${material.slug}`;
  }
  if (material.tariffType === REGISTERED_ACCESS_TYPE) {
    return `/cabinet/materials/${REGISTERED_ACCESS_TYPE}/${material.slug}`;
  }
  return `/cabinet/materials/${material.tariffType}/${material.slug}`;
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
