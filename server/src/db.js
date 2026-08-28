import pg from 'pg';

// numerics come back as strings by default, which silently turns every
// weight into "171.2" and every comparison into string comparison.
pg.types.setTypeParser(1700, v => (v === null ? null : parseFloat(v)));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'off' ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL || 8),
  idleTimeoutMillis: 30_000,
});

/**
 * Run a callback inside a transaction with the caller's identity set.
 *
 * Every policy in 002_rls.sql reads app.person_id. It is set with set_config
 * (…, true) — transaction-local — so a pooled connection handed to the next
 * request cannot inherit the previous caller's identity. That "true" is the
 * whole safety of connection pooling here; without it a busy server leaks
 * one coach's rows to another.
 */
export async function asPerson(personId, fn) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT set_config($1,$2,true)', ['app.person_id', personId ?? '']);
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch { /* connection already gone */ }
    throw e;
  } finally {
    c.release();
  }
}

/** Privileged path, used only by migrations and the first-run bootstrap. */
export async function asOwner(fn) {
  const c = await pool.connect();
  try { return await fn(c); } finally { c.release(); }
}
