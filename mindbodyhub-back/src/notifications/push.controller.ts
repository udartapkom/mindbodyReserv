import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SubscribePushDto, UnsubscribePushDto } from './dto/push-subscribe.dto';
import { PushNotifyService } from './push-notify.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushNotify: PushNotifyService) {}

  @Public()
  @Get('vapid-public-key')
  getVapidPublicKey(): { publicKey: string | null } {
    return { publicKey: this.pushNotify.getPublicKey() };
  }

  @Get('status')
  async getStatus(
    @CurrentUser() user: AuthUser,
  ): Promise<{ configured: boolean; subscribed: boolean }> {
    return {
      configured: this.pushNotify.isConfigured(),
      subscribed: await this.pushNotify.hasSubscriptions(user.id),
    };
  }

  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubscribePushDto,
    @Req() req: Request,
  ): Promise<{ success: true }> {
    await this.pushNotify.upsertSubscription(user.id, {
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      userAgent: dto.userAgent ?? req.headers['user-agent'] ?? null,
    });
    return { success: true };
  }

  @Delete('subscribe')
  async unsubscribe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UnsubscribePushDto,
  ): Promise<{ success: true }> {
    await this.pushNotify.removeSubscription(user.id, dto.endpoint);
    return { success: true };
  }
}
