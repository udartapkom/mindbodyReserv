import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';

@Injectable()
export class TariffExpiryService {
  private readonly logger = new Logger(TariffExpiryService.name);

  constructor(private readonly usersService: UsersService) {}

  /** Every day at 03:00 UTC */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async expireTariffs(): Promise<void> {
    try {
      const count = await this.usersService.expireOverdueTariffs();
      if (count > 0) {
        this.logger.log(`Expired ${count} overdue tariff(s) → free`);
      } else {
        this.logger.debug('No overdue tariffs to expire');
      }
    } catch (error) {
      this.logger.error(
        'Failed to expire overdue tariffs',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
