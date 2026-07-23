-- Run manually in production (synchronize is disabled when NODE_ENV=production)
-- Kept for history; new installs use 000_initial_schema.sql with unified enum.
-- Existing DBs that already applied this file should run 002_unify_user_tariffs.sql.

DO $$ BEGIN
  CREATE TYPE users_tariff_enum AS ENUM ('free', 'basic', 'premium');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(2048);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tariff users_tariff_enum NOT NULL DEFAULT 'free';
