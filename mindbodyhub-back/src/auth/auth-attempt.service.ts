import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type AttemptEntry = {
  count: number;
  windowStartedAt: number;
  lockedUntil: number | null;
};

/** In-memory failed-login tracking by phone (lockout after N failures). */
@Injectable()
export class AuthAttemptService {
  private readonly attempts = new Map<string, AttemptEntry>();

  /** Failures within the window before lockout. */
  private readonly maxFailures = 5;
  /** Sliding window for counting failures. */
  private readonly windowMs = 15 * 60 * 1000;
  /** Lock duration after maxFailures. */
  private readonly lockMs = 15 * 60 * 1000;

  assertNotLocked(phone: string): void {
    const entry = this.getFresh(phone);
    if (entry?.lockedUntil && entry.lockedUntil > Date.now()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many failed login attempts. Try again later.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(phone: string): void {
    const now = Date.now();
    let entry = this.getFresh(phone);

    if (!entry) {
      entry = { count: 0, windowStartedAt: now, lockedUntil: null };
    }

    entry.count += 1;

    if (entry.count >= this.maxFailures) {
      entry.lockedUntil = now + this.lockMs;
      entry.count = 0;
      entry.windowStartedAt = now;
    }

    this.attempts.set(phone, entry);
  }

  recordSuccess(phone: string): void {
    this.attempts.delete(phone);
  }

  private getFresh(phone: string): AttemptEntry | undefined {
    const entry = this.attempts.get(phone);
    if (!entry) {
      return undefined;
    }

    const now = Date.now();

    if (entry.lockedUntil && entry.lockedUntil <= now) {
      this.attempts.delete(phone);
      return undefined;
    }

    if (
      !entry.lockedUntil &&
      now - entry.windowStartedAt > this.windowMs
    ) {
      this.attempts.delete(phone);
      return undefined;
    }

    return entry;
  }
}
