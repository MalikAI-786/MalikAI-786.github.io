-- Mīzān server schema.
--
-- One athlete, several coaches with different briefs, and a watch that writes
-- on its own. Three rules drive every design decision below.
--
--  1. A coach's plan and the athlete's actual must never overwrite each other.
--     They are different claims by different people and collapsing them
--     destroys the only thing this record is for.
--  2. A machine may fill a gap; it may never overwrite a human. A watch can
--     see that movement happened. It cannot see WHY a session did not, and
--     "I skipped it" versus "the trainer cancelled" is exactly the fact that
--     matters most.
--  3. Clinical values are the athlete's alone. No coach scope reaches them,
--     at any level, ever. There is no flag that turns this off.
--
-- Access is enforced by Postgres row-level security keyed on a per-request
-- setting (app.person_id), not by application code remembering to filter.
-- Application-layer scoping is one forgotten WHERE clause away from a leak.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- people --
CREATE TYPE person_role AS ENUM ('athlete', 'coach');

-- 'upper'  — spine and upper-body programming
-- 'skills' — flexibility and the skill standards
-- 'full'   — the athlete
CREATE TYPE brief AS ENUM ('upper', 'skills', 'full');

CREATE TABLE people (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role        person_role NOT NULL,
  brief       brief       NOT NULL,
  display_name text       NOT NULL,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);
COMMENT ON TABLE people IS
  'Real names live here, in the database — never in the git repo, which is public.';

-- ---------------------------------------------------------------- access --
-- A coach taps a link and is in. No password to forget, no account to create.
-- The link carries an opaque token; only its hash is stored, so a database
-- dump does not hand over working credentials.
CREATE TABLE access_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  token_hash  bytea NOT NULL UNIQUE,
  label       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at  timestamptz
);
CREATE INDEX ON access_tokens (person_id) WHERE revoked_at IS NULL;
COMMENT ON TABLE access_tokens IS
  'Revocable rather than expiring. The old design forced 7-day expiry because '
  'the data travelled inside the link; it no longer does, so a link can live '
  'until it is withdrawn — which is a decision, not a timer.';

-- --------------------------------------------------------------- sessions --
CREATE TYPE actual_status AS ENUM ('done', 'missed_athlete', 'missed_coach', 'partial');

CREATE TABLE sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  on_date     date NOT NULL,
  brief       brief NOT NULL,
  -- the coach's side
  planned_by  uuid REFERENCES people(id),
  plan        text,
  planned_at  timestamptz,
  -- the athlete's side, deliberately separate columns
  status      actual_status,
  rpe         smallint CHECK (rpe BETWEEN 1 AND 10),
  athlete_note text,
  logged_at   timestamptz,
  source      text NOT NULL DEFAULT 'human' CHECK (source IN ('human','watch')),
  UNIQUE (on_date, brief)
);
COMMENT ON COLUMN sessions.status IS
  'missed_athlete and missed_coach are deliberately distinct. A package burned '
  'by a cancellation is not the same fact as one slept through.';

CREATE TABLE session_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES people(id),
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON session_notes (session_id);

-- ----------------------------------------------------------------- skills --
CREATE TABLE skills (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  brief       brief NOT NULL,
  ladder      jsonb NOT NULL,   -- six level descriptions, 0..5
  drills      jsonb NOT NULL,
  sort        smallint NOT NULL DEFAULT 0
);

CREATE TABLE skill_levels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id    text NOT NULL REFERENCES skills(id),
  level       smallint NOT NULL CHECK (level BETWEEN 0 AND 5),
  tested_on   date NOT NULL,
  set_by      uuid NOT NULL REFERENCES people(id),
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (skill_id, tested_on)
);
COMMENT ON TABLE skill_levels IS
  'Append-only history, not a current-value column. The trajectory is the '
  'point; a single mutable level would throw away every previous test.';

-- ------------------------------------------------------------ health feed --
-- Written by the iOS Shortcut. Every column carries its own provenance so a
-- watch reading can never quietly replace something a human typed.
CREATE TABLE health_daily (
  on_date       date PRIMARY KEY,
  weight_lb     numeric(5,1),
  weight_src    text CHECK (weight_src IN ('watch','human')),
  sleep_hours   numeric(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 18),
  sleep_src     text CHECK (sleep_src IN ('watch','human')),
  steps         integer CHECK (steps >= 0),
  steps_src     text CHECK (steps_src IN ('watch','human')),
  resting_hr    smallint CHECK (resting_hr BETWEEN 25 AND 140),
  resting_hr_src text CHECK (resting_hr_src IN ('watch','human')),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN health_daily.sleep_hours IS
  'Asleep intervals only, never In Bed. Capped at 18h: a watch that loses '
  'power or crosses a timezone produces impossible nights, and one such '
  'reading averaged in poisons the trend.';

CREATE TABLE health_workouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  on_date     date NOT NULL,
  kind        text NOT NULL,
  minutes     integer NOT NULL CHECK (minutes > 0),
  started_at  timestamptz,
  source      text NOT NULL DEFAULT 'watch' CHECK (source IN ('watch','human')),
  external_id text UNIQUE,   -- lets the Shortcut re-post without duplicating
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON health_workouts (on_date);

-- --------------------------------------------------------------- clinical --
-- The athlete's alone. There is no coach policy on this table at all, which
-- is the point: a leak here would have to be written deliberately.
CREATE TABLE clinical (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  on_date     date NOT NULL,
  marker      text NOT NULL,
  value       text NOT NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON clinical (on_date);

-- --------------------------------------------------------------- handoff --
-- Where two briefs load the same tissue. Read-only to everyone but the
-- athlete, and shown identically to both coaches on purpose.
CREATE TABLE handoff (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_label text NOT NULL,
  lands_on    text NOT NULL,
  tissue      text NOT NULL,
  rule        text NOT NULL,
  sort        smallint NOT NULL DEFAULT 0
);

-- ---------------------------------------------------- change requests -----
CREATE TABLE change_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid NOT NULL REFERENCES people(id),
  about       text NOT NULL,
  kind        text NOT NULL,
  body        text NOT NULL,
  view_name   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
COMMENT ON TABLE change_requests IS
  'The feedback loop, landing in the database instead of an inbox. This is '
  'what makes the thing iterative rather than a report that arrives finished.';

COMMIT;
