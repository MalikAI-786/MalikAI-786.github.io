import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import pg from 'pg';

// The server under test connects as mizan_app, which is exactly the point:
// it has no BYPASSRLS and cannot TRUNCATE. Fixture setup therefore needs a
// separate owner connection — if these two were the same URL, the suite would
// be proving nothing about the policies.
const DB = process.env.DATABASE_URL;
const ADMIN_DB = process.env.ADMIN_DATABASE_URL || DB;
const BASE = 'http://127.0.0.1:8099';
let proc, admin;
const tokens = {};

const sha = t => crypto.createHash('sha256').update(t, 'utf8').digest();

before(async () => {
  admin = new pg.Client({ connectionString: ADMIN_DB });
  await admin.connect();
  await admin.query(`TRUNCATE access_tokens, session_notes, sessions, skill_levels, skills,
                     health_workouts, health_daily, clinical, handoff, change_requests, people CASCADE`);
  await admin.query(`INSERT INTO people (id,role,brief,display_name) VALUES
    ('11111111-1111-1111-1111-111111111111','athlete','full','ATHLETE'),
    ('22222222-2222-2222-2222-222222222222','coach','upper','COACH_UPPER'),
    ('33333333-3333-3333-3333-333333333333','coach','skills','COACH_SKILLS')`);
  await admin.query(`INSERT INTO skills (id,name,brief,ladder,drills) VALUES
    ('pullup','Strict pull-up','skills','["a","b","c","d","e","f"]','["1","2","3","4","5","6"]'),
    ('bench','Bench','upper','["a","b","c","d","e","f"]','["1","2","3","4","5","6"]')`);
  await admin.query(`INSERT INTO clinical (on_date,marker,value) VALUES ('2026-08-20','HbA1c','SECRET')`);
  for (const [who, id] of [['athlete','11111111-1111-1111-1111-111111111111'],
                           ['upper','22222222-2222-2222-2222-222222222222'],
                           ['skills','33333333-3333-3333-3333-333333333333']]) {
    tokens[who] = crypto.randomBytes(32).toString('base64url');
    await admin.query(`INSERT INTO access_tokens (person_id, token_hash) VALUES ($1,$2)`, [id, sha(tokens[who])]);
  }
  proc = spawn(process.execPath, ['src/index.js'], {
    env: { ...process.env, PORT: '8099', PGSSL: 'off', INSECURE_COOKIES: '1' },
    cwd: new URL('..', import.meta.url).pathname, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/healthz'); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error('server did not start');
});
after(async () => { proc?.kill(); await admin?.end(); });

const as = (who, path, init = {}) => fetch(BASE + path, {
  ...init, headers: { 'content-type': 'application/json',
                      cookie: `mz=${encodeURIComponent(tokens[who])}`, ...(init.headers || {}) } });

test('no cookie means no data', async () => {
  const r = await fetch(BASE + '/api/board');
  assert.equal(r.status, 401);
});

test('a bad token is refused, not merely empty', async () => {
  const r = await fetch(BASE + '/api/board', { headers: { cookie: 'mz=' + 'x'.repeat(40) } });
  assert.equal(r.status, 401);
});

test('/j/ moves the token out of the URL into an httpOnly cookie', async () => {
  const r = await fetch(`${BASE}/j/${tokens.upper}`, { redirect: 'manual' });
  assert.equal(r.status, 303);
  const c = r.headers.get('set-cookie');
  assert.match(c, /HttpOnly/);
  assert.match(c, /SameSite=Lax/);
});

test('each coach writes a plan only into their own brief', async () => {
  const a = await as('upper', '/api/session', { method: 'POST',
    body: JSON.stringify({ on_date: '2026-08-24', plan: 'Heavy pull' }) });
  assert.equal(a.status, 200);
  assert.equal((await a.json()).brief, 'upper');

  const b = await as('skills', '/api/session', { method: 'POST',
    body: JSON.stringify({ on_date: '2026-08-25', plan: 'Split holds' }) });
  assert.equal((await b.json()).brief, 'skills');
});

test('a coach cannot forge a session into the other brief', async () => {
  // brief is taken from the caller's identity, never from the request body
  const r = await as('upper', '/api/session', { method: 'POST',
    body: JSON.stringify({ on_date: '2026-08-26', brief: 'skills', plan: 'sneaking in' }) });
  assert.equal((await r.json()).brief, 'upper');
});

test('a coach sees only their own brief on the board', async () => {
  const up = await (await as('upper', '/api/board')).json();
  const sk = await (await as('skills', '/api/board')).json();
  assert.deepEqual([...new Set(up.sessions.map(s => s.brief))], ['upper']);
  assert.deepEqual([...new Set(sk.sessions.map(s => s.brief))], ['skills']);
});

test('no coach can reach clinical, through any endpoint', async () => {
  for (const who of ['upper', 'skills']) {
    const b = await (await as(who, '/api/board')).json();
    assert.equal(JSON.stringify(b).includes('SECRET'), false, `${who} saw clinical`);
  }
});

test('the athlete sees both briefs', async () => {
  const b = await (await as('athlete', '/api/board')).json();
  assert.deepEqual([...new Set(b.sessions.map(s => s.brief))].sort(), ['skills', 'upper']);
});

test('plan and actual coexist rather than overwriting', async () => {
  await as('athlete', '/api/session', { method: 'POST',
    body: JSON.stringify({ on_date: '2026-08-24', brief: 'upper',
                           status: 'missed_coach', athlete_note: 'trainer cancelled' }) });
  const b = await (await as('upper', '/api/board')).json();
  const s = b.sessions.find(x => x.on_date.startsWith('2026-08-24'));
  assert.equal(s.plan, 'Heavy pull', 'the coach plan survived the athlete log');
  assert.equal(s.status, 'missed_coach');
  assert.equal(s.athlete_note, 'trainer cancelled');
});

test('only the athlete can mint a link', async () => {
  const bad = await as('upper', '/api/token', { method: 'POST',
    body: JSON.stringify({ person_id: '22222222-2222-2222-2222-222222222222' }) });
  assert.equal(bad.status, 403);
  const ok = await as('athlete', '/api/token', { method: 'POST',
    body: JSON.stringify({ person_id: '33333333-3333-3333-3333-333333333333' }) });
  assert.equal(ok.status, 200);
  assert.match((await ok.json()).link, /\/j\/[A-Za-z0-9_-]{20,}/);
});

/* ------------------------------ health ingest --------------------------- */

const post = (tok, body) => fetch(BASE + '/ingest/health', { method: 'POST',
  headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok },
  body: JSON.stringify(body) });

test('ingest refuses a coach token', async () => {
  assert.equal((await post(tokens.upper, { date: '2026-08-20' })).status, 401);
});

test('ingest writes a day and is idempotent on re-post', async () => {
  const body = { date: '2026-08-21', weight_lb: 171.2, sleep_hours: 7.4, steps: 9100,
                 resting_hr: 54, workouts: [{ type: 'TraditionalStrengthTraining',
                 start: '2026-08-21T17:00:00Z', minutes: 62 }] };
  const a = await (await post(tokens.athlete, body)).json();
  assert.equal(a.workoutsAdded, 1);
  const b = await (await post(tokens.athlete, body)).json();
  assert.equal(b.workoutsAdded, 0, 'a re-post must not duplicate the workout');
  const { rows } = await admin.query(`SELECT * FROM health_daily WHERE on_date='2026-08-21'`);
  assert.equal(Number(rows[0].weight_lb), 171.2);
  assert.equal(rows[0].weight_src, 'watch');
});

test('the watch never overwrites a human value', async () => {
  await admin.query(`INSERT INTO health_daily (on_date, weight_lb, weight_src, sleep_hours, sleep_src)
                     VALUES ('2026-08-22', 199, 'human', 5.5, 'human')`);
  await post(tokens.athlete, { date: '2026-08-22', weight_lb: 171.0, sleep_hours: 8.0, steps: 12000 });
  const { rows } = await admin.query(`SELECT * FROM health_daily WHERE on_date='2026-08-22'`);
  assert.equal(Number(rows[0].weight_lb), 199, 'human weight was overwritten');
  assert.equal(Number(rows[0].sleep_hours), 5.5, 'human sleep was overwritten');
  assert.equal(Number(rows[0].steps), 12000, 'a gap should still have been filled');
  assert.equal(rows[0].steps_src, 'watch');
});

test('an impossible night is rejected with a warning, not stored', async () => {
  const r = await (await post(tokens.athlete, { date: '2026-08-23', sleep_hours: 176 })).json();
  assert.match(r.warnings.join(' '), /sleep_hours/);
  const { rows } = await admin.query(`SELECT sleep_hours FROM health_daily WHERE on_date='2026-08-23'`);
  assert.equal(rows[0].sleep_hours, null);
});

test('a malformed date is rejected outright', async () => {
  assert.equal((await post(tokens.athlete, { date: 'yesterday' })).status, 400);
});

test('a change request lands in the database', async () => {
  const r = await as('skills', '/api/change-request', { method: 'POST',
    body: JSON.stringify({ about: 'Handoff table', kind: 'It is wrong',
                           body: '48h is enough between pull days.' }) });
  assert.equal(r.status, 200);
  const seen = await (await as('athlete', '/api/board')).json();
  assert.equal(seen.changeRequests.some(c => c.body.includes('48h')), true);
});
