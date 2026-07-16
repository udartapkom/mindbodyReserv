import { auth as authStorage } from './auth';
import { getApiBaseUrl } from './api';
import type {
  CreateMaterialPayload,
  Material,
  UpdateMaterialPayload,
  UploadMaterialImageResult,
} from '@/types/material';

const checkResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw json;
  }
  return res.json() as Promise<T>;
};

const authHeaders = (json = true): HeadersInit => {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Unauthorized');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const materialsApi = {
  getAll: (): Promise<Material[]> =>
    fetch(`${getApiBaseUrl()}/materials`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Material[]>(res)),

  getById: (id: string): Promise<Material> =>
    fetch(`${getApiBaseUrl()}/materials/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Material>(res)),

  create: (payload: CreateMaterialPayload): Promise<Material> =>
    fetch(`${getApiBaseUrl()}/materials`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Material>(res)),

  update: (id: string, payload: UpdateMaterialPayload): Promise<Material> =>
    fetch(`${getApiBaseUrl()}/materials/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<Material>(res)),

  publish: (id: string): Promise<Material> =>
    fetch(`${getApiBaseUrl()}/materials/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Material>(res)),

  unpublish: (id: string): Promise<Material> =>
    fetch(`${getApiBaseUrl()}/materials/${id}/unpublish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<Material>(res)),

  remove: async (id: string): Promise<void> => {
    await fetch(`${getApiBaseUrl()}/materials/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  uploadImage: async (file: File): Promise<UploadMaterialImageResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${getApiBaseUrl()}/materials/upload`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    }).then((res) => checkResponse<UploadMaterialImageResult>(res));
  },
};
