import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as webpush from 'web-push';
import {
  FREE_ACCESS_TYPE,
  REGISTERED_ACCESS_TYPE,
  UserTariff,
  isMaterialAccessible,
  canAccessQuotes,
} from '../common/tariff/access.types';
import { User } from '../users/entities/user.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { PushPayload } from './push.types';

@Injectable()
export class PushNotifyService {
  private readonly logger = new Logger(PushNotifyService.name);
  private vapidReady = false;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(PushSubscription)
    private readonly subscriptionsRepository: Repository<PushSubscription>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    this.initVapid();
  }

  isConfigured(): boolean {
    return this.vapidReady;
  }

  getPublicKey(): string | null {
    const key = this.config.get<string>('VAPID_PUBLIC_KEY', '').trim();
    return key || null;
  }

  async upsertSubscription(
    userId: string,
    data: {
      endpoint: string;
      p256dh: string;
      auth: string;
      userAgent?: string | null;
    },
  ): Promise<PushSubscription> {
    const existing = await this.subscriptionsRepository.findOne({
      where: { endpoint: data.endpoint },
    });

    if (existing) {
      existing.userId = userId;
      existing.p256dh = data.p256dh;
      existing.auth = data.auth;
      existing.userAgent = data.userAgent?.slice(0, 512) ?? null;
      return this.subscriptionsRepository.save(existing);
    }

    return this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent?.slice(0, 512) ?? null,
      }),
    );
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    await this.subscriptionsRepository.delete({ userId, endpoint });
  }

  async hasSubscriptions(userId: string): Promise<boolean> {
    const count = await this.subscriptionsRepository.count({ where: { userId } });
    return count > 0;
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug('Web Push skipped: VAPID keys not configured');
      return;
    }

    const subscriptions = await this.subscriptionsRepository.find({
      where: { userId },
    });

    await Promise.all(
      subscriptions.map((sub) => this.sendToSubscription(sub, payload)),
    );
  }

  async notifySupportReply(
    userId: string,
    payload: { ticketId: string; preview: string },
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user?.isActive || !user.notifySupportReplies) {
      this.logger.debug(
        `Support push skipped for ${userId}: inactive or prefs off`,
      );
      return;
    }

    const subscriptions = await this.subscriptionsRepository.count({
      where: { userId },
    });
    if (subscriptions === 0) {
      this.logger.warn(
        `Support push skipped for ${userId}: no push subscriptions`,
      );
      return;
    }

    const body =
      payload.preview.length > 120
        ? `${payload.preview.slice(0, 120)}…`
        : payload.preview;

    this.logger.log(
      `Sending support push to ${userId} (${subscriptions} device(s))`,
    );

    await this.sendToUser(userId, {
      title: 'Ответ поддержки',
      body: body || 'Вам ответили в техподдержке',
      url: '/cabinet/support',
    });
  }

  async notifyNewMaterial(material: {
    title: string;
    slug: string;
    tariffType: string;
  }): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const recipients = await this.findMaterialRecipients(material.tariffType);
    if (recipients.length === 0) {
      return;
    }

    const url = this.materialUrl(material);
    const payload: PushPayload = {
      title: 'Новый материал',
      body: material.title,
      url,
    };

    await Promise.all(
      recipients.map((userId) => this.sendToUser(userId, payload)),
    );
  }

  async notifyTariffExpiry(
    userId: string,
    payload: { daysLeft: number; tariff: UserTariff; expiresAt: Date },
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user?.isActive || !user.notifyTariffExpiry) {
      return;
    }

    const dateLabel = payload.expiresAt.toLocaleDateString('ru-RU', {
      timeZone: 'UTC',
    });

    let title: string;
    let body: string;

    if (payload.daysLeft === 0) {
      title = 'Сегодня последний день тарифа';
      body = `Доступ действует до ${dateLabel}. Продлите, чтобы не потерять материалы.`;
    } else if (payload.daysLeft === 1) {
      title = 'Тариф истекает завтра';
      body = `Действует до ${dateLabel}. Продлите доступ заранее.`;
    } else {
      title = `Тариф истекает через ${payload.daysLeft} дня`;
      body = `Действует до ${dateLabel}. Продлите доступ, чтобы ничего не прерывалось.`;
    }

    await this.sendToUser(userId, {
      title,
      body,
      url: '/price',
    });
  }

  async notifyDailyQuote(quote: { body: string }): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const users = await this.usersRepository.find({
      where: {
        isActive: true,
        notifyDailyQuote: true,
        tariff: In([UserTariff.TRIAL, UserTariff.POPULAR, UserTariff.VIP]),
      },
      select: ['id', 'tariff', 'role'],
    });

    const eligible = users.filter((user) =>
      canAccessQuotes({
        isAuthenticated: true,
        userTariff: user.tariff,
        userRole: user.role,
      }),
    );

    const body =
      quote.body.length > 140 ? `${quote.body.slice(0, 140)}…` : quote.body;

    const payload: PushPayload = {
      title: 'Цитата дня',
      body,
      url: '/cabinet',
    };

    await Promise.all(
      eligible.map((user) => this.sendToUser(user.id, payload)),
    );
  }

  private async findMaterialRecipients(
    materialTariffType: string,
  ): Promise<string[]> {
    const users = await this.usersRepository.find({
      where: { isActive: true, notifyNewMaterials: true },
      select: ['id', 'tariff'],
    });

    return users
      .filter((user) =>
        isMaterialAccessible(materialTariffType, {
          isAuthenticated: true,
          userTariff: user.tariff,
        }),
      )
      .map((user) => user.id);
  }

  private materialUrl(material: {
    slug: string;
    tariffType: string;
  }): string {
    if (
      material.tariffType === FREE_ACCESS_TYPE ||
      material.tariffType === REGISTERED_ACCESS_TYPE
    ) {
      return `/problems/${material.slug}`;
    }
    return `/cabinet/materials/${material.tariffType}/${material.slug}`;
  }

  private async sendToSubscription(
    subscription: PushSubscription,
    payload: PushPayload,
  ): Promise<void> {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify(payload),
      );
    } catch (error) {
      const statusCode =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof (error as { statusCode?: unknown }).statusCode === 'number'
          ? (error as { statusCode: number }).statusCode
          : null;

      if (statusCode === 404 || statusCode === 410) {
        await this.subscriptionsRepository.delete({ id: subscription.id });
        this.logger.warn(
          `Removed expired push subscription ${subscription.id} (HTTP ${statusCode})`,
        );
        return;
      }

      const body =
        typeof error === 'object' &&
        error !== null &&
        'body' in error &&
        typeof (error as { body?: unknown }).body === 'string'
          ? (error as { body: string }).body
          : '';

      this.logger.warn(
        `Web Push failed for ${subscription.id}: status=${statusCode ?? 'n/a'} ${body || String(error)}`,
      );
    }
  }

  private initVapid(): void {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY', '').trim();
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY', '').trim();
    const subject = this.config
      .get<string>('VAPID_SUBJECT', 'mailto:support@mindbodyhub.pro')
      .trim();

    if (!publicKey || !privateKey) {
      this.logger.warn('Web Push disabled: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set');
      return;
    }

    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.vapidReady = true;
    } catch (error) {
      this.logger.warn(`Web Push VAPID init failed: ${String(error)}`);
    }
  }
}
