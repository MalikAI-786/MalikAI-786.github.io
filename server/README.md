# Mīzān server

The backend the static pages could never have. One athlete, several coaches
with different briefs, and a watch that writes on its own.

**Why this exists.** The previous design put a JSON snapshot into the URL
fragment. That made coaches read-only, forced a seven-day expiry (the data was
*in* the link, so a permanent link was a permanent leak), and left the athlete
as the only person who could enter anything. None of that was fixable by
polish: there was nowhere to write. This is that missing half.

## What it does

- **Coaches write.** Each coach plans sessions inside their own brief, and
  writes notes. What they cannot do is touch the other brief, or the athlete's
  own log of what actually happened.
- **The watch writes.** An iOS Shortcut posts to `/ingest/health` once a day.
  No native app, no Xcode, no Apple Developer account.
- **Nobody's entry gets clobbered.** A coach's plan and the athlete's actual
  live in separate columns. A machine reading may fill a gap but may never
  overwrite a human value.
- **Clinical stays private.** There is no coach policy on that table at all.
- **Links are revocable, not expiring.** The data no longer travels in the
  link, so a link can live until it is withdrawn.

## The security model in one paragraph

Access is enforced by Postgres row-level security keyed on `app.person_id`, a
transaction-local setting the API applies inside every request's transaction.
Application code does no filtering, because a forgotten `WHERE` clause should
return nothing rather than another coach's rows. The API connects as
`mizan_app`, which is **not** the table owner and **not** a superuser — both
of those bypass RLS silently, which would turn every policy into decoration.

Three helper functions (`is_athlete`, `current_brief`, `resolve_access_token`)
are `SECURITY DEFINER`, because each must read a table that is itself
protected by a policy calling them. Without that they recurse until Postgres
reports "stack depth limit exceeded", which reads like a tuning problem and is
not one.

## Deploying to a DigitalOcean Droplet

```bash
# on the droplet, in this directory
cp .env.example .env && $EDITOR .env      # fill in the two passwords
docker compose up -d --build

# create the schema and the app role, once
export ADMIN_DATABASE_URL="postgresql://postgres:$POSTGRES_PASSWORD@localhost:5432/mizan"
docker compose exec -T db sh -c 'apk add --no-cache bash >/dev/null'   # if needed
docker compose cp sql db:/sql
docker compose exec -T -e MIZAN_APP_PASSWORD="$MIZAN_APP_PASSWORD" db \
  bash -c 'ADMIN_DATABASE_URL="postgresql://postgres@localhost/mizan" /sql/rebuild.sh'
```

Then put TLS in front of it. The API binds to `127.0.0.1:8080`, so the
droplet's Postgres is never exposed and the API is only reachable through your
reverse proxy. Caddy is two lines:

```
mizan.yourdomain.com {
  reverse_proxy 127.0.0.1:8080
}
```

**Managed Postgres instead:** point `DATABASE_URL` at it, drop the `db`
service, and leave `PGSSL` unset — DigitalOcean managed databases require TLS.

**App Platform instead:** `doctl apps create --spec server/app.yaml`.

## First run

There is no signup. The athlete row and the first token are created by hand,
once:

```sql
INSERT INTO people (role, brief, display_name) VALUES ('athlete','full','<name>');
-- then mint a token: see /api/token, or insert a sha256 hash directly
```

After that the athlete mints coach links from the app. A link looks like
`https://<PUBLIC_URL>/j/<token>`; opening it moves the token into an httpOnly
cookie and redirects, so it stops living in the address bar and in history.

## Endpoints

| Method | Path | Who |
|---|---|---|
| `GET`  | `/healthz` | anyone |
| `GET`  | `/j/:token` | anyone holding a link |
| `GET`  | `/api/me` | any session |
| `GET`  | `/api/board` | any session — RLS decides what comes back |
| `POST` | `/api/session` | coach writes `plan`; athlete writes `status`/`rpe` |
| `POST` | `/api/note` | any session, within their brief |
| `POST` | `/api/skill-level` | coach in the skill's brief, or athlete |
| `POST` | `/api/change-request` | any session |
| `POST` | `/api/token` · `/api/revoke` | athlete only |
| `POST` | `/ingest/health` | athlete's bearer token, from the Shortcut |

## Tests

They run against a real Postgres, not a mock — the entire point is the
policies, and a mock cannot have policies.

```bash
export ADMIN_DATABASE_URL="postgresql://postgres@localhost/mizan"
export MIZAN_APP_PASSWORD=testpw
./sql/rebuild.sh
DATABASE_URL="postgresql://mizan_app:testpw@localhost/mizan" PGSSL=off \
  node --test test/api.test.js
```

16 checks, covering: unauthenticated access returns nothing; a coach cannot
read or write the other brief; no coach can reach clinical through any
endpoint; a coach cannot forge a brief through the request body; plan and
actual coexist; only the athlete mints links; ingest refuses a coach token, is
idempotent on re-post, never overwrites a human value, and rejects an
impossible night.

## What is NOT in this repo, ever

Passwords, connection strings, tokens, `.env`. This repository is public.
Real names live in the `people` table, in the database — not here.
