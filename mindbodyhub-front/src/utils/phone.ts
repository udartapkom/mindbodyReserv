export type PhoneCountryId = 'ru' | 'kz' | 'by' | 'other';

export type PhoneCountryOption = {
  id: PhoneCountryId;
  /** Short ISO-like code shown in the selector (RU, KZ…) */
  code: string;
  label: string;
  dialCode: string;
  /** PatternFormat mask; null = free E.164 input */
  format: string | null;
  placeholder: string;
  /** Digits after dial code expected for masked countries */
  nationalLength: number | null;
};

export const PHONE_COUNTRIES: PhoneCountryOption[] = [
  {
    id: 'ru',
    code: 'RU',
    label: 'Россия (+7)',
    dialCode: '7',
    format: '+7 (###) ###-##-##',
    placeholder: '+7 (___) ___-__-__',
    nationalLength: 10,
  },
  {
    id: 'kz',
    code: 'KZ',
    label: 'Казахстан (+7)',
    dialCode: '7',
    format: '+7 (###) ###-##-##',
    placeholder: '+7 (___) ___-__-__',
    nationalLength: 10,
  },
  {
    id: 'by',
    code: 'BY',
    label: 'Беларусь (+375)',
    dialCode: '375',
    format: '+375 (##) ###-##-##',
    placeholder: '+375 (__) ___-__-__',
    nationalLength: 9,
  },
  {
    id: 'other',
    code: 'OTH',
    label: 'Другая страна',
    dialCode: '',
    format: null,
    placeholder: '+XXXXXXXXXXX',
    nationalLength: null,
  },
];

export const DEFAULT_PHONE_COUNTRY: PhoneCountryId = 'ru';

/** ITU E.164: + and 8–15 digits total. */
export const PHONE_E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function getPhoneCountry(id: PhoneCountryId): PhoneCountryOption {
  return PHONE_COUNTRIES.find((item) => item.id === id) ?? PHONE_COUNTRIES[0];
}

export function detectPhoneCountry(phone: string): PhoneCountryId {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('375')) return 'by';
  if (digits.startsWith('7') && digits.length >= 11) return 'ru';
  if (phone.trim().startsWith('+') && digits.length >= 8 && !digits.startsWith('7')) {
    return 'other';
  }
  return DEFAULT_PHONE_COUNTRY;
}

/**
 * Normalize phone to E.164. Mirrors backend phone.util.
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

export function sanitizeInternationalPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return raw.includes('+') ? '+' : '';
  }
  return `+${digits}`;
}
