export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export type PhoneCountry = 'ru' | 'kz' | 'by' | 'other';

export type User = {
  id: string;
  phone: string;
  phoneCountry: PhoneCountry | null;
  firstName: string | null;
  lastName: string | null;
  name?: string;
  avatarUrl: string | null;
  avatar?: string | null;
  role: UserRole;
  tariff: string;
  tariffExpiresAt: string | null;
  isActive: boolean;
  phoneVerifiedAt: string | null;
  notifySupportReplies: boolean;
  notifyNewMaterials: boolean;
  notifyDailyQuote: boolean;
  notifyTariffExpiry: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  notifySupportReplies?: boolean;
  notifyNewMaterials?: boolean;
  notifyDailyQuote?: boolean;
  notifyTariffExpiry?: boolean;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
