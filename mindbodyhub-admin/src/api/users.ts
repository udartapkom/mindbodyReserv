import { auth as authStorage } from './auth';
import { getApiBaseUrl } from './api';
import type { AdminUpdateUserPayload, User } from '@/types/user';

const checkResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw json;
  }
  return res.json() as Promise<T>;
};

const authHeaders = (): HeadersInit => {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Unauthorized');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const normalizeUser = (user: User): User => ({
  ...user,
  name:
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    undefined,
  avatar: user.avatar || user.avatarUrl || undefined,
});

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const users = await fetch(`${getApiBaseUrl()}/users`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<User[]>(res));

    return users.map(normalizeUser);
  },

  getById: async (id: string): Promise<User> => {
    const user = await fetch(`${getApiBaseUrl()}/users/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  update: async (id: string, payload: AdminUpdateUserPayload): Promise<User> => {
    const user = await fetch(`${getApiBaseUrl()}/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  block: async (id: string): Promise<User> => {
    const user = await fetch(`${getApiBaseUrl()}/users/${id}/block`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  unblock: async (id: string): Promise<User> => {
    const user = await fetch(`${getApiBaseUrl()}/users/${id}/unblock`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  remove: async (id: string): Promise<void> => {
    await fetch(`${getApiBaseUrl()}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },
};
