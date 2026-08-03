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

function isAccessTokenFresh(skewMs = 10_000): boolean {
  const token = authStorage.getToken();
  if (!token) {
    return false;
  }

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return false;
    }
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== 'number') {
      return false;
    }
    return payload.exp * 1000 > Date.now() + skewMs;
  } catch {
    return false;
  }
}

async function performRefresh(): Promise<boolean> {
  // Another tab may have already refreshed while we waited for the lock.
  if (isAccessTokenFresh()) {
    return true;
  }

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
      // Race: other tab rotated the token — retry once with latest storage value.
      if (isAccessTokenFresh()) {
        return true;
      }
      const latest = authStorage.getRefreshToken();
      if (latest && latest !== refreshToken) {
        const retry = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: latest }),
        });
        if (!retry.ok) {
          return false;
        }
        const retryData = (await retry.json()) as AuthTokensResponse;
        if (!canAccessAdminPanel(retryData.user?.role)) {
          authStorage.removeToken();
          return false;
        }
        authStorage.setToken(retryData.accessToken);
        authStorage.setRefreshToken(retryData.refreshToken);
        authStorage.setUser(normalizeUser(retryData.user));
        return true;
      }
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
    return isAccessTokenFresh();
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      if (typeof navigator !== 'undefined' && 'locks' in navigator) {
        return await navigator.locks.request('mbh-admin-auth-refresh', () =>
          performRefresh(),
        );
      }
      return await performRefresh();
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
  if (!authStorage.getToken() && !authStorage.getRefreshToken()) {
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

  // Refresh proactively before the access JWT expires (~15m).
  if (!isAccessTokenFresh(60_000) && authStorage.getRefreshToken()) {
    await refreshAccessToken();
  }

  let response = authStorage.getToken()
    ? await fetch(url, makeInit())
    : new Response(null, { status: 401 });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(url, makeInit());
    }
  }

  return response;
}
