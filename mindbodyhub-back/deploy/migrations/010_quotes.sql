-- Daily quotes feed (cabinet, trial+ access)

DO $$ BEGIN
  CREATE TYPE quotes_status_enum AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  author VARCHAR(255) NULL,
  status quotes_status_enum NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_status_published_at
  ON quotes (status, published_at DESC);
