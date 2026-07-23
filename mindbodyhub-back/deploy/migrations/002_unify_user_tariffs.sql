-- Unify users.tariff with catalog: free | trial | popular | vip
-- Maps legacy basic → trial, premium → popular
-- Run manually in production (synchronize is disabled when NODE_ENV=production)

DO $$ BEGIN
  CREATE TYPE users_tariff_enum_new AS ENUM ('free', 'trial', 'popular', 'vip');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users ALTER COLUMN tariff DROP DEFAULT;

ALTER TABLE users
  ALTER COLUMN tariff TYPE users_tariff_enum_new
  USING (
    CASE tariff::text
      WHEN 'basic' THEN 'trial'::users_tariff_enum_new
      WHEN 'premium' THEN 'popular'::users_tariff_enum_new
      WHEN 'trial' THEN 'trial'::users_tariff_enum_new
      WHEN 'popular' THEN 'popular'::users_tariff_enum_new
      WHEN 'vip' THEN 'vip'::users_tariff_enum_new
      ELSE 'free'::users_tariff_enum_new
    END
  );

DROP TYPE IF EXISTS users_tariff_enum;

ALTER TYPE users_tariff_enum_new RENAME TO users_tariff_enum;

ALTER TABLE users
  ALTER COLUMN tariff SET DEFAULT 'free'::users_tariff_enum;
