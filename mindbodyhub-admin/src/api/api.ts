import { auth as authStorage } from './auth';
import { getApiBaseUrl } from './config';
import { checkResponse, fetchWithAuth } from './http';
import type { User } from '@/types/user';
import { canAccessAdminPanel } from '@/types/user';

export { getApiBaseUrl } from './config';

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

const normalizeUser = (user: User): User => ({
  ...user,
  name:
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    undefined,
  avatar: user.avatar || user.avatarUrl || undefined,
});

const saveAuthSession = (data: AuthTokensResponse) => {
  const user = normalizeUser(data.user);
  authStorage.setToken(data.accessToken);
  authStorage.setRefreshToken(data.refreshToken);
  authStorage.setUser(user);
};

export const auth = {
  login: async (phone: string, password: string) => {
    // Server-side admin gate — non-admins never receive tokens for this route.
    const data = await fetch(`${getApiBaseUrl()}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    }).then((res) => checkResponse<AuthTokensResponse>(res));

    const user = normalizeUser(data.user);

    if (!canAccessAdminPanel(user.role)) {
      authStorage.removeToken();
      throw { message: 'Доступ только для сотрудников' };
    }

    saveAuthSession({ ...data, user });
  },
  logout: async () => {
    const refreshToken = authStorage.getRefreshToken();

    if (refreshToken) {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }

    authStorage.removeToken();
  },
  getProfile: async () => {
    const user = await fetchWithAuth(`${getApiBaseUrl()}/auth/me`).then((res) =>
      checkResponse<User>(res),
    );

    const normalized = normalizeUser(user);
    authStorage.setUser(normalized);
    return normalized;
  },
};
