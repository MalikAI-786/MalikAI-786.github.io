#!/usr/bin/env bash
#
# First run only. Creates the athlete, mints their token, and prints the
# ingest token for the iOS Shortcut. Coach links are minted from the app
# afterwards, or with ./mint-coach.sh.
set -euo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a
NAME="${1:?usage: ./bootstrap.sh \"Your Name\"}"

tok() { openssl rand -base64 32 | tr '+/' '-_' | tr -d '=\n'; }
sha() { printf '%s' "$1" | openssl dgst -sha256 -binary | xxd -p -c 256; }

ATHLETE_TOKEN="$(tok)"
docker compose exec -T db psql -U postgres -d mizan -v ON_ERROR_STOP=1 -q <<SQL
INSERT INTO people (role, brief, display_name)
SELECT 'athlete','full',\$\$${NAME}\$\$
 WHERE NOT EXISTS (SELECT 1 FROM people WHERE role='athlete');
INSERT INTO access_tokens (person_id, token_hash, label)
SELECT id, decode('$(sha "$ATHLETE_TOKEN")','hex'), 'athlete bootstrap'
  FROM people WHERE role='athlete';
SQL

echo
echo "  Your link (opens the app and sets your session):"
echo "      ${PUBLIC_URL}/j/${ATHLETE_TOKEN}"
echo
echo "  The SAME token is the bearer for the iOS Shortcut:"
echo "      Authorization: Bearer ${ATHLETE_TOKEN}"
echo "      POST ${PUBLIC_URL}/ingest/health"
echo
echo "  Shown once. Only its hash is stored — losing it means minting a new one."
