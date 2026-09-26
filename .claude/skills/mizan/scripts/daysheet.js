#!/usr/bin/env node
/**
 * Mīzān day sheet — one Word document per day, laid out for OneNote.
 *
 *   node .claude/skills/mizan/scripts/daysheet.js input.json out-dir/
 *
 * input.json (never commit it — it carries the owner's calendar):
 *   { "date": "2026-09-27", "prayers": { "<date>": [["Fajr","05:33"], ...] },
 *     "events": [{ "date": "2026-09-27", "start": "06:35", "end": "06:45",
 *                  "title": "...", "allDay": false }, ...],
 *     "gym": { "0": "07:30", "1": "16:45", "6": "07:30" } }
 *
 * Produces  <out-dir>/mizan-<date>.docx . The sheet is the whole day in one
 * place: intention, prayer spine, the timeline with a notes column, the seven
 * measures with their rubric, the nightly close, and the week ahead. The owner
 * annotates it (OneNote / Word), saves it, sends it back; the next sheet is
 * written from that. Measure names and rubrics mirror mizan/core.js.
 */
const fs = require('fs');
const path = require('path');
const D = require(fs.existsSync(path.join(process.cwd(), 'node_modules/docx'))
  ? path.join(process.cwd(), 'node_modules/docx') : 'docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
        AlignmentType, BorderStyle, ShadingType, HeadingLevel, PageBreak } = D;

const MEASURES = [
  ['Ṣalāh', 'the spine', ['nothing, or one', 'two or three', 'four, or five with slippage', 'all five, each inside its window']],
  ['Dhikr & Qur’ān', 'the ground', ['none', 'under five minutes, distracted', 'five to fifteen, attentive', 'the fixed portion kept, whatever the day did']],
  ['ʿAmal', 'ceaseless action', ['no focused block ran', 'one block', 'two blocks', 'three blocks, or two and the One Thing moved']],
  ['Ẓabt-e-nafs', 'restraint', ['commitment broken, unexamined', 'broken, but the trigger was named honestly', 'held, with no real pressure on it', 'held under genuine pressure, trigger named']],
  ['Ḥifẓ al-intibāh', 'the laghw filter', ['the feed had the first hour', 'fragmented; phone within reach all day', 'sprints were protected', 'first hour protected and phone out of the room']],
  ['Badan', 'the mount', ['none of the four', 'one of the four', 'two of the four', 'three or four of: slept · moved · protein · window held']],
  ['Iḥsān', 'toward people', ['nothing', 'passive kindness — you were pleasant', 'one deliberate act, named', 'an act that cost you time, money or ego']],
];
const P369 = [['Morning', 3], ['Midday', 6], ['Evening', 9]];
const EMBER = 'E0662E', VERDIGRIS = '127A70', INK = '1E1B18', MUTED = '6B655E', LINE = 'D9D3CB', RAISE = 'F6F2EC';
const PAGE_W = 12240 - 2 * 1000;   // US Letter minus 0.69" margins, in DXA

const [inFile, outDir] = process.argv.slice(2);
if (!inFile || !outDir) { console.error('usage: daysheet.js input.json out-dir/'); process.exit(2); }
const IN = JSON.parse(fs.readFileSync(inFile, 'utf8'));
// Phone-synced "all day" items arrive as a midnight-to-midnight dateTime, not a date.
IN.events.forEach(e => { if (e.start === '00:00' && (!e.end || e.end === '00:00')) e.allDay = true; });
const DATE = IN.date;
const DOWN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dt(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); }
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function longDate(k) { const d = dt(k); return DOWN[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
function shortDate(k) { const d = dt(k); return DOWN[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3); }
function addDays(k, n) { const d = dt(k); d.setDate(d.getDate() + n); return iso(d); }
function clean(t) { return String(t || '').replace(/^[\p{Extended_Pictographic}️\s·]+/u, '').trim(); }
function dedupe(list) {
  const seen = new Set();
  return list.filter(e => { const k = e.start + '|' + clean(e.title).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18); if (seen.has(k)) return false; seen.add(k); return true; });
}
const eventsOn = k => dedupe(IN.events.filter(e => e.date === k && !e.allDay).sort((a, b) => a.start.localeCompare(b.start)));
const allDayOn = k => IN.events.filter(e => e.date === k && e.allDay);

/* ---------- primitives ---------- */
const run = (t, o = {}) => new TextRun(Object.assign({ text: t, font: 'Calibri', size: 21, color: INK }, o));
const p = (children, o = {}) => new Paragraph(Object.assign({ children: Array.isArray(children) ? children : [run(children)], spacing: { after: 80 } }, o));
const eyebrow = t => p([run(t.toUpperCase(), { font: 'Consolas', size: 15, color: EMBER, bold: true, characterSpacing: 40 })], { spacing: { before: 260, after: 60 } });
const h1 = t => p([run(t, { font: 'Georgia', size: 44, bold: true })], { spacing: { after: 40 } });
const h2 = t => p([run(t, { font: 'Georgia', size: 28, bold: true })], { spacing: { after: 100 }, heading: HeadingLevel.HEADING_2 });
const tiny = t => p([run(t, { size: 17, color: MUTED, italics: true })], { spacing: { after: 120 } });
const rule = () => new Paragraph({ children: [], spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 1 } } });
const noB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
function cell(children, w, o = {}) {
  const kids = (Array.isArray(children) ? children : [children]).map(c => typeof c === 'string' ? p(c, { spacing: { after: 0 } }) : c);
  return new TableCell(Object.assign({ children: kids, width: { size: w, type: WidthType.DXA },
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    borders: { top: thin, bottom: thin, left: noB, right: noB } }, o));
}
const head = (t, w) => cell(p([run(t, { font: 'Consolas', size: 15, color: MUTED, bold: true })], { spacing: { after: 0 } }), w,
  { shading: { type: ShadingType.CLEAR, fill: RAISE, color: 'auto' } });
