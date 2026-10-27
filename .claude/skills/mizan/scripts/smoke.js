#!/usr/bin/env node
/**
 * Mīzān smoke test.
 *
 * Drives all six Mīzān pages in headless Chromium, exercises the interactions
 * that have broken before, and exits non-zero on any console error, page
 * error, failed assertion, or horizontal overflow at 390px.
 *
 *   node .claude/skills/mizan/scripts/smoke.js
 *   TZ=America/New_York node .claude/skills/mizan/scripts/smoke.js   # local-time check
 *
 * Prayer times are printed for eyeballing. They are computed in the
 * container's timezone — if that is UTC and the owner is in America/New_York,
 * times will read 4–5 hours late and that is correct, not a bug.
 */
const path = require('path');

function loadPlaywright() {
  const candidates = [
    'playwright',
    '/opt/node22/lib/node_modules/playwright',
    '/usr/lib/node_modules/playwright',
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* try next */ }
  }
  console.error('Could not resolve playwright. Try: npm ls -g --depth=0');
  process.exit(2);
}

const { chromium } = loadPlaywright();
const ROOT = path.resolve(__dirname, '../../../../mizan');
const url = p => 'file://' + path.join(ROOT, p);
// The published set. mizan/ledger/ is deliberately NOT here: the repo is
// public, so the intoxicant ledger stays on a working branch and is never
// deployed. If it reappears in this list, something republished it.
const PAGES = ['index.html', 'day/index.html', 'khudi/index.html',
               'badan/index.html', 'money/index.html', 'record/index.html', 'coach/index.html'];
const PAGE = url('day/index.html');   // the page that carries the daily sheet

