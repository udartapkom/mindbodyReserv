export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** User subscription tariff (registered is material-only access, not stored on user) */
export const UserTariff = {
  FREE: 'free',
  TRIAL: 'trial',
  POPULAR: 'popular',
  VIP: 'vip',
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
  phone?: string;
  role?: UserRole;
  tariff?: UserTariff;
  isActive?: boolean;
  avatarUrl?: string | null;
};