function table(widths, rows) {
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows });
}
const row = cells => new TableRow({ children: cells, cantSplit: true });
const box = n => Array.from({ length: n }, () => '☐').join(' ');
const blank = (lines = 1) => Array.from({ length: lines }, () => p([run(' ')], { spacing: { after: 0 }, border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: LINE, space: 4 } } }));

/* ---------- sections ---------- */
const body = [];
body.push(eyebrow('Mīzān · day sheet'));
body.push(h1(longDate(DATE)));
body.push(tiny('Fill it by hand or in OneNote, save it as mizan-' + DATE + '.docx, send it back. The next sheet is written from what you put here. Prayer times: New York, ISNA, ʿAṣr standard — check against your own settings.'));
body.push(rule());

// 1 · intention
body.push(h2('The intention · 3-6-9'));
body.push(p([run('One line. The same line all day.', { color: MUTED, size: 19 })], { spacing: { after: 40 } }));
body.push(...blank(1));
body.push(table([1800, 3200, PAGE_W - 5000], [
  row([head('slot', 1800), head('reps', 3200), head('note', PAGE_W - 5000)]),
  ...P369.map(([k, n]) => row([cell(k, 1800), cell(box(n), 3200), cell(' ', PAGE_W - 5000)])),
]));
body.push(tiny('Personal focus ritual. The popular Tesla attribution has no verified source; this is a constructed practice, not a claim.'));

// 2 · prayer spine
const pr = IN.prayers[DATE] || [];
body.push(h2('Prayer spine'));
body.push(table([1800, 1400, 1800, PAGE_W - 5000], [
  row([head('prayer', 1800), head('enters', 1400), head('in window?', 1800), head('note', PAGE_W - 5000)]),
  ...pr.map(([n, t]) => row([cell(n, 1800), cell(t, 1400), cell('☐ in   ☐ late   ☐ missed', 1800), cell(' ', PAGE_W - 5000)])),
]));

// 3 · the day
const ev = eventsOn(DATE);
const spine = pr.map(([n, t]) => ({ start: t, end: '', title: n, prayer: true }));
const merged = ev.concat(spine).sort((a, b) => a.start.localeCompare(b.start));
body.push(h2('The day'));
body.push(table([1500, 4400, PAGE_W - 5900], [
  row([head('time', 1500), head('block', 4400), head('what actually happened', PAGE_W - 5900)]),
  ...merged.map(e => row([
    cell(p([run(e.start + (e.end ? '–' + e.end : ''), { font: 'Consolas', size: 18, color: e.prayer ? VERDIGRIS : INK })], { spacing: { after: 0 } }), 1500),
    cell(p([run(e.prayer ? e.title + ' — prayer' : clean(e.title), { size: 19, color: e.prayer ? VERDIGRIS : INK, italics: !!e.prayer })], { spacing: { after: 0 } }), 4400),
    cell(' ', PAGE_W - 5900),
  ])),
]));
const fixed = allDayOn(DATE);
if (fixed.length) body.push(p([run('Fixed today: ', { bold: true, size: 19 }), run(fixed.map(e => clean(e.title)).join(' · '), { size: 19 })], { spacing: { before: 80 } }));