const problems = [];
const checks = [];
function check(name, cond, detail) {
  checks.push({ name, ok: !!cond, detail });
  if (!cond) problems.push(`FAILED: ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  page.on('pageerror', e => problems.push('PAGE ERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') problems.push('CONSOLE: ' + m.text()); });
  page.on('dialog', d => d.accept());

  // --- every page loads clean, nav resolves, shared engine boots ---
  for (const rel of PAGES) {
    await page.goto(url(rel));
    await page.waitForTimeout(350);
    const nav = await page.evaluate(() => ({
      links: [...document.querySelectorAll('#navLinks a')].map(a => a.getAttribute('href')),
      foot: (document.querySelector('#footVer') || {}).textContent || '',
    }));
    // coach/ is standalone and builds no nav of its own
    if (rel !== 'coach/index.html')
      check(`${rel} builds its nav`, nav.links.length === 6, nav.links.join(','));
    if (rel !== 'coach/index.html')
      check(`${rel} boots the shared engine`, /^mizan\.v1/.test(nav.foot), nav.foot);
  }
  // nav targets exist on disk
  for (const rel of ['day', 'khudi', 'badan', 'money', 'record', 'coach']) {
    check(`${rel}/index.html exists`, require('fs').existsSync(path.join(ROOT, rel, 'index.html')));
  }

  await page.goto(url('index.html'));
  await page.waitForTimeout(400);
  check('dashboard renders six kicker tiles',
    (await page.locator('#dashGrid .tile').count()) === 6);
  check('dashboard names a leftmost failing control or says why not',
    (await page.locator('#dashWorst').innerText()).length > 40);

  await page.goto(url('khudi/index.html'));
  await page.waitForTimeout(400);
  check('khudi force diagram draws', (await page.locator('#forceDiagram rect').count()) >= 4);
  check('khudi diagram marks the current stage',
    (await page.locator('#forceDiagram').innerHTML()).includes('YOU ARE HERE'));
  check('khudi page carries ladder, measures and path',
    (await page.locator('#ladderGrid .rung').count()) === 4 &&
    (await page.locator('#measureRef .card').count()) === 7 &&
    (await page.locator('#phaseGrid .phase').count()) === 4);

  await page.goto(PAGE);
  await page.waitForTimeout(400);

  // --- boot ---
  check('page renders seven measures',
    (await page.locator('#measureList .measure').count()) === 7);
  check('exactly one nav link is marked current', await page.evaluate(() =>
    document.querySelectorAll('#navLinks a.on').length === 1));
  check('no published page links to the unpublished ledger', await page.evaluate(() =>
    !document.body.innerHTML.includes('ledger/')));

  const times = await page.evaluate(() =>
    [...document.querySelectorAll('.pcell')].map(
      e => e.querySelector('.pn').textContent + ' ' + e.querySelector('.pt').textContent));
  check('five prayer times computed', times.length === 5 && !times.some(t => /—|NaN/.test(t)),
    times.join(' | '));
  console.log('  prayer times (TZ=' + (process.env.TZ || 'container default') + '): ' + times.join(' | '));

  // --- sample data + charts (Record page owns the data controls) ---
  await page.goto(url('record/index.html')); await page.waitForTimeout(350);
  await page.click('#sampleBtn'); await page.waitForTimeout(400);
  check('heatmap draws 60 cells', (await page.locator('#heatGrid i').count()) === 60);
  check('deviation chart draws a bar per measure',
    (await page.locator('#devChart rect').count()) === 7);
  check('synthetic days excluded from "entries on record"',
    /Real day entries.*?\b[01]\b/s.test(await page.locator('#dataStats').innerText()),
    await page.locator('#dataStats').innerText().then(t => t.split('\n')[0]));

  // --- scoring ---
  await page.goto(PAGE); await page.waitForTimeout(400);
  for (const p of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
    await page.click(`[data-prayer="${p}"] button[data-v="in"]`);
  }
  const salah = await page.evaluate(() => {
    const r = [...document.querySelectorAll('#measureList .measure')]
      .find(x => x.textContent.includes('Ṣalāh'));
    return r.querySelector('.mono').textContent.trim();
  });
  check('all five prayers in-window scores Ṣalāh 3/3', salah.startsWith('3'), salah);

  await page.click('[data-measure="zabt"] button[data-v="3"]');
  // NB: use the page's own current key, not toISOString() — that is UTC and
  // will point at the wrong day whenever the container TZ differs.
  const todayKey = await page.inputValue('#dayPicker');
  check('manual measure score persists to state', await page.evaluate(k =>
    JSON.parse(localStorage.getItem('mizan.v1')).days[k].scores.zabt === 3, todayKey));

  const idx = await page.locator('#idxNum').innerText();
  check('index computes to a number', /^\d+$/.test(idx), idx);

  // --- 3-6-9 practice ---
  await page.fill('#i369', 'Test intention line');
  await page.waitForTimeout(150);
  check('369 intention persists to settings', await page.evaluate(() =>
    JSON.parse(localStorage.getItem('mizan.v1')).settings.intention369 === 'Test intention line'));
  check('369 renders three progress rows', (await page.locator('[data-369]').count()) === 3);
  for (let i = 0; i < 3; i++) await page.click('[data-369="morning"]');
  await page.waitForTimeout(150);
  const p369 = await page.evaluate(k =>
    JSON.parse(localStorage.getItem('mizan.v1')).days[k].practice369.morning, todayKey);
  check('369 morning count caps at target (3)', p369 === 3, String(p369));
  check('369 morning button disables once capped',
    await page.locator('[data-369="morning"]').isDisabled());
  await page.reload(); await page.waitForTimeout(400);
  check('369 intention survives reload', (await page.inputValue('#i369')) === 'Test intention line');

  // --- badan ---
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mizan.v1'));
    s.measures = [{ date: '2025-01-01', weight: 180, shoulders: 49, lwaist: 35 },
                  { date: '2026-01-01', weight: 171, shoulders: 49.5, lwaist: 34 }];
    localStorage.setItem('mizan.v1', JSON.stringify(s));
  });
  await page.goto(url('badan/index.html')); await page.waitForTimeout(500);
  const ratio = await page.locator('#swRatio').innerText();
  check('shoulder-to-waist ratio computes', Math.abs(parseFloat(ratio) - 49.5 / 34) < 0.002, ratio);
  check('measurement trend draws', (await page.locator('#wtChart polyline').count()) >= 1);
  check('Best-50 renders six standards', (await page.locator('[data-b50]').count()) === 6);
  await page.click('[data-b50="pistol"] button[data-v="3"]'); await page.waitForTimeout(200);
  check('Best-50 composite responds to a level change',
    (await page.locator('#b50Score').innerText()) !== '0%');

  // gym day: prayer-collision guidance must appear
  const sat = await page.evaluate(() => {
    const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return d.toISOString().slice(0, 10);
  });
  await page.fill('#dayPicker', sat);
  await page.dispatchEvent('#dayPicker', 'change');
  await page.waitForTimeout(300);
  const note = await page.locator('#gymPrayerNote').innerText();
  check('gym/prayer guidance renders on a training day', note.length > 20, note.slice(0, 80));
  await page.click('[data-gym="done"]'); await page.waitForTimeout(200);
  check('gym log persists', await page.evaluate(d =>
    JSON.parse(localStorage.getItem('mizan.v1')).days[d].gym.status === 'done', sat));

  // --- health import ---------------------------------------------------
  // Lives on the Record page, not the coach route: this reads a file the owner
  // chose, in their own browser. The check that matters is not that it imports,
  // it is that it REFUSES to overwrite something a human entered.
  {
    const os = require('os');
    const hx = path.join(os.tmpdir(), 'mizan-smoke-health.xml');
    const rows = ['<?xml version="1.0" encoding="UTF-8"?>', '<HealthData locale="en_US">'];
    for (let i = 1; i <= 6; i++) {
      const d = `2026-03-0${i}`;
      const prev = i === 1 ? '2026-02-28' : `2026-03-0${i - 1}`;
      rows.push(`<Record type="HKQuantityTypeIdentifierBodyMass" unit="lb" value="17${i}.0" startDate="${d} 07:00:00 -0500" endDate="${d} 07:00:00 -0500"/>`);
      rows.push(`<Record type="HKQuantityTypeIdentifierStepCount" unit="count" value="9000" startDate="${d} 12:00:00 -0500" endDate="${d} 12:30:00 -0500"/>`);
      rows.push(`<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepCore" startDate="${prev} 23:00:00 -0500" endDate="${d} 07:00:00 -0500"/>`);
      rows.push(`<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisInBed" startDate="${prev} 22:00:00 -0500" endDate="${d} 08:00:00 -0500"/>`);
      rows.push(`<Workout workoutActivityType="HKWorkoutActivityTypeTraditionalStrengthTraining" duration="60" durationUnit="min" startDate="${d} 17:00:00 -0500" endDate="${d} 18:00:00 -0500"></Workout>`);
    }
    // a deliberately impossible stretch: the guard must drop this, not average it
    rows.push('<Record type="HKCategoryTypeIdentifierSleepAnalysis" value="HKCategoryValueSleepAnalysisAsleepCore" startDate="2026-03-10 23:00:00 -0500" endDate="2026-03-18 07:00:00 -0400"/>');
    rows.push('</HealthData>');
    require('fs').writeFileSync(hx, rows.join('\n'));

    await page.goto(url('record/index.html')); await page.waitForTimeout(350);
    check('record page carries the health import card',
      (await page.locator('#healthBtn').count()) === 1);

    // a day the owner already judged: the watch must not get a vote on it
    await page.evaluate(() => {
      const raw = localStorage.getItem('mizan.v1');
      const s = raw ? JSON.parse(raw) : { v: 1, settings: {}, days: {}, urges: [], ships: {}, measures: [], best50: {} };
      s.days = s.days || {}; s.measures = s.measures || [];
      s.days['2026-03-02'] = { date: '2026-03-02', prayers: {}, scores: {}, weed: { sessions: [] },
        gym: { status: 'missed-partner', note: 'trainer cancelled' }, food: {},
        sleepHrs: 5.5, weight: 199, moved: false, friction: [0,0,0,0,0],
        muhasaba: {}, closed: false, synthetic: false };
      localStorage.setItem('mizan.v1', JSON.stringify(s));
    });
    await page.reload(); await page.waitForTimeout(350);

    await page.setInputFiles('#healthFile', hx);
    await page.waitForFunction(() => document.querySelector('#healthOut').innerText.length > 40, { timeout: 30000 });
    const preview = await page.locator('#healthOut').innerText();
    check('health import previews a plan before applying', /new entries/.test(preview),
      preview.split('\n')[0]);
    check('health import stages without writing to state', await page.evaluate(() =>
      JSON.parse(localStorage.getItem('mizan.v1')).days['2026-03-01'] === undefined));

    await page.click('#healthApply'); await page.waitForTimeout(500);
    const after = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('mizan.v1'));
      return { kept: s.days['2026-03-02'], made: s.days['2026-03-01'] };
    });
    check('import writes sleep, session and weight for an untouched day',
      after.made && after.made.sleepHrs === 8 && after.made.gym.status === 'done' &&
      after.made.gym.src === 'health' && after.made.weight === 171);
    check('import counts only Asleep intervals, never InBed',
      after.made && after.made.sleepHrs === 8, String(after.made && after.made.sleepHrs));
    check('import discards an impossible sleep stretch instead of averaging it in',
      /discarded as impossible/.test(preview) && await page.evaluate(() =>
        JSON.parse(localStorage.getItem('mizan.v1')).days['2026-03-18'] === undefined));
    check('import never overwrites a human gym judgment',
      after.kept.gym.status === 'missed-partner' && after.kept.gym.note === 'trainer cancelled');
    check('import never overwrites a human sleep or weight entry',
      after.kept.sleepHrs === 5.5 && after.kept.weight === 199);

    // --- two phones + a watch + Fitbit, selected together ---
    // Every device records the same walk and night; the day must take the
    // largest single device, never the sum. Dates sit inside the 30-day chart window.
    const fs = require('fs');
    const ymd = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
    const mdy = k => k.slice(5, 7) + '/' + k.slice(8, 10) + '/' + k.slice(2, 4);
    const dA = ymd(4), dPrev = ymd(5), dB = ymd(3);
    const rec = (src, type, extra) => `<Record type="HK${type}" sourceName="${src}" ${extra}/>`;
    const phoneA = path.join(os.tmpdir(), 'mizan-phoneA.xml'), phoneB = path.join(os.tmpdir(), 'mizan-phoneB.xml');
    fs.writeFileSync(phoneA, ['<HealthData>',
      rec('Phone A', 'QuantityTypeIdentifierStepCount', `unit="count" value="8000" startDate="${dA} 12:00:00 -0400" endDate="${dA} 13:00:00 -0400"`),
      rec('Watch', 'QuantityTypeIdentifierStepCount', `unit="count" value="7000" startDate="${dA} 12:00:00 -0400" endDate="${dA} 13:00:00 -0400"`),
      rec('Watch', 'CategoryTypeIdentifierSleepAnalysis', `value="HKCategoryValueSleepAnalysisAsleepCore" startDate="${dPrev} 23:00:00 -0400" endDate="${dA} 06:00:00 -0400"`),
      rec('Phone A', 'CategoryTypeIdentifierSleepAnalysis', `value="HKCategoryValueSleepAnalysisAsleepUnspecified" startDate="${dPrev} 23:30:00 -0400" endDate="${dA} 05:30:00 -0400"`),
      '</HealthData>'].join('\n'));
    fs.writeFileSync(phoneB, ['<HealthData>',
      rec('Phone B', 'QuantityTypeIdentifierStepCount', `unit="count" value="9500" startDate="${dA} 09:00:00 -0400" endDate="${dA} 18:00:00 -0400"`),
      '</HealthData>'].join('\n'));
    const fbDir = path.join(os.tmpdir(), 'mizan-fitbit'); fs.mkdirSync(fbDir, { recursive: true });
    const fbSteps = path.join(fbDir, `steps-${dB}.json`), fbSleep = path.join(fbDir, `sleep-${dB}.json`),
          fbRhr = path.join(fbDir, `resting_heart_rate-${dB}.json`);
    fs.writeFileSync(fbSteps, JSON.stringify([{ dateTime: mdy(dB) + ' 10:00:00', value: '6000' }, { dateTime: mdy(dB) + ' 16:00:00', value: '5000' }]));
    fs.writeFileSync(fbSleep, JSON.stringify([{ dateOfSleep: dB, minutesAsleep: 390, mainSleep: true }]));
    fs.writeFileSync(fbRhr, JSON.stringify([{ dateTime: mdy(dB) + ' 00:00:00', value: { date: mdy(dB), value: 58.4, error: 6 } }]));

    await page.reload(); await page.waitForTimeout(300);
    await page.setInputFiles('#healthFile', [phoneA, phoneB, fbSteps, fbSleep, fbRhr]);
    await page.waitForFunction(() => /new entries|Nothing new/.test(document.querySelector('#healthOut').innerText), { timeout: 30000 });
    const multi = await page.locator('#healthOut').innerText();
    check('multi-file import names every device it saw', /Phone A/.test(multi) && /Phone B/.test(multi) && /Fitbit/.test(multi) && /Watch/.test(multi), multi.split('\n')[0]);
    await page.click('#healthApply'); await page.waitForTimeout(400);
    const md = await page.evaluate(([a, b]) => { const s = JSON.parse(localStorage.getItem('mizan.v1')); return [s.days[a], s.days[b]]; }, [dA, dB]);
    check('steps across phone, watch and second phone take the largest device, not the sum',
      md[0] && md[0].steps === 9500, String(md[0] && md[0].steps));
    check('sleep across watch and phone takes the largest device, not the sum',
      md[0] && md[0].sleepHrs === 7, String(md[0] && md[0].sleepHrs));
    check('Fitbit JSON imports steps, sleep and resting heart rate',
      md[1] && md[1].steps === 11000 && md[1].sleepHrs === 6.5 && md[1].rhr === 58, JSON.stringify(md[1] && [md[1].steps, md[1].sleepHrs, md[1].rhr]));

    await page.goto(url('badan/index.html')); await page.waitForTimeout(400);
    check('health charts draw imported steps as bars',
      (await page.locator(`#hSteps rect title:text-is("${dA} · 9.5k")`).count()) === 1);
    check('health charts draw sleep against the target line',
      (await page.locator('#hSleep text', { hasText: 'target' }).count()) === 1 &&
      /Mean/.test(await page.locator('#hSleepNote').innerText()));
    check('health charts draw resting heart rate',
      (await page.locator('#hRhr circle').count()) >= 1);

    // --- the same Watch samples inside two phones' exports count once ---
    // Both copies land in the same source bucket, so the per-source max cannot
    // catch them; only a per-sample key can. Without it: 7000+7000+2000 steps.
    const dC = ymd(6), dCprev = ymd(7);
    const watchSteps = rec('Watch', 'QuantityTypeIdentifierStepCount', `unit="count" value="7000" startDate="${dC} 12:00:00 -0400" endDate="${dC} 13:00:00 -0400"`);
    const watchSleep = rec('Watch', 'CategoryTypeIdentifierSleepAnalysis', `value="HKCategoryValueSleepAnalysisAsleepCore" startDate="${dCprev} 23:00:00 -0400" endDate="${dC} 06:00:00 -0400"`);
    const dupX = path.join(os.tmpdir(), 'mizan-dupX.xml'), dupY = path.join(os.tmpdir(), 'mizan-dupY.xml');
    fs.writeFileSync(dupX, ['<HealthData>', watchSteps, watchSleep, '</HealthData>'].join('\n'));
    fs.writeFileSync(dupY, ['<HealthData>', watchSteps, watchSleep,
      rec('Watch', 'QuantityTypeIdentifierStepCount', `unit="count" value="2000" startDate="${dC} 17:00:00 -0400" endDate="${dC} 18:00:00 -0400"`),
      '</HealthData>'].join('\n'));
    await page.goto(url('record/index.html')); await page.waitForTimeout(300);
    await page.setInputFiles('#healthFile', [dupX, dupY]);
    await page.waitForFunction(() => /new entries|Nothing new/.test(document.querySelector('#healthOut').innerText), { timeout: 30000 });
    await page.click('#healthApply'); await page.waitForTimeout(400);
    const dc = await page.evaluate(k => JSON.parse(localStorage.getItem('mizan.v1')).days[k], dC);
    check('Watch samples repeated across two exports are counted once (steps)',
      dc && dc.steps === 9000, String(dc && dc.steps));
    check('Watch samples repeated across two exports are counted once (sleep)',
      dc && dc.sleepHrs === 7, String(dc && dc.sleepHrs));
  }

  // --- a scheduled training day with no programmed split must still render ---
  // Monday is a default training day with no ROT entry; that once threw on
  // rot.n and blanked every renderer after renderBadan.
  {
    const errsBefore = problems.length;
    const mon = (() => { const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
    await page.goto(url('badan/index.html'));
    // the continuity check below depends on the day already being viewed; restore it after
    const prevCur = await page.evaluate(() => sessionStorage.getItem('mizan.cur'));
    await page.evaluate(k => sessionStorage.setItem('mizan.cur', k), mon);
    await page.reload(); await page.waitForTimeout(400);
    check('Badan renders a training day that has no rotation set (Monday)',
      problems.length === errsBefore && /no rotation set for Mon/.test(await page.locator('#gymToday').innerText()));
    // --- guided session: one beat-counted timeline drives the clock, the reps and the music ---
    check('Badan offers a guided session for the day',
      /Guided session · \d+ min/i.test(await page.locator('#sessionCard').innerText()));
    await page.click('#sessStart'); await page.waitForTimeout(1500);
    check('session player opens on the first warm-up move with a running clock',
      (await page.locator('#plName').innerText()) === 'March in place' && /^0:4\d$/.test(await page.locator('#plTime').innerText()),
      await page.locator('#plTime').innerText());
    check('session player paces reps on the beat',
      /(DOWN|UP) · rep \d+/.test(await page.locator('#plRep').innerText()) && (await page.locator('#plBeats b.on').count()) === 1);
    await page.click('#plPause'); const held = await page.locator('#plTime').innerText(); await page.waitForTimeout(900);
    check('pause freezes the session clock', (await page.locator('#plTime').innerText()) === held);
    await page.click('#plPause');
    await page.click('#plSkip'); await page.waitForTimeout(700);
    check('skip moves to the next block on its downbeat', (await page.locator('#plName').innerText()) === 'Arm circles');
    await page.click('#plEnd'); await page.waitForTimeout(300);
    check('a session under ten minutes is not logged as training',
      /not logged/.test(await page.locator('#player').innerText()) &&
      await page.evaluate(k => { const d = JSON.parse(localStorage.getItem('mizan.v1')).days[k]; return !(d && d.gym && d.gym.sessionMin); }, mon));
    await page.click('#plClose');
    check('session player closes back to the page', await page.evaluate(() => document.querySelector('#player').hidden));

    await page.evaluate(k => k ? sessionStorage.setItem('mizan.cur', k) : sessionStorage.removeItem('mizan.cur'), prevCur);
  }

  // --- cross-page day continuity, persistence, theme ---
  await page.goto(url('day/index.html')); await page.waitForTimeout(500);
  check('viewed day carries from Badan to Day', (await page.inputValue('#dayPicker')) === sat, sat);
  const before = await page.locator('#idxNum').innerText();
  await page.reload(); await page.waitForTimeout(500);
  check('state survives reload', (await page.locator('#idxNum').innerText()) === before, before);

  // --- .ics export (record page) ---
  await page.goto(url('record/index.html')); await page.waitForTimeout(400);
  const ics = await page.evaluate(async () => {
    let captured = null;
    URL.createObjectURL = b => { captured = b; return 'blob:mizan-test'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = () => {};
    document.querySelector('#icsBtn').click();
    return captured ? await captured.text() : '';
  });
  const vevents = (ics.match(/BEGIN:VEVENT/g) || []).length;
  check('ics export is a calendar with 3 sessions + 4 prompts', /^BEGIN:VCALENDAR/.test(ics) && vevents === 7, String(vevents));
  check('ics training sessions carry the real per-day hours',
    /DTSTART:\d{8}T073000\r\nDTEND:\d{8}T090000\r\nRRULE:FREQ=WEEKLY;BYDAY=SA/.test(ics)
    && /DTSTART:\d{8}T164500\r\nDTEND:\d{8}T181500\r\nRRULE:FREQ=WEEKLY;BYDAY=MO/.test(ics));

  await page.click('#themeBtn'); await page.waitForTimeout(250);
  check('theme toggles to light',
    (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light');
  await page.click('#themeBtn'); await page.waitForTimeout(250);
  check('theme toggles back to dark',
    (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'dark');

  // --- Money: statement files read on the device, never the network ---
  {
    const fs = require('fs'), os = require('os');
    const ym = n => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - n); return d; };
    const dstr = (d, day) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const m2 = ym(2), m1 = ym(1), m0 = ym(0);
    // synthetic checking export: payroll, a monthly streaming bill (recurring), groceries, a transfer
    const csv = ['Date,Description,Amount,Balance',
      `${dstr(m0, 3)},STREAMCO MONTHLY,-15.49,4120.00`, `${dstr(m0, 1)},ACME PAYROLL DIRECT DEP,3000.00,4135.49`,
      `${dstr(m1, 3)},STREAMCO MONTHLY,-15.49,`, `${dstr(m1, 12)},"WHOLE FOODS #123, NJ",-84.20,`, `${dstr(m1, 15)},ONLINE TRANSFER TO SAVINGS,-500.00,`,
      `${dstr(m2, 3)},STREAMCO MONTHLY,-15.49,`, `${dstr(m2, 1)},ACME PAYROLL DIRECT DEP,3000.00,`].join('\n');
    const csvF = path.join(os.tmpdir(), 'mizan-checking.csv'); fs.writeFileSync(csvF, csv);
    const ofx = `OFXHEADER:100\n<OFX><CREDITCARDMSGSRSV1><CCSTMTTRNRS><CCSTMTRS><CCACCTFROM><ACCTID>4111000011119876</CCACCTFROM>
<BANKTRANLIST><STMTTRN><TRNTYPE>DEBIT<DTPOSTED>${dstr(m0, 2).replace(/-/g, '')}<TRNAMT>-42.10<FITID>F1<NAME>HALAL GRILL</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>${dstr(m0, 4).replace(/-/g, '')}<TRNAMT>-19.99<FITID>F2<NAME>SPOTIFY</STMTTRN></BANKTRANLIST>
<LEDGERBAL><BALAMT>-62.09<DTASOF>${dstr(m0, 5).replace(/-/g, '')}</LEDGERBAL></CCSTMTRS></CCSTMTTRNRS></CREDITCARDMSGSRSV1></OFX>`;
    const ofxF = path.join(os.tmpdir(), 'mizan-card.ofx'); fs.writeFileSync(ofxF, ofx);
    const before = await page.evaluate(() => localStorage.getItem('mizan.v1'));
    await page.goto(url('money/index.html')); await page.waitForTimeout(300);
    check('Money page boots with an empty-state chart', /Import a statement/.test(await page.locator('#mFlow').innerHTML()));
    await page.setInputFiles('#mFile', csvF); await page.waitForTimeout(300);
    check('Money previews a CSV before adding it', /7<\/b> transactions/.test(await page.locator('#mImportOut').innerHTML()));
    await page.fill('#mNewName', 'Checking'); await page.click('#mApply'); await page.waitForTimeout(300);
    check('Money adds the CSV and takes its balance', /Added <b>7<\/b>/.test(await page.locator('#mImportOut').innerHTML()) &&
      /\$4,120\.00/.test(await page.locator('#mAccounts').innerText()));
    await page.setInputFiles('#mFile', csvF); await page.waitForTimeout(300);
    await page.selectOption('#mAcct', { label: 'Checking' }); await page.click('#mApply'); await page.waitForTimeout(300);
    check('Money skips duplicates on a re-import', /Added <b>0<\/b>.*skipped <b>7<\/b>/.test(await page.locator('#mImportOut').innerHTML()));
    await page.setInputFiles('#mFile', ofxF); await page.waitForTimeout(300);
    check('Money reads an OFX card file as a credit account', (await page.inputValue('#mType')) === 'credit');
    await page.click('#mApply'); await page.waitForTimeout(300);
    const tiles = await page.locator('#mTiles').innerText();
    check('Money nets cards against cash', /\$4,058/.test(tiles), tiles.replace(/\n/g, ' '));
    check('Money detects a monthly recurring bill', /STREAMCO MONTHLY/.test(await page.locator('#mRecurring').innerText()));
    check('Money leaves transfers out of spending', !/Transfers/.test(await page.locator('#mCats').innerText()) &&
      /Groceries/.test(await page.locator('#mCats').innerText()));
    await page.fill('#lName', 'Test loan'); await page.fill('#lBal', '300000'); await page.fill('#lRate', '6');
    await page.fill('#lPay', '1798.65'); await page.fill('#lDue', dstr(m0, 1)); await page.click('#mLoanAdd'); await page.waitForTimeout(300);
    const loan = await page.locator('#mLoans').innerText();
    check('Money amortises a fixed-rate loan (300k at 6%, 1798.65 → 360 payments)', /360 payments/.test(loan) && /\$1,500\.00/.test(loan), loan.split('\n').slice(0, 6).join(' | '));
    check('Money keeps bank data under its own key, out of the Mīzān export', await page.evaluate(b =>
      !!localStorage.getItem('mizan.money.v1') && localStorage.getItem('mizan.v1') === b, before));
    await page.click('#mErase'); await page.waitForTimeout(200);
  }

  // --- Lab (participant edition): standalone shell, own key, same model ---
  const LAB = ['lab/index.html', 'lab/log/index.html'];
  await page.goto(url('lab/index.html')); await page.waitForTimeout(350);
  check('lab shows onboarding before a profile exists', await page.evaluate(() =>
    !document.querySelector('#onboard').hidden && document.querySelector('#app').hidden));
  check('lab onboarding lists the seven measures as the hardest-measure choices',
    (await page.locator('#obHardest option').count()) === 8);
  await page.click('#obGo'); await page.waitForTimeout(150);
  check('lab refuses to start with the questions unanswered',
    /Still needed/.test(await page.locator('#obErr').innerText()));
  await page.goto(url('lab/index.html?to=partner%40example.test&partner=Partner')); await page.waitForTimeout(350);
  check('lab prefills the partner from the invitation link', await page.evaluate(() =>
    document.querySelector('#obTo').value === 'partner@example.test' && document.querySelector('#obPartner').value === 'Partner'));
  // the owner's pages ran earlier in this same origin; the Lab must leave their state alone
  const ownerBefore = await page.evaluate(() => localStorage.getItem('mizan.v1'));
  await page.fill('#obHandle', 'SecretHandle');
  await page.fill('#obField', 'a proof');
  await page.selectOption('#obHardest', 'zabt');
  await page.selectOption('#obStage', '1');
  await page.fill('#obZabt', 'SecretCommitment');
  await page.check('#obConsent');
  await page.click('#obGo'); await page.waitForTimeout(300);
  check('lab onboarding completes into the sheet', await page.evaluate(() =>
    document.querySelector('#onboard').hidden && !document.querySelector('#app').hidden));
  check('lab stores its state under its own key and leaves the owner\'s untouched', await page.evaluate(b =>
    !!localStorage.getItem('mizan.lab.v1') && localStorage.getItem('mizan.v1') === b, ownerBefore));
  check('lab day 1 activates exactly three measures (phase 1)',
    (await page.locator('#measures .seg').count()) === 2 &&            // salah count + sprints
    (await page.locator('#measures [data-body]').count()) === 4);
  await page.click('[data-seg="salahCount"][data-v="5"]'); await page.waitForTimeout(100);
  await page.click('[data-seg="sprints"][data-v="2"]'); await page.waitForTimeout(100);
  await page.check('[data-chk="oneThingDone"]'); await page.waitForTimeout(100);
  for (const b of ['slept', 'moved', 'protein']) await page.check(`[data-body="${b}"]`);
  await page.waitForTimeout(200);
  check('lab computes a full index from tallies alone (5 prayers, 2 blocks + One Thing, 3 of 4 body)',
    (await page.locator('#idxNum').innerText()) === '100', await page.locator('#idxNum').innerText());
  await page.fill('#oneThing', 'SecretOneThing');
  await page.fill('#closeLine', 'SecretClosingLine');
  await page.check('#closedChk');
  await page.click('[data-seg="fit"][data-v="2"]');
  await page.fill('#fbWrong', 'Step 2 and 3 of Zabt indistinguishable');
  await page.selectOption('#fbMeasure', 'zabt');
  await page.waitForTimeout(200);
  await page.click('#copyBtn'); await page.waitForTimeout(200);
  const packet = await page.locator('#packetOut').innerText();
  check('lab packet is framed for ingest', /^MIZAN-LAB-PACKET\n[\s\S]+\nEND-PACKET$/.test(packet));
  check('lab packet carries code, scores, closure, fit and feedback',
    /"pid":"P-[2-9A-Z]{4}"/.test(packet) && /"salah":3/.test(packet) && /"closed":true/.test(packet)
    && /"fit":2/.test(packet) && /indistinguishable/.test(packet) && /"about":"zabt"/.test(packet));
  check('lab packet withholds the handle, One Thing, closing line and commitment',
    !/Secret(Handle|OneThing|ClosingLine|Commitment)/.test(packet));
  check('lab packet withholds the partner email', !/partner@example/.test(packet));
  await page.reload(); await page.waitForTimeout(350);
  check('lab state survives reload', (await page.locator('#idxNum').innerText()) === '100');
  check('lab footer reports the lab key', /^mizan\.lab\.v1/.test(await page.locator('#footVer').innerText()));
  await page.goto(url('lab/log/index.html')); await page.waitForTimeout(300);
  check('lab log page boots and marks itself current', await page.evaluate(() =>
    [...document.querySelectorAll('#navLinks a.on')].length === 1 && document.querySelectorAll('#entries .phase').length >= 1));
  check('lab log names participants by code only, never a person',
    !/P-[2-9A-Z]{4}[^<]*\b(Dr|Prof|Mr|Ms|Mrs)\b/.test(require('fs').readFileSync(path.join(ROOT, 'lab/log/index.html'), 'utf8')));
  // the two engines must carry one model: compare rubrics id-by-id
  const fs = require('fs');
  const rubrics = src => { const out = {}; const re = /\{id:'(\w+)'[\s\S]*?rubric:\[([^\]]*)\]/g; let x;
    while ((x = re.exec(src))) out[x[1]] = x[2].replace(/\s+/g, ' '); return out; };
  const coreR = rubrics(fs.readFileSync(path.join(ROOT, 'core.js'), 'utf8').split('/* ---------------- state')[0]);
  const labR = rubrics(fs.readFileSync(path.join(ROOT, 'lab/lab.js'), 'utf8').split('/* ---------------- state')[0]);
  check('lab.js rubrics mirror core.js for all seven measures',
    Object.keys(coreR).length === 7 && Object.keys(coreR).every(k => labR[k] === coreR[k]),
    Object.keys(coreR).filter(k => labR[k] !== coreR[k]).join(','));
  const weightsOf = src => (src.match(/var DEFW=(\{[^}]*\})/) || [])[1];
  check('lab.js weights mirror core.js',
    weightsOf(fs.readFileSync(path.join(ROOT, 'lab/lab.js'), 'utf8')) === weightsOf(fs.readFileSync(path.join(ROOT, 'core.js'), 'utf8')));

  // --- no network ---
  const html = [...PAGES, ...LAB, 'lab/lab.js', 'money/money.js', 'core.js', 'core.css']
    .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  check('no external references in any file',
    !/(https?:)?\/\/(?!127\.0\.0\.1)[\w.-]+\.[a-z]{2,}/i.test(
      html.replace(/https:\/\/(www\.)?(claude\.ai|anthropic\.com)[^\s"'<]*/g, '')),
    'found: ' + (html.match(/(https?:)?\/\/[\w.-]+\.[a-z]{2,}/i) || [''])[0]);
  check('no fetch/XHR/websocket calls',
    !/\b(fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon)/.test(html));

  // --- mobile ---
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on('pageerror', e => problems.push('MOBILE PAGE ERROR: ' + e.message));
  for (const rel of [...PAGES, ...LAB]) {
    await m.goto(url(rel)); await m.waitForTimeout(400);
    const overflow = await m.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`no horizontal overflow at 390px — ${rel}`, overflow <= 0, overflow + 'px');
  }

  await browser.close();

  const passed = checks.filter(c => c.ok).length;
  console.log('');
  checks.forEach(c => console.log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.name}` +
    (c.ok || !c.detail ? '' : `  [${c.detail}]`)));
  console.log(`\n  ${passed}/${checks.length} checks passed`);
  if (problems.length) {
    console.error('\n' + problems.join('\n'));
    process.exit(1);
  }
  console.log('  smoke test clean\n');
})().catch(e => { console.error(e); process.exit(2); });
