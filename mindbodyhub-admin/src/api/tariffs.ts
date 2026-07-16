import { auth as authStorage } from './auth';
import { getApiBaseUrl } from './api';
import type { CreateTariffPayload, Tariff, UpdateTariffPayload } from '@/types/tariff';

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

export const tariffsApi = {
  getAll: (): Promise<Tariff[]> =>
    fetch(`${getApiBaseUrl()}/tariffs`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff[]>(res)),

  getById: (id: string): Promise<Tariff> =>
    fetch(`${getApiBaseUrl()}/tariffs/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff>(res)),

  create: (payload: CreateTariffPayload): Promise<Tariff> =>
    fetch(`${getApiBaseUrl()}/tariffs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Tariff>(res)),

  update: (id: string, payload: UpdateTariffPayload): Promise<Tariff> =>
    fetch(`${getApiBaseUrl()}/tariffs/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Tariff>(res)),

  activate: (id: string): Promise<Tariff> =>
    fetch(`${getApiBaseUrl()}/tariffs/${id}/activate`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff>(res)),

  deactivate: (id: string): Promise<Tariff> =>
    fetch(`${getApiBaseUrl()}/tariffs/${id}/deactivate`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff>(res)),

  remove: async (id: string): Promise<void> => {
    await fetch(`${getApiBaseUrl()}/tariffs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },
};
