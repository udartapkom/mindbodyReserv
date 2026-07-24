import { Global, Module } from '@nestjs/common';
import { VkNotifyService } from './vk-notify.service';

@Global()
@Module({
  providers: [VkNotifyService],
  exports: [VkNotifyService],
})
export class NotificationsModule {}
