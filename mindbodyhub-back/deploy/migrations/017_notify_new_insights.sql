-- Weekly insights push preference

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_new_insights BOOLEAN NOT NULL DEFAULT false;
