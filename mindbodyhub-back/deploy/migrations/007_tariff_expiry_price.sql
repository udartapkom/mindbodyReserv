-- Price amount + duration for tariffs; expiry for users

ALTER TABLE tariffs
  ADD COLUMN IF NOT EXISTS price_amount INT NULL;

ALTER TABLE tariffs
  ADD COLUMN IF NOT EXISTS duration_days INT NOT NULL DEFAULT 30;

-- Backfill price_amount from display price string (digits only)
UPDATE tariffs
SET price_amount = ROUND(
  NULLIF(
    regexp_replace(
      regexp_replace(price, '[^0-9.,]', '', 'g'),
      ',',
      '.',
      'g'
    ),
    ''
  )::numeric
)::int
WHERE price_amount IS NULL
  AND price IS NOT NULL
  AND price <> '';

-- Trial is weekly
UPDATE tariffs SET duration_days = 7 WHERE type = 'trial';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tariff_expires_at TIMESTAMPTZ NULL;
