import { UserRole } from './user-role.enum';
import { UserTariff } from './user-tariff.enum';
import { PhoneCountry } from './phone-country.enum';

export type UserPublicProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  phoneCountry: PhoneCountry | null;
  role: UserRole;
  tariff: UserTariff;
  tariffExpiresAt: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
