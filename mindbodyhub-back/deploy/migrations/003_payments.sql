-- Payments table for Platega integration
-- Run manually in production (synchronize is disabled when NODE_ENV=production)

DO $$ BEGIN
  CREATE TYPE payments_status_enum AS ENUM (
    'pending',
    'paid',
    'canceled',
    'failed',
    'chargeback'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tariff_type VARCHAR(50) NOT NULL,
  tariff_id UUID NULL,
  amount INT NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'RUB',
  status payments_status_enum NOT NULL DEFAULT 'pending',
  provider VARCHAR(32) NOT NULL DEFAULT 'platega',
  provider_transaction_id VARCHAR(128) NULL,
  payment_url VARCHAR(2048) NULL,
  description VARCHAR(255) NOT NULL,
  raw_callback JSONB NULL,
  paid_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_tx
  ON payments (provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;
