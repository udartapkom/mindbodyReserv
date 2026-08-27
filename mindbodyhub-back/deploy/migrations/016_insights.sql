-- Weekly insights feed (cabinet, any tariff; delayed publish via published_at)

DO $$ BEGIN
  CREATE TYPE insights_status_enum AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status insights_status_enum NOT NULL DEFAULT 'draft',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_status_published_at
  ON insights (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_insights_slug
  ON insights (slug);

-- Deploy runs migrations as postgres; hand ownership to the app role.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mindbodyhub') THEN
    EXECUTE 'ALTER TABLE insights OWNER TO mindbodyhub';
    IF EXISTS (
      SELECT 1 FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'insights_status_enum'
    ) THEN
      EXECUTE 'ALTER TYPE insights_status_enum OWNER TO mindbodyhub';
    END IF;
  END IF;
END $$;
