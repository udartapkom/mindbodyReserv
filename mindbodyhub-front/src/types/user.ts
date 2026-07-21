export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export type User = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  name?: string;
  avatarUrl: string | null;
  avatar?: string | null;
  role: UserRole;
  tariff: string;
  isActive: boolean;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
