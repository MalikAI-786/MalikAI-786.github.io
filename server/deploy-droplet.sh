#!/usr/bin/env bash
#
# One command, on a fresh DigitalOcean Droplet, from this directory.
#
#   ./deploy-droplet.sh
#
# It refuses to guess: if .env is missing it writes one with generated
# passwords and stops so you can set the two URLs. Everything is idempotent —
# running it twice is safe and will not wipe the database.
set -euo pipefail
cd "$(dirname "$0")"

need() { command -v "$1" >/dev/null || { echo "missing: $1"; exit 1; }; }
need docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required (docker compose, not docker-compose)."; exit 1
fi

if [ ! -f .env ]; then
  echo "No .env found — writing one with generated passwords."
  {
    echo "POSTGRES_PASSWORD=$(openssl rand -base64 30 | tr -d '/+=' | head -c 32)"
    echo "MIZAN_APP_PASSWORD=$(openssl rand -base64 30 | tr -d '/+=' | head -c 32)"
    echo "PUBLIC_URL=https://CHANGE-ME.your-domain.com"
    echo "APP_URL=https://malikai-786.github.io/mizan/coach/"
  } > .env
  chmod 600 .env
  echo
  echo "  Set PUBLIC_URL in .env to where this API will answer, then run again."
  echo "  The two passwords are already generated. Do not commit this file."
  exit 0
fi

set -a; . ./.env; set +a
: "${POSTGRES_PASSWORD:?}"; : "${MIZAN_APP_PASSWORD:?}"
case "${PUBLIC_URL:-}" in *CHANGE-ME*|"") echo "Set PUBLIC_URL in .env first."; exit 1;; esac

echo "==> building and starting"
docker compose up -d --build

echo "==> waiting for postgres"
for i in $(seq 1 60); do
  docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 2
  [ "$i" = 60 ] && { echo "postgres did not come up"; docker compose logs db | tail -20; exit 1; }
done

# Only build the schema on a database that has none. Re-running must never
# drop a live table — rebuild.sh starts with DROP SCHEMA and would take the
# whole record with it.
if docker compose exec -T db psql -U postgres -d mizan -tAc \
     "select to_regclass('public.people') is not null" 2>/dev/null | grep -q t; then
  echo "==> schema already present, leaving it alone"
else
  echo "==> creating schema and application role"
  docker compose exec -T db mkdir -p /tmp/sql
  for f in 001_schema.sql 002_rls.sql 003_roles.sql; do
    docker compose cp "sql/$f" "db:/tmp/sql/$f"
  done
  docker compose exec -T -e MIZAN_APP_PASSWORD="$MIZAN_APP_PASSWORD" db sh -c '
    set -e
    for f in 001_schema.sql 002_rls.sql 003_roles.sql; do
      psql -U postgres -d mizan -v ON_ERROR_STOP=1 -q -f /tmp/sql/$f
    done'
  echo "==> schema created"
fi

echo "==> health check"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8080/healthz >/dev/null 2>&1; then
    echo
    echo "  API is up on 127.0.0.1:8080"
    echo
    echo "  Next: point a reverse proxy at it for TLS. With Caddy that is two lines:"
    echo "      ${PUBLIC_URL#https://} {"
    echo "        reverse_proxy 127.0.0.1:8080"
    echo "      }"
    echo
    echo "  Then create yourself and mint the coach links:"
    echo "      ./bootstrap.sh \"Your Name\""
    exit 0
  fi
  sleep 2
done
echo "API did not answer /healthz"; docker compose logs api | tail -30; exit 1
