import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTariff } from '../common/tariff/access.types';
import { User } from '../users/entities/user.entity';
import { TariffExpiryReminder } from './entities/tariff-expiry-reminder.entity';
import { PushNotifyService } from './push-notify.service';

/** Remind this many calendar days before expiry (UTC). */
const REMINDER_DAYS_BEFORE = [3, 1, 0] as const;

@Injectable()
export class TariffExpiryPushCronService {
  private readonly logger = new Logger(TariffExpiryPushCronService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(TariffExpiryReminder)
    private readonly remindersRepository: Repository<TariffExpiryReminder>,
    private readonly pushNotify: PushNotifyService,
  ) {}

  /**
   * Every day at 07:00 UTC = 10:00 Europe/Moscow.
   * Runs after 03:00 expiry reset and 06:00 quote push.
   */
  @Cron('0 7 * * *')
  async sendTariffExpiryReminders(): Promise<void> {
    try {
      if (!this.pushNotify.isConfigured()) {
        return;
      }

      const sent = await this.dispatchReminders();
      this.logger.log(`Tariff expiry reminders sent: ${sent}`);
    } catch (error) {
      this.logger.error(
        'Failed to send tariff expiry reminders',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Exposed for tests / manual trigger. */
  async dispatchReminders(now = new Date()): Promise<number> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.tariff',
        'user.tariffExpiresAt',
        'user.notifyTariffExpiry',
      ])
      .where('user.isActive = :active', { active: true })
      .andWhere('user.notifyTariffExpiry = :notify', { notify: true })
      .andWhere('user.tariff IN (:...tariffs)', {
        tariffs: [UserTariff.TRIAL, UserTariff.POPULAR, UserTariff.VIP],
      })
      .andWhere('user.tariffExpiresAt IS NOT NULL')
      .getMany();

    let sent = 0;

    for (const user of users) {
      if (!user.tariffExpiresAt) continue;

      const daysLeft = this.calendarDaysLeft(user.tariffExpiresAt, now);
      if (!(REMINDER_DAYS_BEFORE as readonly number[]).includes(daysLeft)) {
        continue;
      }

      const alreadySent = await this.remindersRepository.findOne({
        where: {
          userId: user.id,
          daysBefore: daysLeft,
          expiresAt: user.tariffExpiresAt,
        },
      });
      if (alreadySent) {
        continue;
      }

      const hasSubs = await this.pushNotify.hasSubscriptions(user.id);
      if (!hasSubs) {
        continue;
      }

      await this.pushNotify.notifyTariffExpiry(user.id, {
        daysLeft,
        tariff: user.tariff,
        expiresAt: user.tariffExpiresAt,
      });

      await this.remindersRepository.save(
        this.remindersRepository.create({
          userId: user.id,
          daysBefore: daysLeft,
          expiresAt: user.tariffExpiresAt,
        }),
      );
      sent += 1;
    }

    return sent;
  }

  private calendarDaysLeft(expiresAt: Date, now: Date): number {
    const startOfDay = (d: Date) =>
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round(
      (startOfDay(expiresAt) - startOfDay(now)) / msPerDay,
    );
  }
}
