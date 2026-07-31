import { UserRole } from '@/types/user';

const PAID_TARIFFS = ['trial', 'popular', 'vip'] as const;

/** Quotes: any paid tariff; staff (admin/editor) always (for preview). */
export function canAccessQuotes(
  userTariff?: string | null,
  userRole?: string | null,
): boolean {
  if (userRole === UserRole.ADMIN || userRole === UserRole.EDITOR) {
    return true;
  }
  const tariff = userTariff?.trim() || 'free';
  if (tariff === 'free') {
    return false;
  }
  return (PAID_TARIFFS as readonly string[]).includes(tariff);
}
