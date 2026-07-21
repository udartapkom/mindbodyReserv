import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type {
  CreateMaterialPayload,
  Material,
  UpdateMaterialPayload,
  UploadMaterialImageResult,
} from '@/types/material';

export const materialsApi = {
  getAll: (): Promise<Material[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/materials`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Material[]>(res)),

  getById: (id: string): Promise<Material> =>
    fetchWithAuth(`${getApiBaseUrl()}/materials/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Material>(res)),

  create: (payload: CreateMaterialPayload): Promise<Material> =>
    fetchWithAuth(`${getApiBaseUrl()}/materials`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Material>(res)),

  update: (id: string, payload: UpdateMaterialPayload): Promise<Material> =>
    fetchWithAuth(`${getApiBaseUrl()}/materials/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Material>(res)),

  publish: (id: string): Promise<Material> =>
    fetchWithAuth(`${getApiBaseUrl()}/materials/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Material>(res)),

  unpublish: (id: string): Promise<Material> =>
    fetchWithAuth(`${getApiBaseUrl()}/materials/${id}/unpublish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Material>(res)),

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/materials/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  uploadImage: async (file: File): Promise<UploadMaterialImageResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth(`${getApiBaseUrl()}/materials/upload`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    }).then((res) => checkResponse<UploadMaterialImageResult>(res));
  },
};
