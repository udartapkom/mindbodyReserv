import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type { Ticket, UpdateTicketPayload } from '@/types/ticket';

export const ticketsApi = {
  getAll: (): Promise<Ticket[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/tickets`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Ticket[]>(res)),

  getById: (id: string): Promise<Ticket> =>
    fetchWithAuth(`${getApiBaseUrl()}/tickets/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Ticket>(res)),

  update: (id: string, payload: UpdateTicketPayload): Promise<Ticket> =>
    fetchWithAuth(`${getApiBaseUrl()}/tickets/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Ticket>(res)),

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/tickets/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },
};
