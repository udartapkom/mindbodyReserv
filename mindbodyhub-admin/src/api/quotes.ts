import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type {
  CreateQuotePayload,
  Quote,
  UpdateQuotePayload,
} from '@/types/quote';

export const quotesApi = {
  getAll: (): Promise<Quote[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/quotes`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Quote[]>(res)),

  create: (payload: CreateQuotePayload): Promise<Quote> =>
    fetchWithAuth(`${getApiBaseUrl()}/quotes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Quote>(res)),

  update: (id: string, payload: UpdateQuotePayload): Promise<Quote> =>
    fetchWithAuth(`${getApiBaseUrl()}/quotes/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Quote>(res)),

  publish: (id: string): Promise<Quote> =>
    fetchWithAuth(`${getApiBaseUrl()}/quotes/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Quote>(res)),

  unpublish: (id: string): Promise<Quote> =>
    fetchWithAuth(`${getApiBaseUrl()}/quotes/${id}/unpublish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Quote>(res)),

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/quotes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },
};
