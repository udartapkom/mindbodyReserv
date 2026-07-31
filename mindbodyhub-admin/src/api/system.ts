import { getApiBaseUrl } from './api';
import { checkResponse, fetchWithAuth } from './http';
import type { DbStatus, SystemLogs, SystemOverview } from '@/types/system';

export const systemApi = {
  getOverview: (): Promise<SystemOverview> =>
    fetchWithAuth(`${getApiBaseUrl()}/system/overview`).then((res) =>
      checkResponse<SystemOverview>(res),
    ),

  getLogs: (lines = 100): Promise<SystemLogs> =>
    fetchWithAuth(
      `${getApiBaseUrl()}/system/logs?lines=${encodeURIComponent(String(lines))}`,
    ).then((res) => checkResponse<SystemLogs>(res)),

  getDbStatus: (): Promise<DbStatus> =>
    fetchWithAuth(`${getApiBaseUrl()}/system/db-status`).then((res) =>
      checkResponse<DbStatus>(res),
    ),
};
