#!/usr/bin/env bash
# ./mint-coach.sh "Coach Name" upper|skills
set -euo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a
NAME="${1:?usage: ./mint-coach.sh \"Name\" upper|skills}"
BRIEF="${2:?usage: ./mint-coach.sh \"Name\" upper|skills}"
case "$BRIEF" in upper|skills) ;; *) echo "brief must be upper or skills"; exit 1;; esac

tok() { openssl rand -base64 32 | tr '+/' '-_' | tr -d '=\n'; }
sha() { printf '%s' "$1" | openssl dgst -sha256 -binary | xxd -p -c 256; }
T="$(tok)"
docker compose exec -T db psql -U postgres -d mizan -v ON_ERROR_STOP=1 -q <<SQL
WITH p AS (
  INSERT INTO people (role, brief, display_name)
  VALUES ('coach','${BRIEF}',\$\$${NAME}\$\$) RETURNING id)
INSERT INTO access_tokens (person_id, token_hash, label)
SELECT id, decode('$(sha "$T")','hex'), \$\$${NAME} — ${BRIEF}\$\$ FROM p;
SQL
echo
echo "  ${NAME} (${BRIEF}):"
echo "      ${PUBLIC_URL}/j/${T}"
echo
echo "  Revocable at any time. Does not expire. Shown once."
