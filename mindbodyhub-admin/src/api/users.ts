import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type { AdminUpdateUserPayload, User, UserLookupItem } from '@/types/user';

const normalizeUser = (user: User): User => ({
  ...user,
  name:
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    undefined,
  avatar: user.avatar || user.avatarUrl || undefined,
});

const normalizeLookup = (user: UserLookupItem): UserLookupItem => ({
  ...user,
  name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone,
});

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const users = await fetchWithAuth(`${getApiBaseUrl()}/users`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<User[]>(res));

    return users.map(normalizeUser);
  },

  /** Read-only directory for admin + editor */
  lookup: async (): Promise<UserLookupItem[]> => {
    const users = await fetchWithAuth(`${getApiBaseUrl()}/users/lookup`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<UserLookupItem[]>(res));

    return users.map(normalizeLookup);
  },

  getById: async (id: string): Promise<User> => {
    const user = await fetchWithAuth(`${getApiBaseUrl()}/users/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  update: async (id: string, payload: AdminUpdateUserPayload): Promise<User> => {
    const user = await fetchWithAuth(`${getApiBaseUrl()}/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/users/${id}/password`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ newPassword }),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  uploadAvatar: async (id: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);

    const user = await fetchWithAuth(`${getApiBaseUrl()}/users/${id}/avatar`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  block: async (id: string): Promise<User> => {
    const user = await fetchWithAuth(`${getApiBaseUrl()}/users/${id}/block`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  unblock: async (id: string): Promise<User> => {
    const user = await fetchWithAuth(`${getApiBaseUrl()}/users/${id}/unblock`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<User>(res));

    return normalizeUser(user);
  },

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },
};
