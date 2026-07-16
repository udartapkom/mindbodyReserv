import { UserRole } from './user-role.enum';
import { UserTariff } from './user-tariff.enum';

export type UserPublicProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  role: UserRole;
  tariff: UserTariff;
  avatarUrl: string | null;
  isActive: boolean;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
