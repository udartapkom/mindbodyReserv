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
 * Paid tariffs are inclusive down the ladder (vip ⊃ popular ⊃ trial).
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

  const ladderIndex = PAID_TARIFF_LADDER.indexOf(tariff as PaidTariffType);
  if (ladderIndex >= 0) {
    for (let i = 0; i <= ladderIndex; i += 1) {
      types.add(PAID_TARIFF_LADDER[i]);
    }
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
