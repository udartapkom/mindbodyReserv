import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type WindowEntry = {
  count: number;
  windowStartedAt: number;
};

/** In-memory rate limit for public ticket creation by phone. */
@Injectable()
export class TicketRateService {
  private readonly byPhone = new Map<string, WindowEntry>();
  private readonly maxPerWindow = 5;
  private readonly windowMs = 60 * 60 * 1000;

  assertAllowed(phone: string): void {
    const now = Date.now();
    let entry = this.byPhone.get(phone);

    if (!entry || now - entry.windowStartedAt > this.windowMs) {
      entry = { count: 0, windowStartedAt: now };
    }

    if (entry.count >= this.maxPerWindow) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many ticket requests for this phone. Try again later.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count += 1;
    this.byPhone.set(phone, entry);
  }
}
