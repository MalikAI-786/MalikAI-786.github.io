#!/usr/bin/env node
/**
 * Prayer times for a run of dates, read off Mīzān's own engine (the Day page)
 * in the owner's timezone, so a day sheet carries the same numbers the app shows.
 *
 *   node .claude/skills/mizan/scripts/prayers.js 2026-09-27 8 > prayers.json
 *
 * Output: { "<date>": [["Fajr","05:33"], ["Ẓuhr","12:49"], ...], ... }
 * Uses the engine's default location (New York, ISNA) — the owner's own
 * settings live in his browser and are not reachable from here.
 */
const path = require('path');
function loadPlaywright() {
  for (const c of ['playwright', '/opt/node22/lib/node_modules/playwright', '/usr/lib/node_modules/playwright']) {
    try { return require(c); } catch (e) { /* next */ }
  }
  console.error('Could not resolve playwright'); process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = path.resolve(__dirname, '../../../../mizan');
(async () => {
  const from = process.argv[2], days = +process.argv[3] || 8, tz = process.env.MIZAN_TZ || 'America/New_York';
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ timezoneId: tz })).newPage();
  await page.goto('file://' + path.join(ROOT, 'day/index.html'));
  await page.waitForTimeout(300);
  const out = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(from + 'T12:00:00'); d.setDate(d.getDate() + i);
    const k = d.toISOString().slice(0, 10);
    await page.fill('#dayPicker', k); await page.dispatchEvent('#dayPicker', 'change');
    await page.waitForTimeout(150);
    out[k] = await page.evaluate(() => [...document.querySelectorAll('.pcell')].map(e =>
      [e.querySelector('.pn').textContent.trim(), e.querySelector('.pt').textContent.trim()]));
  }
  console.log(JSON.stringify(out));
  await browser.close();
})();