// 4 · one thing + training
body.push(h2('One thing'));
body.push(p([run('The single task that makes today count. Named the night before.', { color: MUTED, size: 19 })], { spacing: { after: 40 } }));
body.push(...blank(1));
body.push(p([run('☐ It moved today.', { size: 20 })], { spacing: { before: 60 } }));
const dow = dt(DATE).getDay();
if (IN.gym && IN.gym[dow]) {
  body.push(h2('Training · ' + IN.gym[dow] + ' · 90 min'));
  body.push(p([run('☐ Session happened    ☐ Protein floor    ☐ Slept ≥ 7h    ☐ Moved', { size: 20 })]));
  body.push(p([run('Lifts / notes:', { color: MUTED, size: 19 })], { spacing: { after: 40 } }));
  body.push(...blank(2));
}

// 5 · seven measures
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(eyebrow('Nightly close'));
body.push(h2('The seven measures'));
body.push(tiny('Score 0–3 against the written rubric, not against how the day felt. Ṣalāh and ʿAmal are counted, not judged.'));
body.push(table([2300, 900, PAGE_W - 3200], [
  row([head('measure', 2300), head('0–3', 900), head('rubric · 0 / 1 / 2 / 3', PAGE_W - 3200)]),
  ...MEASURES.map(([n, sub, r]) => row([
    cell([p([run(n, { bold: true, size: 20 })], { spacing: { after: 0 } }), p([run(sub, { size: 16, color: MUTED })], { spacing: { after: 0 } })], 2300),
    cell(p([run(' ', { size: 28 })], { spacing: { after: 0 } }), 900),
    cell(r.map((x, i) => p([run(i + ' ', { font: 'Consolas', size: 15, color: EMBER, bold: true }), run(x, { size: 17 })], { spacing: { after: 0 } })), PAGE_W - 3200),
  ])),
]));

// 6 · muhasaba
body.push(h2('Muḥāsaba'));
for (const [q, hint] of [['One thing to be grateful for', 'Specific. Not “my family.”'], ['One error, named without excuse', 'What you did, not what happened to you.'], ['One correction for tomorrow', 'A single, specific, small change.'], ['Tomorrow’s One Thing', 'Name it now, so the morning has no decision in it.']]) {
  body.push(p([run(q, { bold: true, size: 20 }), run('  ' + hint, { size: 17, color: MUTED, italics: true })], { spacing: { before: 100, after: 40 } }));
  body.push(...blank(2));
}
body.push(p([run('☐ Day closed', { size: 20, bold: true })], { spacing: { before: 120 } }));

// 7 · week ahead
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(eyebrow('Week ahead'));
body.push(h2(shortDate(addDays(DATE, 1)) + ' → ' + shortDate(addDays(DATE, 7))));
const ROUTINE = /3-6-9|Daily brief|Articulation|Health chase|nightly close|APPLY BLOCK|Application block|weekly read/i;
const wk = [];
for (let i = 1; i <= 7; i++) {
  const k = addDays(DATE, i);
  const items = eventsOn(k).filter(e => !ROUTINE.test(e.title)).map(e => e.start + ' ' + clean(e.title));
  const fx = allDayOn(k).map(e => '● ' + clean(e.title));
  const g = [];   // the calendar already carries the Workout events; don't double them
  wk.push(row([
    cell([p([run(shortDate(k), { bold: true, size: 19 })], { spacing: { after: 0 } }), p([run((IN.prayers[k] || []).map(x => x[0].slice(0, 1) + ' ' + x[1]).join('  '), { font: 'Consolas', size: 13, color: VERDIGRIS })], { spacing: { after: 0 } })], 2400),
    cell(fx.concat(g, items).map(t => p([run(t, { size: 18, color: /^●/.test(t) ? EMBER : INK, bold: /^●/.test(t) })], { spacing: { after: 0 } })).concat(items.length + fx.length + g.length ? [] : [p([run('— routine only', { size: 17, color: MUTED })], { spacing: { after: 0 } })]), PAGE_W - 5000),
    cell(' ', 2600),
  ]));
}
body.push(table([2400, PAGE_W - 5000, 2600], [row([head('day · prayer times', 2400), head('fixed · training · blocks (routine hidden)', PAGE_W - 5000), head('notes', 2600)]), ...wk]));
body.push(tiny('Routine daily prompts (3-6-9, brief, drills, apply blocks, nightly close) are hidden here — they are on every day and on the calendar. Only what is different about each day is shown.'));
body.push(rule());
body.push(p([run('Return loop: ', { bold: true, size: 18 }), run('save → send back → Claude reads it, updates the record, writes the next sheet. Mīzān’s own numbers live only in your browser; the Sunday export is how those reach Claude.', { size: 18, color: MUTED })]));

const doc = new Document({
  creator: 'Mīzān', title: 'Mīzān day sheet · ' + DATE,
  styles: { default: { document: { run: { font: 'Calibri', size: 21, color: INK } } } },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } }, children: body }],
});
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'mizan-' + DATE + '.docx');
Packer.toBuffer(doc).then(b => { fs.writeFileSync(out, b); console.log(out); });
