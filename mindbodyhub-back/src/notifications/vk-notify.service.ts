import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PaymentNotifyPayload = {
  paymentId: string;
  userId: string;
  userPhone?: string | null;
  tariffType: string;
  amount: number;
  currency: string;
  providerTransactionId?: string | null;
};

export type TicketNotifyPayload = {
  ticketId: string;
  name: string;
  phone: string;
  message: string;
  source: string;
};

@Injectable()
export class VkNotifyService {
  private readonly logger = new Logger(VkNotifyService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.token && this.adminId);
  }

  async notifyPaymentPaid(payload: PaymentNotifyPayload): Promise<void> {
    const who = payload.userPhone?.trim() || payload.userId;
    await this.sendToAdmin(
      [
        '💰 ОПЛАТА ПОДТВЕРЖДЕНА',
        '',
        `Тариф: ${payload.tariffType}`,
        `Сумма: ${payload.amount} ${payload.currency}`,
        `Кто: ${who}`,
        `User ID: ${payload.userId}`,
        `Payment ID: ${payload.paymentId}`,
        payload.providerTransactionId
          ? `Platega: ${payload.providerTransactionId}`
          : null,
        `Админка: ${this.adminUrl}/accounting`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  async notifyPaymentChargeback(payload: PaymentNotifyPayload): Promise<void> {
    const who = payload.userPhone?.trim() || payload.userId;
    await this.sendToAdmin(
      [
        '⚠️ ВОЗВРАТ / CHARGEBACK',
        '',
        `Тариф: ${payload.tariffType}`,
        `Сумма: ${payload.amount} ${payload.currency}`,
        `Кто: ${who}`,
        `User ID: ${payload.userId}`,
        `Payment ID: ${payload.paymentId}`,
        payload.providerTransactionId
          ? `Platega: ${payload.providerTransactionId}`
          : null,
        'Если тариф пользователя совпадал с платежом — доступ сброшен в free.',
        `Админка: ${this.adminUrl}/accounting`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  async notifyTicketCreated(payload: TicketNotifyPayload): Promise<void> {
    const preview =
      payload.message.length > 500
        ? `${payload.message.slice(0, 500)}…`
        : payload.message;

    await this.sendToAdmin(
      [
        '🆘 НОВЫЙ ТИКЕТ ПОДДЕРЖКИ',
        '',
        `Имя: ${payload.name}`,
        `Телефон: ${payload.phone}`,
        `Источник: ${payload.source}`,
        `Ticket ID: ${payload.ticketId}`,
        '',
        'Сообщение:',
        preview,
        '',
        `Админка: ${this.adminUrl}/tickets`,
      ].join('\n'),
    );
  }

  async notifyTicketMessage(payload: {
    ticketId: string;
    name: string;
    phone: string;
    message: string;
    from: 'user' | 'admin';
  }): Promise<void> {
    if (payload.from !== 'user') return;

    const preview =
      payload.message.length > 500
        ? `${payload.message.slice(0, 500)}…`
        : payload.message;

    await this.sendToAdmin(
      [
        '💬 НОВОЕ СООБЩЕНИЕ В ПОДДЕРЖКЕ',
        '',
        `Имя: ${payload.name}`,
        `Телефон: ${payload.phone}`,
        `Ticket ID: ${payload.ticketId}`,
        '',
        preview,
        '',
        `Админка: ${this.adminUrl}/tickets`,
      ].join('\n'),
    );
  }

  async sendToAdmin(message: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug('VK notify skipped: VK_BOT_TOKEN / VK_ADMIN_ID not set');
      return;
    }

    const url = new URL('https://api.vk.com/method/messages.send');
    url.searchParams.set('access_token', this.token);
    url.searchParams.set('user_id', this.adminId);
    url.searchParams.set('message', message);
    url.searchParams.set('random_id', String(Date.now()));
    url.searchParams.set('v', '5.199');

    try {
      const response = await fetch(url.toString());
      const data = (await response.json()) as {
        response?: number;
        error?: { error_code?: number; error_msg?: string };
      };

      if (data.error) {
        this.logger.warn(
          `VK notify failed: ${data.error.error_code} ${data.error.error_msg}`,
        );
        return;
      }

      this.logger.log('VK admin notify sent');
    } catch (error) {
      this.logger.warn(`VK notify network error: ${String(error)}`);
    }
  }

  private get token(): string {
    return this.config.get<string>('VK_BOT_TOKEN', '').trim();
  }

  private get adminId(): string {
    return this.config.get<string>('VK_ADMIN_ID', '').trim();
  }

  private get adminUrl(): string {
    return this.config
      .get<string>('ADMIN_PANEL_URL', 'https://admin.mindbodyhub.pro')
      .replace(/\/$/, '');
  }
}
