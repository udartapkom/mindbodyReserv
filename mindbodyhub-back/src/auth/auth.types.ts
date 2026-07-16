import { UserPublicProfile } from '../users/user.types';

export type AuthUserSummary = Pick<
  UserPublicProfile,
  'id' | 'firstName' | 'lastName' | 'phone' | 'role' | 'tariff' | 'avatarUrl'
>;

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserSummary;
};

export type UserProfileResponse = UserPublicProfile;
