import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Prefer real client IP behind nginx (`X-Forwarded-For` / `X-Real-IP`).
 * Requires `trust proxy` in main.ts when running behind a reverse proxy.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const forwarded = req['headers'] as Record<string, string | string[] | undefined> | undefined;
    const xff = forwarded?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0].trim();
    }
    if (Array.isArray(xff) && xff[0]) {
      return String(xff[0]).split(',')[0].trim();
    }

    const realIp = forwarded?.['x-real-ip'];
    if (typeof realIp === 'string' && realIp.length > 0) {
      return realIp.trim();
    }

    const ip = req['ip'];
    if (typeof ip === 'string' && ip.length > 0) {
      return ip;
    }

    return 'unknown';
  }
}
