-- Row-level security.
--
-- Every policy keys off current_person_id(), read from a per-request setting
-- the API sets inside the transaction. Nothing is filtered in application
-- code: a forgotten WHERE clause should be a query that returns nothing, not
-- a query that leaks a different coach's rows.
--
-- The API connects as mizan_app, which is NOT the table owner and does NOT
-- have BYPASSRLS. That distinction is the whole protection — a superuser
-- connection would silently ignore every policy below.

BEGIN;

CREATE OR REPLACE FUNCTION current_person_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.person_id', true), '')::uuid
$$;

-- These two read `people`, and `people` is itself protected by a policy that
-- calls them. Left as plain functions that is infinite recursion, and Postgres
-- reports it as "stack depth limit exceeded" from inside policy evaluation —
-- which looks like a tuning problem and is not one.
--
-- SECURITY DEFINER runs them as the owner, who bypasses RLS, so the lookup
-- resolves without re-entering the policy. search_path is pinned because a
-- SECURITY DEFINER function with a caller-controlled search_path is a
-- privilege-escalation hole; both take no arguments and read one row, so the
-- surface they expose is exactly the caller's own identity.
CREATE OR REPLACE FUNCTION current_brief() RETURNS brief
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT brief FROM people
   WHERE id = current_person_id() AND disabled_at IS NULL
$$;

CREATE OR REPLACE FUNCTION is_athlete() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (SELECT 1 FROM people
                  WHERE id = current_person_id()
                    AND role = 'athlete' AND disabled_at IS NULL)
$$;

-- a coach may touch a brief only if it is their own
CREATE OR REPLACE FUNCTION may_touch(b brief) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT is_athlete() OR current_brief() = b
$$;

ALTER TABLE people          ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills          ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels    ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_daily    ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical        ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoff         ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- people: you see yourself; the athlete sees everyone
CREATE POLICY people_read ON people FOR SELECT
  USING (id = current_person_id() OR is_athlete());
CREATE POLICY people_write ON people FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());

-- tokens: only the athlete ever reads or mints them
CREATE POLICY tokens_athlete ON access_tokens FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());

-- sessions: a coach sees and writes only their own brief
CREATE POLICY sessions_read ON sessions FOR SELECT
  USING (may_touch(brief));
CREATE POLICY sessions_insert ON sessions FOR INSERT
  WITH CHECK (may_touch(brief));
CREATE POLICY sessions_update ON sessions FOR UPDATE
  USING (may_touch(brief)) WITH CHECK (may_touch(brief));

CREATE POLICY notes_read ON session_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM sessions s
                  WHERE s.id = session_id AND may_touch(s.brief)));
CREATE POLICY notes_insert ON session_notes FOR INSERT
  WITH CHECK (author_id = current_person_id()
              AND EXISTS (SELECT 1 FROM sessions s
                           WHERE s.id = session_id AND may_touch(s.brief)));

-- skills: everyone reads the ladders; a coach sets levels only in their brief
CREATE POLICY skills_read ON skills FOR SELECT USING (true);
CREATE POLICY skills_write ON skills FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());

CREATE POLICY levels_read ON skill_levels FOR SELECT
  USING (EXISTS (SELECT 1 FROM skills s
                  WHERE s.id = skill_id AND may_touch(s.brief)));
CREATE POLICY levels_insert ON skill_levels FOR INSERT
  WITH CHECK (set_by = current_person_id()
              AND EXISTS (SELECT 1 FROM skills s
                           WHERE s.id = skill_id AND may_touch(s.brief)));

-- health: coaches read it, only the athlete and the ingest job write it
CREATE POLICY health_read ON health_daily FOR SELECT USING (current_person_id() IS NOT NULL);
CREATE POLICY health_write ON health_daily FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());
CREATE POLICY workouts_read ON health_workouts FOR SELECT USING (current_person_id() IS NOT NULL);
CREATE POLICY workouts_write ON health_workouts FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());

-- clinical: athlete only. There is deliberately NO coach policy here.
CREATE POLICY clinical_athlete ON clinical FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());

-- handoff: both coaches see the identical table; only the athlete edits it
CREATE POLICY handoff_read ON handoff FOR SELECT USING (current_person_id() IS NOT NULL);
CREATE POLICY handoff_write ON handoff FOR ALL
  USING (is_athlete()) WITH CHECK (is_athlete());

-- change requests: you see your own, the athlete sees all
CREATE POLICY cr_read ON change_requests FOR SELECT
  USING (author_id = current_person_id() OR is_athlete());
CREATE POLICY cr_insert ON change_requests FOR INSERT
  WITH CHECK (author_id = current_person_id());
CREATE POLICY cr_update ON change_requests FOR UPDATE
  USING (is_athlete()) WITH CHECK (is_athlete());

-- Establishing identity is a chicken-and-egg problem: access_tokens is
-- athlete-only under RLS, but you must read it to discover you are the
-- athlete. Resolution therefore goes through one SECURITY DEFINER function
-- with a deliberately narrow contract — it takes a hash the caller already
-- holds and returns only that person's identity row. It cannot be used to
-- enumerate tokens, because without the hash it returns nothing, and the
-- hash is 256 bits of entropy that only the holder of the link has.
CREATE OR REPLACE FUNCTION resolve_access_token(p_hash bytea)
RETURNS TABLE (id uuid, role person_role, brief brief, display_name text)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE access_tokens t SET last_used_at = now()
   WHERE t.token_hash = p_hash AND t.revoked_at IS NULL;
  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT p.id, p.role, p.brief, p.display_name
    FROM access_tokens t JOIN people p ON p.id = t.person_id
   WHERE t.token_hash = p_hash AND t.revoked_at IS NULL
     AND p.disabled_at IS NULL;
END $$;

REVOKE ALL ON FUNCTION resolve_access_token(bytea) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION resolve_access_token(bytea) TO mizan_app;

REVOKE ALL ON FUNCTION current_brief(), is_athlete() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION current_brief(), is_athlete(), current_person_id(), may_touch(brief) TO PUBLIC;

COMMIT;
