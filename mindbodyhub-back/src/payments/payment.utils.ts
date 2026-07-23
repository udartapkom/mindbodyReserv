/**
 * Parse tariff.price string into integer rubles.
 * Accepts: "999", "999₽", "999 ₽", "1 990", "1990.00"
 */
export function parsePriceAmount(raw: string): number | null {
  const normalized = raw
    .replace(/\u00a0/g, ' ')
    .replace(/,/g, '.')
    .trim();

  const match = normalized.match(/(\d+(?:[.\s]\d+)*)/);
  if (!match) {
    return null;
  }

  const digits = match[1].replace(/\s/g, '');
  const value = Number.parseFloat(digits);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}
