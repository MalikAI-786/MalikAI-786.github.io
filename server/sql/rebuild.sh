#!/usr/bin/env bash
# Rebuild the schema from nothing. This is the deploy path for a new database
# and the reset path for a test run; the migrations are written to run once
# against an empty schema rather than to be re-runnable in place.
set -euo pipefail
: "${ADMIN_DATABASE_URL:?set ADMIN_DATABASE_URL (owner/superuser)}"
: "${MIZAN_APP_PASSWORD:?set MIZAN_APP_PASSWORD}"
here="$(cd "$(dirname "$0")" && pwd)"
psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -q \
  -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'
for f in 001_schema.sql 002_rls.sql 003_roles.sql; do
  echo "  applying $f"
  psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$here/$f"
done
echo "  schema rebuilt"
