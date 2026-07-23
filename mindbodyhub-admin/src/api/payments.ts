import { getApiBaseUrl } from './api';
import { authHeaders, checkResponse, fetchWithAuth } from './http';
import type { Payment } from '@/types/payment';

export type CreatePaymentResponse = {
  id: string;
  paymentUrl: string;
  status: Payment['status'];
  expiresIn: string | null;
  amount: number;
  currency: string;
  tariffType: string;
};

export const paymentsApi = {
  getAll: (): Promise<Payment[]> =>
    fetchWithAuth(`${getApiBaseUrl()}/payments`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Payment[]>(res)),

  getById: (id: string): Promise<Payment> =>
    fetchWithAuth(`${getApiBaseUrl()}/payments/${id}`, {
      headers: authHeaders(),
    }).then((res) => checkResponse<Payment>(res)),

  create: (tariffType: string): Promise<CreatePaymentResponse> =>
    fetchWithAuth(`${getApiBaseUrl()}/payments/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ tariffType }),
    }).then((res) => checkResponse<CreatePaymentResponse>(res)),

  createTest: (tariffType: string): Promise<CreatePaymentResponse> =>
    fetchWithAuth(`${getApiBaseUrl()}/payments/test`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ tariffType }),
    }).then((res) => checkResponse<CreatePaymentResponse>(res)),
};
