-- Unique refresh token hashes (reuse detection / integrity).
-- Drop non-unique index from 000_initial_schema if present, then enforce UNIQUE.

DROP INDEX IF EXISTS idx_refresh_tokens_token_hash;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_refresh_tokens_token_hash'
  ) THEN
    ALTER TABLE refresh_tokens
      ADD CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash);
  END IF;
END $$;
