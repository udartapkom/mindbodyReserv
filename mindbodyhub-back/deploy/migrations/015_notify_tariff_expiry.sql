-- Tariff expiry push prefs + dedup for reminder sends

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_tariff_expiry BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS tariff_expiry_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  days_before INT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tariff_expiry_reminders_user_days_expires
    UNIQUE (user_id, days_before, expires_at)
);

CREATE INDEX IF NOT EXISTS idx_tariff_expiry_reminders_user_id
  ON tariff_expiry_reminders (user_id);
