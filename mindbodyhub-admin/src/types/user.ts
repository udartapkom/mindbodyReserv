export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserTariff = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
} as const;

export type UserTariff = (typeof UserTariff)[keyof typeof UserTariff];

export type User = {
  id: string;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string;
  avatarUrl?: string | null;
  avatar?: string;
  role: UserRole;
  tariff?: UserTariff | null;
  isActive?: boolean;
  phoneVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUpdateUserPayload = {
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRole;
  tariff?: UserTariff;
  isActive?: boolean;
  avatarUrl?: string | null;
};
