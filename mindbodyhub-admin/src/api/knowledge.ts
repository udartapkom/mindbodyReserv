import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type {
  CreateKnowledgeArticlePayload,
  KnowledgeArticle,
  UpdateKnowledgeArticlePayload,
  UploadKnowledgeImageResult,
} from '@/types/knowledge';

export const knowledgeApi = {
  getAll: (): Promise<KnowledgeArticle[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/knowledge`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle[]>(res)),

  getById: (id: string): Promise<KnowledgeArticle> =>
    fetchWithAuth(`${getApiBaseUrl()}/knowledge/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  create: (payload: CreateKnowledgeArticlePayload): Promise<KnowledgeArticle> =>
    fetchWithAuth(`${getApiBaseUrl()}/knowledge`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  update: (
    id: string,
    payload: UpdateKnowledgeArticlePayload,
  ): Promise<KnowledgeArticle> =>
    fetchWithAuth(`${getApiBaseUrl()}/knowledge/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  publish: (id: string): Promise<KnowledgeArticle> =>
    fetchWithAuth(`${getApiBaseUrl()}/knowledge/${id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  unpublish: (id: string): Promise<KnowledgeArticle> =>
    fetchWithAuth(`${getApiBaseUrl()}/knowledge/${id}/unpublish`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then((res) => checkResponse<KnowledgeArticle>(res)),

  remove: async (id: string): Promise<void> => {
    await fetchWithAuth(`${getApiBaseUrl()}/knowledge/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => checkResponse<{ success: true }>(res));
  },

  uploadImage: async (file: File): Promise<UploadKnowledgeImageResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth(`${getApiBaseUrl()}/knowledge/upload`, {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    }).then((res) => checkResponse<UploadKnowledgeImageResult>(res));
  },
};
