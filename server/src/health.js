/**
 * Health ingest — what the iOS Shortcut posts to, once a day.
 *
 * The single rule this file exists to enforce: a machine may fill a gap, but
 * it may never overwrite a human. A watch can see that movement happened; it
 * cannot see why a session did not, and "I skipped it" versus "the trainer
 * cancelled" is the fact this whole record is for. That rule is expressed in
 * the SQL below rather than in a JS branch, so it holds even if some future
 * caller forgets it exists.
 */

// A watch that loses power, or crosses a timezone, produces impossible
// nights. One of those averaged into the trend is worse than a missing day.
const SLEEP_MAX = 18;

export function sanitise(body) {
  const out = { warnings: [] };
  const date = String(body?.date ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('date must be YYYY-MM-DD');
  out.date = date;

  const num = (v, lo, hi, name) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) { out.warnings.push(`${name}: not a number, ignored`); return null; }
    if (n < lo || n > hi) { out.warnings.push(`${name}: ${n} outside ${lo}–${hi}, ignored`); return null; }
    return n;
  };

  out.weight  = num(body.weight_lb,   50, 600, 'weight_lb');
  out.sleep   = num(body.sleep_hours,  0, SLEEP_MAX, 'sleep_hours');
  out.steps   = num(body.steps,        0, 200_000, 'steps');
  out.hr      = num(body.resting_hr,  25, 140, 'resting_hr');

  out.workouts = [];
  for (const w of Array.isArray(body.workouts) ? body.workouts : []) {
    const minutes = num(w?.minutes, 1, 600, 'workout.minutes');
    if (!minutes) continue;
    const kind = String(w?.type ?? 'Unknown').slice(0, 80);
    let started = null;
    if (w?.start) { const d = new Date(w.start); if (!isNaN(d)) started = d.toISOString(); }
    // Lets the Shortcut re-post the same day without duplicating rows, which
    // it will: phone automations retry, and the athlete will tap Run manually.
    out.workouts.push({ kind, minutes, started,
      externalId: `${date}:${kind}:${started ?? minutes}` });
  }
  return out;
}

export async function ingest(client, s) {
  await client.query(
    `INSERT INTO health_daily
       (on_date, weight_lb, weight_src, sleep_hours, sleep_src,
        steps, steps_src, resting_hr, resting_hr_src, updated_at)
     VALUES ($1,$2,'watch',$3,'watch',$4,'watch',$5,'watch', now())
     ON CONFLICT (on_date) DO UPDATE SET
       -- for each column: a human value stands; otherwise take the new
       -- reading, and if the new reading is null keep whatever was there.
       weight_lb  = CASE WHEN health_daily.weight_src = 'human' THEN health_daily.weight_lb
                         ELSE COALESCE(EXCLUDED.weight_lb, health_daily.weight_lb) END,
       weight_src = CASE WHEN health_daily.weight_src = 'human' THEN 'human'
                         WHEN EXCLUDED.weight_lb IS NOT NULL THEN 'watch'
                         ELSE health_daily.weight_src END,
       sleep_hours = CASE WHEN health_daily.sleep_src = 'human' THEN health_daily.sleep_hours
                          ELSE COALESCE(EXCLUDED.sleep_hours, health_daily.sleep_hours) END,
       sleep_src   = CASE WHEN health_daily.sleep_src = 'human' THEN 'human'
                          WHEN EXCLUDED.sleep_hours IS NOT NULL THEN 'watch'
                          ELSE health_daily.sleep_src END,
       steps      = CASE WHEN health_daily.steps_src = 'human' THEN health_daily.steps
                         ELSE COALESCE(EXCLUDED.steps, health_daily.steps) END,
       steps_src  = CASE WHEN health_daily.steps_src = 'human' THEN 'human'
                         WHEN EXCLUDED.steps IS NOT NULL THEN 'watch'
                         ELSE health_daily.steps_src END,
       resting_hr = CASE WHEN health_daily.resting_hr_src = 'human' THEN health_daily.resting_hr
                         ELSE COALESCE(EXCLUDED.resting_hr, health_daily.resting_hr) END,
       resting_hr_src = CASE WHEN health_daily.resting_hr_src = 'human' THEN 'human'
                             WHEN EXCLUDED.resting_hr IS NOT NULL THEN 'watch'
                             ELSE health_daily.resting_hr_src END,
       updated_at = now()`,
    [s.date, s.weight, s.sleep, s.steps, s.hr]);

  let added = 0;
  for (const w of s.workouts) {
    const r = await client.query(
      `INSERT INTO health_workouts (on_date, kind, minutes, started_at, source, external_id)
       VALUES ($1,$2,$3,$4,'watch',$5)
       ON CONFLICT (external_id) DO NOTHING`,
      [s.date, w.kind, w.minutes, w.started, w.externalId]);
    added += r.rowCount;
  }
  return { date: s.date, workoutsAdded: added, warnings: s.warnings };
}
