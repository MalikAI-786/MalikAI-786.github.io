-- The application role. Deliberately not the owner and deliberately not a
-- superuser: RLS is silently skipped for both, which would turn every policy
-- in 002 into decoration.
--
-- Run this as a superuser once, then point DATABASE_URL at mizan_app.
-- The password is supplied at deploy time and never committed.

\set app_password `echo "$MIZAN_APP_PASSWORD"`

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mizan_app') THEN
    CREATE ROLE mizan_app LOGIN;
  END IF;
END $$;

ALTER ROLE mizan_app WITH PASSWORD :'app_password';
ALTER ROLE mizan_app NOBYPASSRLS;

GRANT USAGE ON SCHEMA public TO mizan_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mizan_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mizan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mizan_app;
