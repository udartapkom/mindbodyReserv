-- Selected phone country for admin context (RU / KZ / BY / other)

DO $$ BEGIN
  CREATE TYPE users_phone_country_enum AS ENUM ('ru', 'kz', 'by', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_country users_phone_country_enum;
