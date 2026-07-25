/** ITU E.164: + and 8–15 digits total (country code + subscriber). */
export const PHONE_E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const PHONE_E164_MESSAGE =
  'Phone must be a valid international number in E.164 format, e.g. +79001234567';

/**
 * Normalize phone to E.164 (+ and digits only).
 * Keeps RU/KZ convenience: 8XXXXXXXXXX, 7XXXXXXXXXX, or 10 local digits → +7…
 */
export function normalizePhone(phone: string): string {
  const trimmed = String(phone).trim();
  if (!trimmed) {
    throw new Error('Invalid phone format');
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Invalid phone format');
  }

  let normalized: string;

  if (digits.length === 11 && digits.startsWith('8')) {
    normalized = `+7${digits.slice(1)}`;
  } else if (digits.length === 11 && digits.startsWith('7')) {
    normalized = `+${digits}`;
  } else if (digits.length === 10) {
    normalized = `+7${digits}`;
  } else {
    normalized = `+${digits}`;
  }

  if (!PHONE_E164_REGEX.test(normalized)) {
    throw new Error('Invalid phone format');
  }

  return normalized;
}

export function isValidPhone(phone: string): boolean {
  try {
    normalizePhone(phone);
    return true;
  } catch {
    return false;
  }
}
