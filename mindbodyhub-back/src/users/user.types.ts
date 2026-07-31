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
  notifySupportReplies: boolean;
  notifyNewMaterials: boolean;
  notifyDailyQuote: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Narrow directory for editors (no PII dumps beyond support needs). */
export type UserLookupItem = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  tariff: UserTariff;
  isActive: boolean;
  createdAt: string;
};
