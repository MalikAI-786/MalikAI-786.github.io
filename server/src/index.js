import http from 'node:http';
import { pool, asPerson } from './db.js';
import { resolveToken, readCookie, sessionCookie, mintToken, hashToken } from './auth.js';
import { sanitise, ingest } from './health.js';

const PORT   = Number(process.env.PORT || 8080);
const SECURE = process.env.INSECURE_COOKIES !== '1';
const APP_URL = process.env.APP_URL || '/';

const json = (res, code, body, extra = {}) => {
  const s = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8',
                        'cache-control': 'no-store', ...extra });
  res.end(s);
};

async function readBody(req, limit = 256 * 1024) {
  const chunks = []; let n = 0;
  for await (const c of req) {
    n += c.length;
    if (n > limit) throw new Error('body too large');
    chunks.push(c);
  }
  if (!n) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/* ---------------------------------------------------------------- routes -- */

async function handle(req, res, url) {
  const path = url.pathname;

  if (path === '/healthz') return json(res, 200, { ok: true });

  // A coach taps their link. The token moves out of the URL and into an
  // httpOnly cookie immediately, then we redirect — so the token stops
  // living in the address bar, browser history and any screenshot.
  if (req.method === 'GET' && path.startsWith('/j/')) {
    const tok = decodeURIComponent(path.slice(3));
    const person = await resolveToken(tok);
    if (!person) { res.writeHead(303, { location: APP_URL + '?e=badlink' }); return res.end(); }
    res.writeHead(303, { location: APP_URL, 'set-cookie': sessionCookie(tok, SECURE) });
    return res.end();
  }

  // The Shortcut posts here with its own bearer token. Kept separate from the
  // cookie path on purpose: a phone automation has no session and should not
  // be able to acquire one.
  if (req.method === 'POST' && path === '/ingest/health') {
    const auth = req.headers.authorization || '';
    const tok = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
    const person = await resolveToken(tok);
    if (!person || person.role !== 'athlete')
      return json(res, 401, { error: 'unauthorised' });
    let s;
    try { s = sanitise(await readBody(req)); }
    catch (e) { return json(res, 400, { error: String(e.message) }); }
    const out = await asPerson(person.id, c => ingest(c, s));
    return json(res, 200, { ok: true, ...out });
  }

  // everything below needs a session
  const tok = readCookie(req, 'mz');
  const me = await resolveToken(tok);
  if (!me) return json(res, 401, { error: 'no session' });

  if (req.method === 'GET' && path === '/api/me')
    return json(res, 200, { id: me.id, role: me.role, brief: me.brief, name: me.display_name });

  // One read for the whole screen. RLS decides what comes back, so this same
  // query returns a different board for each caller with no branching here.
  if (req.method === 'GET' && path === '/api/board') {
    const board = await asPerson(me.id, async c => {
      const q = (sql, p = []) => c.query(sql, p).then(r => r.rows);
      const [sessions, notes, skills, levels, health, workouts, hand, reqs] = await Promise.all([
        q(`SELECT id, on_date, brief, plan, planned_at, status, rpe, athlete_note, logged_at
             FROM sessions ORDER BY on_date DESC LIMIT 120`),
        q(`SELECT n.id, n.session_id, n.body, n.created_at, p.display_name AS author
             FROM session_notes n JOIN people p ON p.id = n.author_id
            ORDER BY n.created_at DESC LIMIT 200`),
        q(`SELECT id, name, brief, ladder, drills FROM skills ORDER BY sort, id`),
        q(`SELECT DISTINCT ON (skill_id) skill_id, level, tested_on, note
             FROM skill_levels ORDER BY skill_id, tested_on DESC`),
        q(`SELECT * FROM health_daily ORDER BY on_date DESC LIMIT 120`),
        q(`SELECT on_date, kind, minutes, started_at FROM health_workouts
            ORDER BY on_date DESC LIMIT 200`),
        q(`SELECT skill_label, lands_on, tissue, rule FROM handoff ORDER BY sort, id`),
        q(`SELECT id, about, kind, body, view_name, created_at, resolved_at
             FROM change_requests ORDER BY created_at DESC LIMIT 50`),
      ]);
      return { sessions, notes, skills, levels, health, workouts, handoff: hand, changeRequests: reqs };
    });
    return json(res, 200, { me: { role: me.role, brief: me.brief, name: me.display_name }, ...board });
  }

  if (req.method === 'POST' && path === '/api/session') {
    const b = await readBody(req);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.on_date || '')) return json(res, 400, { error: 'on_date required' });
    const brief = me.role === 'athlete' ? (b.brief || 'full') : me.brief;
    const out = await asPerson(me.id, async c => {
      // A coach writes the plan; the athlete writes what actually happened.
      // Separate columns, separate authors, never the same UPDATE — this is
      // the rule the old design could not express at all.
      if (me.role === 'coach') {
        const r = await c.query(
          `INSERT INTO sessions (on_date, brief, plan, planned_by, planned_at)
           VALUES ($1,$2,$3,$4, now())
           ON CONFLICT (on_date, brief) DO UPDATE
             SET plan = EXCLUDED.plan, planned_by = EXCLUDED.planned_by, planned_at = now()
           RETURNING *`, [b.on_date, brief, b.plan ?? null, me.id]);
        return r.rows[0];
      }
      const r = await c.query(
        `INSERT INTO sessions (on_date, brief, status, rpe, athlete_note, logged_at)
         VALUES ($1,$2,$3,$4,$5, now())
         ON CONFLICT (on_date, brief) DO UPDATE
           SET status = EXCLUDED.status, rpe = EXCLUDED.rpe,
               athlete_note = EXCLUDED.athlete_note, logged_at = now()
         RETURNING *`, [b.on_date, brief, b.status ?? null, b.rpe ?? null, b.athlete_note ?? null]);
      return r.rows[0];
    });
    return json(res, 200, out);
  }

  if (req.method === 'POST' && path === '/api/note') {
    const b = await readBody(req);
    if (!b.session_id || !b.body) return json(res, 400, { error: 'session_id and body required' });
    const out = await asPerson(me.id, c => c.query(
      `INSERT INTO session_notes (session_id, author_id, body) VALUES ($1,$2,$3) RETURNING *`,
      [b.session_id, me.id, String(b.body).slice(0, 4000)]).then(r => r.rows[0]));
    return json(res, 200, out);
  }

  if (req.method === 'POST' && path === '/api/skill-level') {
    const b = await readBody(req);
    const lvl = Number(b.level);
    if (!b.skill_id || !Number.isInteger(lvl) || lvl < 0 || lvl > 5)
      return json(res, 400, { error: 'skill_id and level 0-5 required' });
    const out = await asPerson(me.id, c => c.query(
      `INSERT INTO skill_levels (skill_id, level, tested_on, set_by, note)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (skill_id, tested_on) DO UPDATE
         SET level = EXCLUDED.level, note = EXCLUDED.note, set_by = EXCLUDED.set_by
       RETURNING *`,
      [b.skill_id, lvl, b.tested_on || new Date().toISOString().slice(0, 10), me.id, b.note ?? null])
      .then(r => r.rows[0]));
    return json(res, 200, out);
  }

  // The feedback loop, landing in the database instead of an inbox.
  if (req.method === 'POST' && path === '/api/change-request') {
    const b = await readBody(req);
    if (!b.body) return json(res, 400, { error: 'body required' });
    const out = await asPerson(me.id, c => c.query(
      `INSERT INTO change_requests (author_id, about, kind, body, view_name)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [me.id, b.about ?? 'unspecified', b.kind ?? 'unspecified',
       String(b.body).slice(0, 8000), b.view_name ?? null]).then(r => r.rows[0]));
    return json(res, 200, out);
  }

  // Minting links is the athlete's alone; RLS enforces it too.
  if (req.method === 'POST' && path === '/api/token') {
    if (me.role !== 'athlete') return json(res, 403, { error: 'athlete only' });
    const b = await readBody(req);
    if (!b.person_id) return json(res, 400, { error: 'person_id required' });
    const tok = mintToken();
    await asPerson(me.id, c => c.query(
      `INSERT INTO access_tokens (person_id, token_hash, label) VALUES ($1,$2,$3)`,
      [b.person_id, hashToken(tok), b.label ?? null]));
    // shown exactly once — only the hash is kept
    return json(res, 200, { link: `${process.env.PUBLIC_URL || ''}/j/${tok}` });
  }

  if (req.method === 'POST' && path === '/api/revoke') {
    if (me.role !== 'athlete') return json(res, 403, { error: 'athlete only' });
    const b = await readBody(req);
    const out = await asPerson(me.id, c => c.query(
      `UPDATE access_tokens SET revoked_at = now()
        WHERE id = $1 AND revoked_at IS NULL RETURNING id`, [b.token_id]));
    return json(res, 200, { revoked: out.rowCount });
  }

  return json(res, 404, { error: 'not found' });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  handle(req, res, url).catch(err => {
    // Never echo a database error to the client: they carry table names,
    // column names and sometimes row contents.
    console.error(req.method, url.pathname, err);
    if (!res.headersSent) json(res, 500, { error: 'server error' });
    else res.end();
  });
});

server.listen(PORT, () => console.log(`mizan-server on :${PORT}`));

const bye = () => server.close(() => pool.end().then(() => process.exit(0)));
process.on('SIGTERM', bye); process.on('SIGINT', bye);
