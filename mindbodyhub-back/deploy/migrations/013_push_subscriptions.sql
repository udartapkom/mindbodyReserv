-- Web Push subscriptions + user notification preferences

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_support_replies BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_new_materials BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_daily_quote BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent VARCHAR(512) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_push_subscriptions_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions (user_id);
