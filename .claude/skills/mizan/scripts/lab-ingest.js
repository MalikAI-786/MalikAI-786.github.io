#!/usr/bin/env node
/**
 * Ingest a Mīzān Lab feedback packet.
 *
 *   node .claude/skills/mizan/scripts/lab-ingest.js <packet.txt|json> <private-dir>
 *
 * <packet> is what a participant sent: the text between MIZAN-LAB-PACKET and
 * END-PACKET (surrounding mail text is tolerated), or the bare JSON.
 * <private-dir> is in the scratchpad — participant data is personal and is
 * NEVER committed. The script:
 *   1. appends the packet to <private-dir>/<pid>/packets.jsonl
 *   2. prints a plain read: adherence per measure, days closed, index trend,
 *      self-placed vs computed stage, every feedback item verbatim
 *   3. writes two DRAFTS, never sent by anything here:
 *        <private-dir>/<pid>/draft-partner-<date>.md   (to the owner)
 *        <private-dir>/<pid>/draft-participant-<date>.md (to the participant)
 *      and a change-log stub <private-dir>/<pid>/log-entry-<date>.html to be
 *      edited by hand into mizan/lab/log/index.html once a decision is made.
 * Nothing here decides what to change in the model. That is a judgment, made
 * in the session, and recorded on the Log with its reason.
 */
const fs = require('fs');
const path = require('path');
const [src, dir] = process.argv.slice(2);
if (!src || !dir) { console.error('usage: lab-ingest.js <packet> <private-dir>'); process.exit(2); }

const raw = fs.readFileSync(src, 'utf8');
const m = raw.match(/MIZAN-LAB-PACKET\s*([\s\S]*?)\s*END-PACKET/);
let pk;
try { pk = JSON.parse((m ? m[1] : raw).trim()); }
catch (e) { console.error('not a packet: ' + e.message); process.exit(1); }
if (pk.edition !== 'lab' || !pk.pid) { console.error('not a lab packet'); process.exit(1); }

const NAMES = { salah: 'Ṣalāh', dhikr: 'Dhikr', amal: 'ʿAmal', zabt: 'Ẓabt', attn: 'Attention', body: 'Badan', ihsan: 'Iḥsān' };
const STAGE = ['Bekhudī', 'Iṭāʿat', 'Ẓabt-e-nafs', 'Niyābat'];
const today = new Date().toISOString().slice(0, 10);
const pdir = path.join(dir, pk.pid);
fs.mkdirSync(pdir, { recursive: true });
fs.appendFileSync(path.join(pdir, 'packets.jsonl'), JSON.stringify({ received: today, packet: pk }) + '\n');

// ---- the read ----
const days = pk.days || [], fb = pk.feedback || [];
const closed = days.filter(d => d.closed).length;
const idx = days.map(d => d.idx).filter(v => v != null);
const per = {};
days.forEach(d => Object.keys(d.scores || {}).forEach(k => { (per[k] = per[k] || []).push(d.scores[k]); }));
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const lines = [];
lines.push(`Participant ${pk.pid} · started ${pk.started} · packet built ${pk.built.slice(0, 10)}`);
lines.push(`Work: ${pk.profile.field}`);
lines.push(`Days with scores: ${days.length} · closed: ${closed} · index first→last: ${idx.length ? idx[0] + '→' + idx[idx.length - 1] : '—'} · mean ${idx.length ? Math.round(mean(idx)) : '—'}`);
lines.push(`Self-placed stage ${pk.profile.stagePlaced} (${STAGE[pk.profile.stagePlaced]}) · computed ${pk.computed.stage} (${STAGE[pk.computed.stage]}) · 14-day median ${pk.computed.median14}`);
const hardest = pk.profile.hardest;
const rank = Object.keys(per).map(k => [k, mean(per[k])]).sort((a, b) => a[1] - b[1]);
lines.push('Mean score per active measure: ' + rank.map(r => `${NAMES[r[0]] || r[0]} ${r[1].toFixed(1)}`).join(' · '));
if (rank.length) lines.push(`Expected hardest: ${NAMES[hardest]} · actually lowest: ${NAMES[rank[0][0]]}${rank[0][0] === hardest ? ' (forecast held)' : ' (forecast missed)'}`);
const fits = days.map(d => d.fit).filter(v => v != null);
lines.push(`Fit ratings: ${fits.length ? fits.join(',') + ' (mean ' + mean(fits).toFixed(1) + '/3)' : 'none'}`);
lines.push('');
lines.push(`Feedback items: ${fb.length}`);
fb.forEach(f => {
  lines.push(`— ${f.date} · about ${f.about}`);
  if (f.worked) lines.push(`   held up: ${f.worked}`);
  if (f.wrong) lines.push(`   wrong:   ${f.wrong}`);
  if (f.change) lines.push(`   change:  ${f.change}`);
});
const read = lines.join('\n');
console.log(read);

// ---- drafts (never sent by this script) ----
const partner = `# DRAFT — to the owner · not sent\n\nSubject: Mīzān Lab · ${pk.pid} · packet of ${today}\n\n${read}\n\n## Proposed decision (fill in)\n- Adopt:\n- Decline, with reason:\n- Needs a second participant before deciding:\n`;
const participant = `# DRAFT — to participant ${pk.pid} · not sent · owner to address and send\n\nSubject: Mīzān Lab — what your packet of ${pk.built.slice(0, 10)} changed\n\nThank you for the packet. Here is what it said, read back to you so you can correct the reading, and what happened to it.\n\n**What the numbers said.** ${days.length} scored days, ${closed} closed. You placed yourself at ${STAGE[pk.profile.stagePlaced]}; the gates computed ${STAGE[pk.computed.stage]}. You expected ${NAMES[hardest]} to be hardest; ${rank.length ? (rank[0][0] === hardest ? 'it was.' : 'the lowest mean was actually ' + NAMES[rank[0][0]] + '.') : 'there are not enough scored days yet to say.'}\n\n**What you said about the model.**\n${fb.map(f => `- ${f.date}, about ${f.about}: ${[f.worked && 'held up — ' + f.worked, f.wrong && 'wrong — ' + f.wrong, f.change && 'change — ' + f.change].filter(Boolean).join('; ')}`).join('\n') || '- (no feedback text in this packet)'}\n\n**What changed because of it.** (fill in — one line per adopted item, with the commit)\n\n**What was not adopted, and why.** (fill in)\n\nThe public record of this is on the Log page, under your code ${pk.pid}. Nothing there names you.\n`;
const logStub = `    <div class="phase" style="margin-bottom:12px">\n      <div class="d">${today} · ${pk.pid} · <span class="mono">commit —</span></div>\n      <h4>(what changed, in one sentence)</h4>\n      <ul>\n${fb.map(f => `        <li><b>${f.about}</b> — ${(f.wrong || f.change || f.worked || '').replace(/</g, '&lt;')} → <em>adopted / declined because …</em></li>`).join('\n')}\n      </ul>\n    </div>\n`;
fs.writeFileSync(path.join(pdir, `draft-partner-${today}.md`), partner);
fs.writeFileSync(path.join(pdir, `draft-participant-${today}.md`), participant);
fs.writeFileSync(path.join(pdir, `log-entry-${today}.html`), logStub);
console.log(`\nwrote drafts to ${pdir} (nothing sent)`);
