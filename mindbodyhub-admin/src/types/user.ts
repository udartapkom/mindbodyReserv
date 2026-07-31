export const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export function canAccessAdminPanel(
  role: UserRole | string | null | undefined,
): boolean {
  return role === UserRole.ADMIN || role === UserRole.EDITOR;
}

export function isAdminRole(
  role: UserRole | string | null | undefined,
): boolean {
  return role === UserRole.ADMIN;
}

export function getAdminHomePath(
  role: UserRole | string | null | undefined,
): string {
  return isAdminRole(role) ? '/users' : '/materials';
}

/** User subscription tariff (registered is material-only access, not stored on user) */
export const UserTariff = {
  FREE: 'free',
  TRIAL: 'trial',
  POPULAR: 'popular',
  VIP: 'vip',
} as const;

export type UserTariff = (typeof UserTariff)[keyof typeof UserTariff];

export const PhoneCountry = {
  RU: 'ru',
  KZ: 'kz',
  BY: 'by',
  OTHER: 'other',
} as const;

export type PhoneCountry = (typeof PhoneCountry)[keyof typeof PhoneCountry];

export const phoneCountryLabels: Record<PhoneCountry, string> = {
  ru: 'Россия',
  kz: 'Казахстан',
  by: 'Беларусь',
  other: 'Другая страна',
};

export type User = {
  id: string;
  phone: string;
  phoneCountry?: PhoneCountry | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string;
  avatarUrl?: string | null;
  avatar?: string;
  role: UserRole;
  tariff?: UserTariff | null;
  tariffExpiresAt?: string | null;
  isActive?: boolean;
  phoneVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Narrow user directory for editors */
export type UserLookupItem = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  tariff: UserTariff;
  isActive: boolean;
  createdAt: string;
  name?: string;
};

export type AdminUpdateUserPayload = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string;
  phoneCountry?: PhoneCountry | null;
  role?: UserRole;
  tariff?: UserTariff;
  tariffExpiresAt?: string | null;
  isActive?: boolean;
  avatarUrl?: string | null;
};
