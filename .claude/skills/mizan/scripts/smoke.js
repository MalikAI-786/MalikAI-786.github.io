#!/usr/bin/env node
/**
 * Mīzān smoke test.
 *
 * Drives mizan/index.html in headless Chromium, exercises the interactions
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
const PAGE = 'file://' + path.resolve(__dirname, '../../../../mizan/index.html');

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

  await page.goto(PAGE);
  await page.waitForTimeout(400);

  // --- boot ---
  check('page renders seven measures',
    (await page.locator('#measureList .measure').count()) === 7);
  check('nav links resolve to real sections', await page.evaluate(() =>
    [...document.querySelectorAll('#navLinks a')]
      .every(a => document.querySelector(a.getAttribute('href')))));

  const times = await page.evaluate(() =>
    [...document.querySelectorAll('.pcell')].map(
      e => e.querySelector('.pn').textContent + ' ' + e.querySelector('.pt').textContent));
  check('five prayer times computed', times.length === 5 && !times.some(t => /—|NaN/.test(t)),
    times.join(' | '));
  console.log('  prayer times (TZ=' + (process.env.TZ || 'container default') + '): ' + times.join(' | '));

  // --- sample data + charts ---
  await page.click('#sampleBtn'); await page.waitForTimeout(400);
  check('heatmap draws 60 cells', (await page.locator('#heatGrid i').count()) === 60);
  check('deviation chart draws a bar per measure',
    (await page.locator('#devChart rect').count()) === 7);
  check('synthetic days excluded from "entries on record"',
    /Real day entries.*?\b[01]\b/s.test(await page.locator('#dataStats').innerText()),
    await page.locator('#dataStats').innerText().then(t => t.split('\n')[0]));

  // --- scoring ---
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

  // --- ledger ---
  await page.click('#addSession'); await page.waitForTimeout(200);
  await page.selectOption('#sTrig', 'avoidance');
  await page.click('#sSave'); await page.waitForTimeout(300);
  check('session form closes after save', !(await page.locator('#sessForm').count()));
  check('session appears in the ledger table',
    (await page.locator('#sessionList table tr').count()) >= 2);
  await page.click('[data-path="guard"]'); await page.waitForTimeout(200);
  check('Path B renders a control-exception table',
    (await page.locator('#pathPanel table tr').count()) >= 6);
  await page.click('[data-path="taper"]'); await page.waitForTimeout(200);
  check('Path A renders a taper schedule',
    (await page.locator('#pathPanel table').count()) >= 1);

  // --- badan ---
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mizan.v1'));
    s.measures = [{ date: '2025-01-01', weight: 180, shoulders: 49, lwaist: 35 },
                  { date: '2026-01-01', weight: 171, shoulders: 49.5, lwaist: 34 }];
    localStorage.setItem('mizan.v1', JSON.stringify(s));
  });
  await page.reload(); await page.waitForTimeout(500);
  const ratio = await page.locator('#swRatio').innerText();
  check('shoulder-to-waist ratio computes', Math.abs(parseFloat(ratio) - 49.5 / 34) < 0.002, ratio);
  check('measurement trend draws', (await page.locator('#wtChart polyline').count()) >= 1);
  check('Best-50 renders five standards', (await page.locator('[data-b50]').count()) === 5);
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

  // --- persistence + theme ---
  const before = await page.locator('#idxNum').innerText();
  await page.reload(); await page.waitForTimeout(500);
  await page.fill('#dayPicker', sat); await page.dispatchEvent('#dayPicker', 'change');
  await page.waitForTimeout(300);
  check('state survives reload', (await page.locator('#idxNum').innerText()) === before);

  await page.click('#themeBtn'); await page.waitForTimeout(250);
  check('theme toggles to light',
    (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light');
  await page.click('#themeBtn'); await page.waitForTimeout(250);
  check('theme toggles back to dark',
    (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'dark');

  // --- no network ---
  const html = require('fs').readFileSync(
    path.resolve(__dirname, '../../../../mizan/index.html'), 'utf8');
  check('no external references in the page',
    !/(https?:)?\/\/(?!127\.0\.0\.1)[\w.-]+\.[a-z]{2,}/i.test(
      html.replace(/https:\/\/(www\.)?(claude\.ai|anthropic\.com)[^\s"'<]*/g, '')),
    'found: ' + (html.match(/(https?:)?\/\/[\w.-]+\.[a-z]{2,}/i) || [''])[0]);
  check('no fetch/XHR/websocket calls',
    !/\b(fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon)/.test(html));

  // --- mobile ---
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on('pageerror', e => problems.push('MOBILE PAGE ERROR: ' + e.message));
  await m.goto(PAGE); await m.waitForTimeout(500);
  const overflow = await m.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('no horizontal overflow at 390px', overflow <= 0, overflow + 'px');

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
