import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightsModule } from '../insights/insights.module';
import { QuotesModule } from '../quotes/quotes.module';
import { User } from '../users/entities/user.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { TariffExpiryReminder } from './entities/tariff-expiry-reminder.entity';
import { InsightPushCronService } from './insight-push-cron.service';
import { PushController } from './push.controller';
import { PushNotifyService } from './push-notify.service';
import { QuotePushCronService } from './quote-push-cron.service';
import { TariffExpiryPushCronService } from './tariff-expiry-push-cron.service';
import { VkNotifyService } from './vk-notify.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscription, TariffExpiryReminder, User]),
    QuotesModule,
    InsightsModule,
  ],
  controllers: [PushController],
  providers: [
    VkNotifyService,
    PushNotifyService,
    QuotePushCronService,
    InsightPushCronService,
    TariffExpiryPushCronService,
  ],
  exports: [VkNotifyService, PushNotifyService],
})
export class NotificationsModule {}
