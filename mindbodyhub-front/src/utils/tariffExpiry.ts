export type TariffExpiryUrgency = "ok" | "soon" | "today" | "expired";

export type TariffExpiryInfo = {
  urgency: TariffExpiryUrgency;
  /** Whole calendar days until expiry (UTC date). Negative if past. */
  daysLeft: number;
  expiresAt: Date;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Calendar days from today (UTC) until expiry date (UTC). */
export function getTariffDaysLeft(expiresAtIso: string, now = new Date()): number {
  const expires = new Date(expiresAtIso);
  if (Number.isNaN(expires.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const today = startOfUtcDay(now).getTime();
  const end = startOfUtcDay(expires).getTime();
  return Math.round((end - today) / MS_PER_DAY);
}

export function getTariffExpiryInfo(
  tariff: string | null | undefined,
  expiresAtIso: string | null | undefined,
  soonDays = 3,
  now = new Date(),
): TariffExpiryInfo | null {
  if (!tariff || tariff === "free" || !expiresAtIso) {
    return null;
  }

  const expiresAt = new Date(expiresAtIso);
  if (Number.isNaN(expiresAt.getTime())) {
    return null;
  }

  const daysLeft = getTariffDaysLeft(expiresAtIso, now);

  let urgency: TariffExpiryUrgency = "ok";
  if (daysLeft < 0) {
    urgency = "expired";
  } else if (daysLeft === 0) {
    urgency = "today";
  } else if (daysLeft <= soonDays) {
    urgency = "soon";
  }

  return { urgency, daysLeft, expiresAt };
}

export function formatTariffExpiryReminder(info: TariffExpiryInfo): {
  title: string;
  text: string;
} {
  const dateLabel = info.expiresAt.toLocaleDateString("ru-RU", {
    timeZone: "UTC",
  });

  if (info.urgency === "expired") {
    return {
      title: "Доступ по тарифу закончился",
      text: `Срок действия истёк ${dateLabel}. Продлите тариф, чтобы снова открыть материалы.`,
    };
  }

  if (info.urgency === "today") {
    return {
      title: "Сегодня последний день тарифа",
      text: `Доступ действует до ${dateLabel}. Продлите заранее, чтобы не потерять материалы.`,
    };
  }

  const daysWord =
    info.daysLeft === 1
      ? "день"
      : info.daysLeft >= 2 && info.daysLeft <= 4
        ? "дня"
        : "дней";

  return {
    title: `Тариф истекает через ${info.daysLeft} ${daysWord}`,
    text: `Действует до ${dateLabel}. Продлите доступ, чтобы ничего не прерывалось.`,
  };
}
