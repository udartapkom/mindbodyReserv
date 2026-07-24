import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type {
  CreateTariffPayload,
  Tariff,
  TariffComparison,
  UpdateTariffComparisonPayload,
  UpdateTariffPayload,
} from '@/types/tariff';

export const tariffsApi = {
  getAll: (): Promise<Tariff[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff[]>(res)),

  getById: (id: string): Promise<Tariff> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff>(res)),

  create: (payload: CreateTariffPayload): Promise<Tariff> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Tariff>(res)),

  update: (id: string, payload: UpdateTariffPayload): Promise<Tariff> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Tariff>(res)),

  activate: (id: string): Promise<Tariff> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs/${id}/activate`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff>(res)),

  deactivate: (id: string): Promise<Tariff> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs/${id}/deactivate`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Tariff>(res)),

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/tariffs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  getComparison: (): Promise<TariffComparison> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs/comparison`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<TariffComparison>(res)),

  updateComparison: (
    payload: UpdateTariffComparisonPayload,
  ): Promise<TariffComparison> =>
    fetchWithAuth(`${getApiBaseUrl()}/tariffs/comparison`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<TariffComparison>(res)),
};
