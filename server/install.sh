#!/usr/bin/env bash
#
# Mīzān — one command, from nothing to a working coach portal.
#
#   curl -fsSL https://raw.githubusercontent.com/MalikAI-786/MalikAI-786.github.io/claude/quranic-khudi-daily-growth-0h9jth/server/install.sh | sudo bash
#
# Installs Docker and Caddy if missing, clones the repo, generates its own
# passwords, gets a TLS certificate, creates the schema, and prints your link
# and both coach links at the end.
#
# Safe to run twice. It never drops an existing database.
set -euo pipefail

REPO=https://github.com/MalikAI-786/MalikAI-786.github.io.git
BRANCH=claude/quranic-khudi-daily-growth-0h9jth
DIR=/opt/mizan

say()  { printf '\n\033[1;38;5;173m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m  ! \033[0m%s\n' "$*"; }
die()  { printf '\n\033[1;31m  x \033[0m%s\n\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "Run this with sudo."

# When piped from curl, stdin is the script — prompts must read the terminal.
TTY=/dev/tty; [ -r $TTY ] || die "No terminal available. Download the script and run it directly instead of piping."

say "Choosing a hostname"
IP="$(curl -fsS --max-time 10 https://ifconfig.me 2>/dev/null || echo '')"
[ -n "$IP" ] || { printf '  Could not detect this droplet IP. Enter it: '; read -r IP < $TTY; }

# A bare IP cannot carry the Secure cookie this API sets, and Let's Encrypt
# will not issue an ordinary certificate for one. sslip.io resolves
# <ip>.sslip.io straight to <ip> with no DNS account and no registration, and
# because it sits on the Public Suffix List each droplet gets its own
# certificate rate limit. That gives real HTTPS, a real padlock on a coach's
# phone, and nothing to buy.
SUGGEST="${IP}.sslip.io"
printf '  This droplet is \033[1m%s\033[0m\n\n' "$IP"
printf '  If you own a domain, enter a hostname whose A record points here.\n'
printf '  If you do not, press Enter and this is used instead:\n'
printf '      \033[1m%s\033[0m   (free, no signup, real certificate)\n\n' "$SUGGEST"
printf '  Hostname [%s]: ' "$SUGGEST"
read -r HOST < $TTY
HOST="${HOST:-$SUGGEST}"
HOST="${HOST#http://}"; HOST="${HOST#https://}"; HOST="${HOST%%/*}"

# Someone will type the bare IP anyway. Convert rather than fail.
case "$HOST" in
  *[0-9].[0-9]*) case "$HOST" in
      *.*.*.*) [ "${HOST%%[!0-9.]*}" = "$HOST" ] && {
          warn "A bare IP cannot get a certificate. Using ${HOST}.sslip.io instead."
          HOST="${HOST}.sslip.io"; }
      ;;
    esac ;;
esac

case "$HOST" in
  *.sslip.io|*.nip.io) RESOLVED="$IP" ;;   # resolves by construction
  *) RESOLVED="$(getent hosts "$HOST" | awk '{print $1}' | head -1 || true)" ;;
esac
if [ -z "$RESOLVED" ]; then
  warn "$HOST does not resolve yet. Certificates will fail until the DNS A record exists."
  printf '  Continue anyway? [y/N] '; read -r GO < $TTY
  case "${GO:-n}" in y|Y) ;; *) die "Point $HOST at $IP, then run this again.";; esac
elif [ "$RESOLVED" != "$IP" ] && [ "$IP" != unknown ]; then
  warn "$HOST resolves to $RESOLVED but this droplet looks like $IP."
  printf '  Continue anyway? [y/N] '; read -r GO < $TTY
  case "${GO:-n}" in y|Y) ;; *) die "Fix the DNS A record, then run this again.";; esac
fi

say "Installing what is missing"
export DEBIAN_FRONTEND=noninteractive
command -v git >/dev/null || { apt-get update -qq && apt-get install -y -qq git; }
if ! command -v docker >/dev/null; then curl -fsSL https://get.docker.com | sh >/dev/null; fi
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required."
if ! command -v caddy >/dev/null; then
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl gnupg >/dev/null
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq && apt-get install -y -qq caddy >/dev/null
fi

say "Fetching the code"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch --depth 1 origin "$BRANCH" -q
  git -C "$DIR" checkout -q FETCH_HEAD
else
  git clone --depth 1 -b "$BRANCH" "$REPO" "$DIR" -q
fi
cd "$DIR/server"

say "Configuring"
if [ ! -f .env ]; then
  gen() { openssl rand -base64 30 | tr -dc 'A-Za-z0-9' | head -c 32; }
  cat > .env <<ENV
