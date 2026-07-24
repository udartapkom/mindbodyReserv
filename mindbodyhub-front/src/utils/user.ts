import { UserRole, type User } from '@/types/user';

export function normalizeUser(raw: Partial<User> & Pick<User, 'id' | 'phone' | 'role'>): User {
  const firstName = raw.firstName ?? null;
  const lastName = raw.lastName ?? null;
  const avatarUrl = raw.avatarUrl ?? raw.avatar ?? null;

  return {
    id: raw.id,
    phone: raw.phone,
    role: raw.role,
    firstName,
    lastName,
    avatarUrl,
    avatar: avatarUrl,
    name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
    tariff: raw.tariff ?? 'free',
    tariffExpiresAt: raw.tariffExpiresAt ?? null,
    isActive: raw.isActive ?? true,
    phoneVerifiedAt: raw.phoneVerifiedAt ?? null,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  };
}

export function getDisplayName(user: User | null | undefined): string {
  if (!user) {
    return 'Пользователь';
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.phone;
}

export const TARIFF_LABELS: Record<string, string> = {
  free: 'Бесплатный',
  trial: 'Пробный',
  popular: 'Популярный',
  vip: 'VIP',
  // legacy labels (if old tokens still in storage)
  basic: 'Пробный',
  premium: 'Популярный',
};

export function getTariffLabel(tariff?: string | null): string {
  if (!tariff) {
    return TARIFF_LABELS.free;
  }

  return TARIFF_LABELS[tariff] ?? tariff;
}

export function getRoleLabel(role: UserRole): string {
  return role === UserRole.ADMIN ? 'Администратор' : 'Пользователь';
}
