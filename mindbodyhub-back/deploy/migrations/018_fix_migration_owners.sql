-- Ensure objects created by postgres-role migrations are usable by the app role.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mindbodyhub') THEN
    IF to_regclass('public.insights') IS NOT NULL THEN
      EXECUTE 'ALTER TABLE insights OWNER TO mindbodyhub';
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'insights_status_enum'
    ) THEN
      EXECUTE 'ALTER TYPE insights_status_enum OWNER TO mindbodyhub';
    END IF;

    IF to_regclass('public.tariff_expiry_reminders') IS NOT NULL THEN
      EXECUTE 'ALTER TABLE tariff_expiry_reminders OWNER TO mindbodyhub';
    END IF;
  END IF;
END $$;
