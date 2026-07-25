-- Initial schema for production (synchronize is disabled when NODE_ENV=production)
-- Idempotent where practical (IF NOT EXISTS / DO EXCEPTION blocks)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE users_role_enum AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE users_tariff_enum AS ENUM ('free', 'trial', 'popular', 'vip');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE materials_status_enum AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE knowledge_articles_status_enum AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tickets_status_enum AS ENUM ('new', 'in_progress', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tickets_source_enum AS ENUM ('home', 'support', 'cabinet', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE users_phone_country_enum AS ENUM ('ru', 'kz', 'by', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(255) NOT NULL UNIQUE,
  phone_country users_phone_country_enum,
  password_hash VARCHAR(255) NOT NULL,
  role users_role_enum NOT NULL DEFAULT 'user',
  tariff users_tariff_enum NOT NULL DEFAULT 'free',
  avatar_url VARCHAR(2048),
  phone_verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

CREATE TABLE IF NOT EXISTS tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  title_color VARCHAR(32),
  price VARCHAR(50) NOT NULL,
  period VARCHAR(50) NOT NULL,
  sub_title VARCHAR(200) NOT NULL,
  description TEXT[] NOT NULL DEFAULT '{}',
  image VARCHAR(512) NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status materials_status_enum NOT NULL DEFAULT 'draft',
  blocks JSONB NOT NULL DEFAULT '[]',
  tariff_type VARCHAR(50) NOT NULL DEFAULT 'free',
  cover_url VARCHAR(2048),
  summary TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status knowledge_articles_status_enum NOT NULL DEFAULT 'draft',
  blocks JSONB NOT NULL DEFAULT '[]',
  cover_url VARCHAR(2048),
  summary TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status tickets_status_enum NOT NULL DEFAULT 'new',
  source tickets_source_enum NOT NULL DEFAULT 'other',
  user_id UUID,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  support_telegram_url VARCHAR(2048) NOT NULL DEFAULT 'https://t.me/mbh_support',
  support_vk_url VARCHAR(2048) NOT NULL DEFAULT 'https://vk.com/mindbodyhubpro',
  support_max_url VARCHAR(2048) NOT NULL DEFAULT 'https://max.ru',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, support_telegram_url, support_vk_url, support_max_url)
VALUES (
  1,
  'https://t.me/mbh_support',
  'https://vk.com/mindbodyhubpro',
  'https://max.ru'
)
ON CONFLICT (id) DO NOTHING;
