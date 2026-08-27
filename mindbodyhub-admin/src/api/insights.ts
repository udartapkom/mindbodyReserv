import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type {
  CreateInsightPayload,
  Insight,
  UpdateInsightPayload,
  UploadInsightImageResult,
} from '@/types/insight';

export const insightsApi = {
  getAll: (): Promise<Insight[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/insights`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Insight[]>(res)),

  getById: (id: string): Promise<Insight> =>
    fetchWithAuth(`${getApiBaseUrl()}/insights/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Insight>(res)),

  create: (payload: CreateInsightPayload): Promise<Insight> =>
    fetchWithAuth(`${getApiBaseUrl()}/insights`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Insight>(res)),

  update: (
    id: string,
    payload: UpdateInsightPayload,
  ): Promise<Insight> =>
    fetchWithAuth(`${getApiBaseUrl()}/insights/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Insight>(res)),

  publish: (id: string): Promise<Insight> =>
    fetchWithAuth(`${getApiBaseUrl()}/insights/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Insight>(res)),

  unpublish: (id: string): Promise<Insight> =>
    fetchWithAuth(`${getApiBaseUrl()}/insights/${id}/unpublish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Insight>(res)),

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/insights/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  uploadImage: async (file: File): Promise<UploadInsightImageResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth(`${getApiBaseUrl()}/insights/upload`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    }).then((res) => checkResponse<UploadInsightImageResult>(res));
  },
};
