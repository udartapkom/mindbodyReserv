import { timingSafeEqual } from 'crypto';

/** Constant-time string compare (length mismatch still fails safely). */
export function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');

  if (left.length !== right.length) {
    if (left.length > 0) {
      timingSafeEqual(left, left);
    }
    return false;
  }

  if (left.length === 0) {
    return true;
  }

  return timingSafeEqual(left, right);
}
