import { auth as authStorage } from './auth';
import { getApiBaseUrl } from './config';
import { canAccessAdminPanel, type User } from '@/types/user';

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};


export const checkResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw json;
  }
  return res.json() as Promise<T>;
};

export const authHeaders = (json = true): HeadersInit => {
  const headers: Record<string, string> = {};

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const normalizeUser = (user: User): User => ({
  ...user,
  name:
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    undefined,
  avatar: user.avatar || user.avatarUrl || undefined,
});

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return false;
      }

      const data = (await res.json()) as AuthTokensResponse;

      if (!canAccessAdminPanel(data.user?.role)) {
        authStorage.removeToken();
        return false;
      }

      authStorage.setToken(data.accessToken);
      authStorage.setRefreshToken(data.refreshToken);
      authStorage.setUser(normalizeUser(data.user));
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Unauthorized');
  }

  const makeInit = (): RequestInit => {
    const headers = new Headers(init.headers);
    const accessToken = authStorage.getToken();
    if (!accessToken) {
      throw new Error('Unauthorized');
    }
    headers.set('Authorization', `Bearer ${accessToken}`);
    return { ...init, headers };
  };

  let response = await fetch(url, makeInit());

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(url, makeInit());
    }
  }

  return response;
}
