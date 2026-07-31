/**
 * Unified tariff / access model for MindBodyHub.
 *
 * Material access levels:
 * - free        — public (no auth)
 * - registered  — any authenticated user
 * - trial       — paid trial tariff
 * - popular     — paid popular tariff
 * - vip         — paid VIP tariff
 *
 * User subscription (`users.tariff`):
 * - free | trial | popular | vip
 * (`registered` is NOT stored on the user — it is granted automatically when authenticated)
 */

export const FREE_ACCESS_TYPE = 'free';
export const REGISTERED_ACCESS_TYPE = 'registered';

export enum UserTariff {
  FREE = 'free',
  TRIAL = 'trial',
  POPULAR = 'popular',
  VIP = 'vip',
}

/** Paid catalog / user tariff slugs (ladder, low → high) */
export const PAID_TARIFF_LADDER = [
  UserTariff.TRIAL,
  UserTariff.POPULAR,
  UserTariff.VIP,
] as const;

export type PaidTariffType = (typeof PAID_TARIFF_LADDER)[number];

export const USER_TARIFF_VALUES = Object.values(UserTariff);

export function isUserTariff(value: string): value is UserTariff {
  return (USER_TARIFF_VALUES as string[]).includes(value);
}

/**
 * Resolve which material.tariffType values the visitor may see.
 * Paid tariffs do not overlap: user sees only their own paid shelf (+ free/registered).
 */
export function getAccessibleTariffTypes(options: {
  isAuthenticated?: boolean;
  userTariff?: string | null;
}): string[] {
  const types = new Set<string>([FREE_ACCESS_TYPE]);

  if (options.isAuthenticated) {
    types.add(REGISTERED_ACCESS_TYPE);
  }

  const tariff = options.userTariff?.trim();
  if (!tariff || tariff === FREE_ACCESS_TYPE) {
    return [...types];
  }

  if (PAID_TARIFF_LADDER.includes(tariff as PaidTariffType)) {
    types.add(tariff);
    return [...types];
  }

  // Unknown slug: exact match only (forward-compatible)
  types.add(tariff);
  return [...types];
}

export function isMaterialAccessible(
  materialTariffType: string,
  options: { isAuthenticated?: boolean; userTariff?: string | null },
): boolean {
  return getAccessibleTariffTypes(options).includes(materialTariffType);
}

/** User may open a paid cabinet shelf (exact tariff match only). */
export function canAccessMaterialShelf(
  shelfTariffType: string,
  options: { isAuthenticated?: boolean; userTariff?: string | null },
): boolean {
  const tariff = options.userTariff?.trim() || FREE_ACCESS_TYPE;
  if (!isPaidTariffShelf(shelfTariffType)) {
    return isMaterialAccessible(shelfTariffType, options);
  }
  return tariff === shelfTariffType;
}

export function isPaidTariffShelf(value: string): value is PaidTariffType {
  return (PAID_TARIFF_LADDER as readonly string[]).includes(value);
}

/** Quotes: any paid tariff (trial, popular, vip); staff always. */
export function canAccessQuotes(options: {
  isAuthenticated?: boolean;
  userTariff?: string | null;
  userRole?: string | null;
}): boolean {
  if (options.userRole === 'admin' || options.userRole === 'editor') {
    return true;
  }
  const tariff = options.userTariff?.trim();
  if (!tariff || tariff === UserTariff.FREE) {
    return false;
  }
  return PAID_TARIFF_LADDER.includes(tariff as PaidTariffType);
}
