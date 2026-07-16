import { auth as authStorage } from './auth';
import { getApiBaseUrl } from './api';
import type {
  CreateKnowledgeArticlePayload,
  KnowledgeArticle,
  UpdateKnowledgeArticlePayload,
  UploadKnowledgeImageResult,
} from '@/types/knowledge';

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

export const knowledgeApi = {
  getAll: (): Promise<KnowledgeArticle[]> =>
    fetch(`${getApiBaseUrl()}/knowledge`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle[]>(res)),

  getById: (id: string): Promise<KnowledgeArticle> =>
    fetch(`${getApiBaseUrl()}/knowledge/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  create: (payload: CreateKnowledgeArticlePayload): Promise<KnowledgeArticle> =>
    fetch(`${getApiBaseUrl()}/knowledge`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  update: (
    id: string,
    payload: UpdateKnowledgeArticlePayload,
  ): Promise<KnowledgeArticle> =>
    fetch(`${getApiBaseUrl()}/knowledge/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  publish: (id: string): Promise<KnowledgeArticle> =>
    fetch(`${getApiBaseUrl()}/knowledge/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  unpublish: (id: string): Promise<KnowledgeArticle> =>
    fetch(`${getApiBaseUrl()}/knowledge/${id}/unpublish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  remove: async (id: string): Promise<void> => {
    await fetch(`${getApiBaseUrl()}/knowledge/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  uploadImage: async (file: File): Promise<UploadKnowledgeImageResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${getApiBaseUrl()}/knowledge/upload`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    }).then((res) => checkResponse<UploadKnowledgeImageResult>(res));
  },
};
