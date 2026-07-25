import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type { SupportLinks } from '@/types/settings';

export const settingsApi = {
  getSupportLinks: (): Promise<SupportLinks> =>
    fetch(`${getApiBaseUrl()}/settings/support-links`).then((res) =>
      checkResponse<SupportLinks>(res),
    ),

  updateSupportLinks: (payload: SupportLinks): Promise<SupportLinks> =>
    fetchWithAuth(`${getApiBaseUrl()}/settings/support-links`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<SupportLinks>(res)),
};