POSTGRES_PASSWORD=$(gen)
MIZAN_APP_PASSWORD=$(gen)
PUBLIC_URL=https://$HOST
APP_URL=https://$HOST
ENV
  chmod 600 .env
  printf '  Wrote .env with generated passwords.\n'
else
  sed -i "s#^PUBLIC_URL=.*#PUBLIC_URL=https://$HOST#" .env
  sed -i "s#^APP_URL=.*#APP_URL=https://$HOST#" .env
  printf '  Kept the existing .env — passwords unchanged, hostname updated.\n'
fi
set -a; . ./.env; set +a

say "Building and starting"
docker compose up -d --build 2>&1 | tail -3

printf '  waiting for postgres'
for i in $(seq 1 60); do
  docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1 && { printf ' ok\n'; break; }
  printf '.'; sleep 2
  [ "$i" = 60 ] && { printf '\n'; docker compose logs db | tail -20; die "Postgres did not start."; }
done

# Never re-run the migrations against a live database: rebuild.sh opens with
# DROP SCHEMA and would take the entire record with it.
if docker compose exec -T db psql -U postgres -d mizan -tAc \
     "select to_regclass('public.people') is not null" 2>/dev/null | grep -q t; then
  say "Schema already present — leaving your data alone"
  FRESH=0
else
  say "Creating the schema"
  docker compose exec -T db mkdir -p /tmp/sql
  for f in 001_schema.sql 002_rls.sql 003_roles.sql; do docker compose cp "sql/$f" "db:/tmp/sql/$f"; done
  docker compose exec -T -e MIZAN_APP_PASSWORD="$MIZAN_APP_PASSWORD" db sh -c '
    set -e; for f in 001_schema.sql 002_rls.sql 003_roles.sql; do
      psql -U postgres -d mizan -v ON_ERROR_STOP=1 -q -f /tmp/sql/$f; done'
  FRESH=1
fi

say "Setting up HTTPS"
if ! grep -q "$HOST" /etc/caddy/Caddyfile 2>/dev/null; then
  printf '\n%s {\n\treverse_proxy 127.0.0.1:8080\n}\n' "$HOST" >> /etc/caddy/Caddyfile
fi
systemctl reload caddy 2>/dev/null || systemctl restart caddy

printf '  waiting for the API'
for i in $(seq 1 30); do
  curl -fsS http://127.0.0.1:8080/healthz >/dev/null 2>&1 && { printf ' ok\n'; break; }
  printf '.'; sleep 2
  [ "$i" = 30 ] && { printf '\n'; docker compose logs api | tail -30; die "The API did not answer."; }
done

tok() { openssl rand -base64 32 | tr '+/' '-_' | tr -d '=\n'; }
sha() { printf '%s' "$1" | openssl dgst -sha256 -binary | xxd -p -c 256; }
mint() { # name, role, brief
  local T; T="$(tok)"
  docker compose exec -T db psql -U postgres -d mizan -v ON_ERROR_STOP=1 -q <<SQL
WITH p AS (INSERT INTO people (role, brief, display_name)
           VALUES ('$2','$3',\$\$$1\$\$) RETURNING id)
INSERT INTO access_tokens (person_id, token_hash, label)
SELECT id, decode('$(sha "$T")','hex'), \$\$$1\$\$ FROM p;
SQL
  printf '%s' "$T"
}

if [ "$FRESH" = 1 ]; then
  say "Creating accounts"
  A="$(mint 'Yasir A. Malik' athlete full)"
  S="$(mint 'Shahzaib Bhutto' coach upper)"
  V="$(mint 'Tanveer Muhammad' coach skills)"
  cat > /root/mizan-links.txt <<TXT
Mīzān links — generated $(date -u +%Y-%m-%dT%H:%MZ)
These do not expire. They are revoked, not timed out.
Only hashes are stored, so a lost link is re-minted, never recovered.

YOU (also the bearer token for the iOS Shortcut)
  https://$HOST/j/$A
  Shortcut: POST https://$HOST/ingest/health
            Authorization: Bearer $A

SHAHZAIB — spine and upper body
  https://$HOST/j/$S

TANVEER — flexibility and the three standards
  https://$HOST/j/$V
TXT
  chmod 600 /root/mizan-links.txt
  printf '\n\033[1;32m  Done.\033[0m Your links are in \033[1m/root/mizan-links.txt\033[0m\n\n'
  cat /root/mizan-links.txt
  printf '\n  Shown once. Copy them somewhere safe now.\n\n'
else
  printf '\n\033[1;32m  Done.\033[0m Already set up — existing links still work.\n'
  printf '  Mint another with:  cd %s/server && ./mint-coach.sh "Name" upper|skills\n\n' "$DIR"
fi
