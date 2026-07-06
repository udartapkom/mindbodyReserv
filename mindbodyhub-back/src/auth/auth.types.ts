import { UserRole } from '../users/user-role.enum';

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    role: UserRole;
  };
};

export type UserProfileResponse = {
  id: string;
  phone: string;
  role: UserRole;
  phoneVerifiedAt: string | null;
  createdAt: string;
};
