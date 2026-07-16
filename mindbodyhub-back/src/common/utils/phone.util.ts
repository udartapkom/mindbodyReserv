export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  if (phone.startsWith('+') && digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`;
  }

  throw new Error('Invalid phone format');
}

export function isValidPhone(phone: string): boolean {
  try {
    const normalized = normalizePhone(phone);
    return /^\+7\d{10}$/.test(normalized);
  } catch {
    return false;
  }
}
