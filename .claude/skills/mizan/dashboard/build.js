#!/usr/bin/env node
/**
 * Build the private Mīzān dashboard page.
 *
 *   node .claude/skills/mizan/dashboard/build.js <data-dir> <out.html>
 *
 * <data-dir> holds cal.json (calendar events), prayers.json (from
 * scripts/prayers.js) and tasks.json (Notion Command Center rows). It is
 * personal data: it lives in the scratchpad, never in this public repo.
 * The output is published as a PRIVATE artifact, never committed.
 */
const fs = require('fs');
const path = require('path');
const [dir, out] = process.argv.slice(2);
if (!dir || !out) { console.error('usage: build.js <data-dir> <out.html>'); process.exit(2); }
const read = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const data = { builtAt: now, events: read('cal.json'), prayers: read('prayers.json'), tasks: read('tasks.json') };
if (fs.existsSync(path.join(dir, 'domains.json'))) data.domains = read('domains.json');
// '<' escaped so no value can close the JSON script block.
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
fs.writeFileSync(out, tpl.replace('/*__DATA__*/', () => json));
console.log(out, (fs.statSync(out).size / 1024).toFixed(1) + ' KB');
