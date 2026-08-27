import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InsightsService } from '../insights/insights.service';
import { PushNotifyService } from './push-notify.service';

@Injectable()
export class InsightPushCronService {
  private readonly logger = new Logger(InsightPushCronService.name);

  constructor(
    private readonly insightsService: InsightsService,
    private readonly pushNotify: PushNotifyService,
  ) {}

  /**
   * Every day at 06:05 UTC = 09:05 Europe/Moscow.
   * Pushes when an insight's publishedAt falls on today's Moscow day
   * (supports delayed publish; most days no-op for weekly cadence).
   */
  @Cron('5 6 * * *')
  async sendInsightPush(): Promise<void> {
    try {
      if (!this.pushNotify.isConfigured()) {
        return;
      }

      const insight = await this.insightsService.findToday();
      if (!insight) {
        this.logger.debug('No insight for today — skip push');
        return;
      }

      await this.pushNotify.notifyNewInsight({
        title: insight.title,
        slug: insight.slug,
      });
      this.logger.log(`Insight push dispatched for «${insight.title}»`);
    } catch (error) {
      this.logger.error(
        'Failed to send insight push',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
