import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PlategaPaymentStatus } from './payment.types';
import { safeEqualString } from '../common/utils/safe-equal.util';

export type PlategaCreateTransactionInput = {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  failedUrl: string;
  payload: string;
  userId: string;
  userName: string;
};

export type PlategaCreateTransactionResult = {
  transactionId: string;
  status: PlategaPaymentStatus;
  paymentUrl: string;
  expiresIn: string | null;
};

export type PlategaTransactionStatus = {
  id: string;
  status: PlategaPaymentStatus;
  amount?: number;
  currency?: string;
  payload?: string;
};

@Injectable()
export class PlategaClient {
  private readonly logger = new Logger(PlategaClient.name);

  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config
      .get<string>('PLATEGA_BASE_URL', 'https://app.platega.io')
      .replace(/\/$/, '');
  }

  private get merchantId(): string {
    return this.config.get<string>('PLATEGA_MERCHANT_ID', '').trim();
  }

  private get secret(): string {
    return this.config.get<string>('PLATEGA_SECRET', '').trim();
  }

  isConfigured(): boolean {
    return Boolean(this.merchantId && this.secret);
  }

  assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Платёжный провайдер не настроен (PLATEGA_MERCHANT_ID / PLATEGA_SECRET)',
      );
    }
  }

  verifyWebhookHeaders(merchantId?: string, secret?: string): boolean {
    if (!this.isConfigured()) {
      return false;
    }
    if (typeof merchantId !== 'string' || typeof secret !== 'string') {
      return false;
    }
    return (
      safeEqualString(merchantId.trim(), this.merchantId) &&
      safeEqualString(secret.trim(), this.secret)
    );
  }

  async createTransaction(
    input: PlategaCreateTransactionInput,
  ): Promise<PlategaCreateTransactionResult> {
    this.assertConfigured();

    const body = {
      paymentDetails: {
        amount: input.amount,
        currency: input.currency,
      },
      description: input.description,
      return: input.returnUrl,
      failedUrl: input.failedUrl,
      payload: input.payload,
      metadata: {
        userId: input.userId,
        userName: input.userName,
      },
    };

    const data = await this.request<Record<string, unknown>>(
      'POST',
      '/v2/transaction/process',
      body,
    );

    const transactionId = String(
      data.transactionId ?? data.id ?? '',
    ).trim();
    const paymentUrl = String(
      data.url ?? data.redirect ?? '',
    ).trim();
    const status = String(data.status ?? 'PENDING').toUpperCase() as PlategaPaymentStatus;
    const expiresIn =
      typeof data.expiresIn === 'string' ? data.expiresIn : null;

    if (!transactionId || !paymentUrl) {
      this.logger.error(
        `Platega create response missing fields: ${JSON.stringify(data)}`,
      );
      throw new BadGatewayException(
        'Платёжный провайдер вернул неполный ответ',
      );
    }

    return {
      transactionId,
      status,
      paymentUrl,
      expiresIn,
    };
  }

  async getTransactionStatus(
    transactionId: string,
  ): Promise<PlategaTransactionStatus> {
    this.assertConfigured();

    const data = await this.request<Record<string, unknown>>(
      'GET',
      `/transaction/${encodeURIComponent(transactionId)}`,
    );

    const paymentDetails =
      data.paymentDetails && typeof data.paymentDetails === 'object'
        ? (data.paymentDetails as Record<string, unknown>)
        : null;

    return {
      id: String(data.id ?? transactionId),
      status: String(data.status ?? 'PENDING').toUpperCase() as PlategaPaymentStatus,
      amount:
        typeof paymentDetails?.amount === 'number'
          ? paymentDetails.amount
          : undefined,
      currency:
        typeof paymentDetails?.currency === 'string'
          ? paymentDetails.currency
          : undefined,
      payload: typeof data.payload === 'string' ? data.payload : undefined,
    };
  }

  async getCancelSupported(
    transactionId: string,
  ): Promise<{
    supported: boolean;
    totalDeductUsdt: number | null;
    blockReason: string | null;
  }> {
    this.assertConfigured();

    const data = await this.request<Record<string, unknown>>(
      'GET',
      `/transaction/${encodeURIComponent(transactionId)}/cancel-supported`,
    );

    return {
      supported: data.supported === true,
      totalDeductUsdt:
        typeof data.totalDeductUsdt === 'number' ? data.totalDeductUsdt : null,
      blockReason:
        typeof data.blockReason === 'string' ? data.blockReason : null,
    };
  }

  async cancelTransaction(
    transactionId: string,
  ): Promise<{
    transactionId: string;
    accepted: boolean;
    manualControlRequired: boolean;
    message: string | null;
  }> {
    this.assertConfigured();

    const data = await this.request<Record<string, unknown>>(
      'POST',
      `/transaction/${encodeURIComponent(transactionId)}/cancel`,
    );

    return {
      transactionId: String(data.transactionId ?? transactionId),
      accepted: data.accepted === true,
      manualControlRequired: data.manualControlRequired === true,
      message: typeof data.message === 'string' ? data.message : null,
    };
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-MerchantId': this.merchantId,
      'X-Secret': this.secret,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      this.logger.error(
        `Platega network error ${method} ${path}: ${String(error)}`,
      );
      throw new BadGatewayException('Не удалось связаться с платёжным провайдером');
    }

    const rawText = await response.text();
    let data: unknown = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText) as unknown;
      } catch {
        data = { message: rawText };
      }
    }

    if (!response.ok) {
      const message =
        data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof (data as { message: unknown }).message === 'string'
          ? (data as { message: string }).message
          : `Platega HTTP ${response.status}`;

      this.logger.warn(`Platega ${method} ${path} failed: ${message}`);
      throw new BadGatewayException(message);
    }

    return data as T;
  }
}
