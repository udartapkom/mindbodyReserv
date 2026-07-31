import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QuotesService } from '../quotes/quotes.service';
import { PushNotifyService } from './push-notify.service';

@Injectable()
export class QuotePushCronService {
  private readonly logger = new Logger(QuotePushCronService.name);

  constructor(
    private readonly quotesService: QuotesService,
    private readonly pushNotify: PushNotifyService,
  ) {}

  /** Every day at 06:00 UTC = 09:00 Europe/Moscow (no DST in Moscow). */
  @Cron('0 6 * * *')
  async sendDailyQuotePush(): Promise<void> {
    try {
      if (!this.pushNotify.isConfigured()) {
        return;
      }

      const quote = await this.quotesService.findToday();
      if (!quote) {
        this.logger.debug('No quote for today — skip daily push');
        return;
      }

      await this.pushNotify.notifyDailyQuote({ body: quote.body });
      this.logger.log('Daily quote push dispatched');
    } catch (error) {
      this.logger.error(
        'Failed to send daily quote push',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
