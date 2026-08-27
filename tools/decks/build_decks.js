#!/usr/bin/env node
/*
 * Two reusable deck templates, generated — never hand-drawn.
 *
 * 1. fiu-dba-deck.pptx           — the deck he is always making for the FIU
 *    DBA: his geometry, FIU's colours (the same rule the FIU email signature
 *    already follows — FIU Blue and Gold instead of ember).
 * 2. audit-the-algorithm-deck.pptx — the advisory practice deck, in the
 *    Reference Mark identity: ember, warm graphite, warm paper.
 *
 * Both close on a colophon that discloses AI assistance in one quiet line —
 * deliberately readable, deliberately not a watermark.
 *
 * Fonts are limited to the metric-safe set (Cambria / Calibri / Courier New)
 * so what renders in QA is what PowerPoint ships.
 *
 * Usage:  node tools/decks/build_decks.js <mark-asset-dir> <out-dir>
 *   mark-asset-dir must hold: mark-fiu-on-dark.png, mark-fiu-on-light.png,
 *   mark-ember-on-dark.png, mark-ember-on-light.png (640px rasters of the
 *   repo's SVG marks).
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const [assetDir, outDir] = process.argv.slice(2);
if (!assetDir || !outDir) {
  console.error("usage: build_decks.js <mark-asset-dir> <out-dir>");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------- palettes
// Mirrors assets/brand/palette.py / tokens.css. Ember never carries body
// text on a light ground; AD4317 does. Same discipline as the site.
const EMBER = {
  ground: "F6F3F0", surface: "FFFFFF", ink: "171A1D", muted: "5A646E",
  line: "E2DAD3", accent: "E0662E", accentInk: "AD4317",
  dark: "171A1D", darkInk: "EDEFF1", darkMuted: "A6B0BA", darkLine: "263039",
  verd: "0F5F5A",
};
// FIU Blue / Gold — gold on white is 2.95:1, so text-gold is the darkened
// 8A6320 the FIU signature already uses; raw gold is for rules and marks.
const FIU = {
  ground: "FFFFFF", surface: "F6F8FB", ink: "081E3F", muted: "5A646E",
  line: "D5DDE8", accent: "B6862C", accentInk: "8A6320",
  dark: "081E3F", darkInk: "FFFFFF", darkMuted: "AFC0D8", darkLine: "1D3A66",
  verd: "0F5F5A",
};

const SERIF = "Cambria", SANS = "Calibri", MONO = "Courier New";
const W = 13.33, H = 7.5, M = 0.75; // LAYOUT_WIDE, margin

const DISCLOSURE =
  "Prepared with AI-assisted drafting and analysis. All judgment, synthesis, and interpretation are the author's.";

// ------------------------------------------------------------- primitives
function tick(slide, x, y, color) {
  // the reference-mark motif: a short measure tick before every eyebrow
  slide.addShape("line", { x, y: y + 0.09, w: 0.22, h: 0, line: { color, width: 1.6 } });
}
function eyebrow(slide, text, P, opts = {}) {
  const x = opts.x ?? M, y = opts.y ?? 0.62;
  const color = opts.color ?? P.accentInk;
  tick(slide, x, y, opts.tickColor ?? P.accent);
  slide.addText(text.toUpperCase(), {
    x: x + 0.32, y: y - 0.08, w: opts.w ?? 7, h: 0.32, margin: 0, isTextBox: true,
    fontFace: MONO, fontSize: 10.5, charSpacing: 3, color,
  });
}
function footer(slide, P, n, label, onDark = false) {
  const c = onDark ? P.darkMuted : P.muted;
  slide.addText(label, {
    x: M, y: H - 0.52, w: 6, h: 0.3, margin: 0, isTextBox: true,
    fontFace: MONO, fontSize: 8.5, charSpacing: 2, color: c,
  });
  slide.addText(String(n).padStart(2, "0"), {
    x: W - M - 0.8, y: H - 0.52, w: 0.8, h: 0.3, margin: 0, isTextBox: true,
    align: "right", fontFace: MONO, fontSize: 8.5, charSpacing: 2, color: c,
  });
}

// --------------------------------------------------------------- builders
function buildDeck(cfg) {
  const P = cfg.palette;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Yasir A. Malik";
  pres.title = cfg.title;

  const FOOT = cfg.footerLabel;

  // ---- 1 · title: dark ground, mark, statement serif
  {
    const s = pres.addSlide();
    s.background = { color: P.dark };
    s.addImage({ path: path.join(assetDir, cfg.markDark), x: M, y: 0.85, w: 0.92, h: 0.92 });
    eyebrow(s, cfg.strapline, P, { x: M, y: 2.18, color: cfg.straplineColorDark ?? P.accent, tickColor: P.accent, w: 9 });
    s.addText(cfg.titleLine, {
      x: M, y: 2.5, w: 10.6, h: 2.3, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 46, bold: true, color: P.darkInk, lineSpacingMultiple: 1.05,
    });
    s.addText(cfg.subtitle, {
      x: M, y: 4.85, w: 9.4, h: 0.9, margin: 0, isTextBox: true,
      fontFace: SANS, fontSize: 15, color: P.darkMuted, lineSpacingMultiple: 1.25,
    });
    s.addText(cfg.byline, {
      x: M, y: 6.35, w: 11, h: 0.35, margin: 0, isTextBox: true,
      fontFace: MONO, fontSize: 10.5, charSpacing: 2.5, color: P.darkMuted,
    });
    s.addNotes("Title slide. Swap the title, keep the structure: mark top-left, strapline, statement, byline.");
  }

  // ---- 2 · agenda: numbered mono, generous air
  {
    const s = pres.addSlide();
    s.background = { color: P.ground };
    eyebrow(s, "Agenda", P);
    s.addText("What this covers.", {
      x: M, y: 1.0, w: 8, h: 0.8, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 30, bold: true, color: P.ink,
    });
    cfg.agenda.forEach((item, i) => {
      const y = 2.15 + i * 0.98;
      s.addText(String(i + 1).padStart(2, "0"), {
        x: M, y, w: 0.6, h: 0.4, margin: 0, isTextBox: true,
        fontFace: MONO, fontSize: 12, color: P.accentInk, charSpacing: 2,
      });
      s.addText(item[0], {
        x: M + 0.75, y: y - 0.04, w: 5.4, h: 0.45, margin: 0, isTextBox: true,
        fontFace: SERIF, fontSize: 17, bold: true, color: P.ink, valign: "top",
      });
      s.addText(item[1], {
        x: 7.2, y: y - 0.04, w: 5.3, h: 0.75, margin: 0, isTextBox: true, valign: "top",
        fontFace: SANS, fontSize: 11.5, color: P.muted, lineSpacingMultiple: 1.2,
      });
    });
    footer(s, P, 2, FOOT);
    s.addNotes("Rename the sections; five is the ceiling, three is better.");
  }

  // ---- 3 · statement + support: the hook slide
  {
    const s = pres.addSlide();
    s.background = { color: P.ground };
    eyebrow(s, cfg.hookEyebrow, P);
    s.addText(cfg.hook, {
      x: M, y: 1.55, w: 7.3, h: 3.4, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 32, bold: true, color: P.ink, lineSpacingMultiple: 1.12, valign: "top",
    });
    s.addShape("roundRect", {
      x: 8.55, y: 1.55, w: 4.0, h: 4.5, rectRadius: 0.08,
      fill: { color: P.surface }, line: { color: P.line, width: 1 },
      shadow: { type: "outer", color: "171A1D", opacity: 0.18, blur: 12, offset: 3, angle: 90 },
    });
    s.addText(cfg.hookSideLabel.toUpperCase(), {
      x: 8.9, y: 1.95, w: 3.3, h: 0.3, margin: 0, isTextBox: true,
      fontFace: MONO, fontSize: 9.5, charSpacing: 2.5, color: P.accentInk,
    });
    s.addText(cfg.hookSide, {
      x: 8.9, y: 2.4, w: 3.3, h: 3.3, margin: 0, isTextBox: true, valign: "top",
      fontFace: SANS, fontSize: 12.5, color: P.ink, lineSpacingMultiple: 1.35,
    });
    footer(s, P, 3, FOOT);
    s.addNotes("One argument per slide. The card carries the supporting evidence, not a second argument.");
  }

  // ---- 4 · evidence: three stat tiles
  {
    const s = pres.addSlide();
    s.background = { color: P.ground };
    eyebrow(s, "Evidence", P);
    s.addText(cfg.statsTitle, {
      x: M, y: 1.0, w: 9, h: 0.8, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 30, bold: true, color: P.ink,
    });
    const tw = (W - 2 * M - 0.8) / 3;
    cfg.stats.forEach((st, i) => {
      const x = M + i * (tw + 0.4);
      s.addShape("roundRect", {
        x, y: 2.3, w: tw, h: 3.3, rectRadius: 0.08,
        fill: { color: P.surface }, line: { color: P.line, width: 1 },
        shadow: { type: "outer", color: "171A1D", opacity: 0.15, blur: 10, offset: 2, angle: 90 },
      });
      s.addText(st.label.toUpperCase(), {
        x: x + 0.35, y: 2.75, w: tw - 0.7, h: 0.3, margin: 0, isTextBox: true,
        fontFace: MONO, fontSize: 9.5, charSpacing: 2.5, color: P.accentInk,
      });
      s.addText(st.value, {
        x: x + 0.35, y: 3.15, w: tw - 0.7, h: 1.15, margin: 0, isTextBox: true,
        fontFace: SERIF, fontSize: 54, bold: true, color: P.ink, valign: "top",
      });
      s.addText(st.desc, {
        x: x + 0.35, y: 4.45, w: tw - 0.7, h: 0.95, margin: 0, isTextBox: true, valign: "top",
        fontFace: SANS, fontSize: 11.5, color: P.muted, lineSpacingMultiple: 1.25,
      });
    });
    s.addText(cfg.statsNote, {
      x: M, y: 6.0, w: 11.8, h: 0.4, margin: 0, isTextBox: true,
      fontFace: SANS, fontSize: 10.5, italic: true, color: P.muted,
    });
    footer(s, P, 4, FOOT);
    s.addNotes("Numbers only where a source exists. If a number has no source, it does not go on the slide.");
  }

  // ---- 5 · framework: numbered steps across
  {
    const s = pres.addSlide();
    s.background = { color: P.ground };
    eyebrow(s, "Method", P);
    s.addText(cfg.stepsTitle, {
      x: M, y: 1.0, w: 10, h: 0.8, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 30, bold: true, color: P.ink,
    });
    const sw = (W - 2 * M - 3 * 0.35) / 4;
    cfg.steps.forEach((st, i) => {
      const x = M + i * (sw + 0.35);
      s.addShape("roundRect", {
        x, y: 2.35, w: sw, h: 3.4, rectRadius: 0.08,
        fill: { color: P.surface }, line: { color: P.line, width: 1 },
      });
      s.addShape("ellipse", {
        x: x + 0.3, y: 2.7, w: 0.52, h: 0.52,
        fill: { color: i === cfg.steps.length - 1 ? P.accent : P.dark },
      });
      s.addText(String(i + 1), {
        x: x + 0.3, y: 2.7, w: 0.52, h: 0.52, margin: 0, isTextBox: true,
        align: "center", valign: "middle", fontFace: MONO, fontSize: 14, bold: true, color: "FFFFFF",
      });
      s.addText(st[0], {
        x: x + 0.3, y: 3.45, w: sw - 0.6, h: 0.6, margin: 0, isTextBox: true,
        fontFace: SERIF, fontSize: 14.5, bold: true, color: P.ink, lineSpacingMultiple: 1.05, valign: "top",
      });
      s.addText(st[1], {
        x: x + 0.3, y: 4.05, w: sw - 0.6, h: 1.25, margin: 0, isTextBox: true, valign: "top",
        fontFace: SANS, fontSize: 10.5, color: P.muted, lineSpacingMultiple: 1.25,
      });
    });
    footer(s, P, 5, FOOT);
    s.addNotes("A sequence, not a cycle: audits end. Recolour nothing — the last node carries the accent because that is where judgment happens.");
  }

  // ---- 6 · the record: who is presenting (credibility, quiet)
  {
    const s = pres.addSlide();
    s.background = { color: P.ground };
    eyebrow(s, "The record", P);
    s.addText("Grounded in work already done.", {
      x: M, y: 1.0, w: 10, h: 0.8, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 30, bold: true, color: P.ink,
    });
    cfg.record.forEach((r, i) => {
      const y = 2.2 + i * 1.08;
      s.addText(r[0].toUpperCase(), {
        x: M, y: y + 0.05, w: 2.4, h: 0.3, margin: 0, isTextBox: true, valign: "top",
        fontFace: MONO, fontSize: 9.5, charSpacing: 2.5, color: P.accentInk,
      });
      s.addText(r[1], {
        x: 3.3, y, w: 9.2, h: 0.5, margin: 0, isTextBox: true, valign: "top",
        fontFace: SANS, fontSize: 14, color: P.ink,
      });
      if (i < cfg.record.length - 1)
        s.addShape("line", { x: M, y: y + 0.82, w: W - 2 * M, h: 0, line: { color: P.line, width: 0.75 } });
    });
    footer(s, P, 6, FOOT);
    s.addNotes("Four rows, never more. Each one verifiable.");
  }

  // ---- 7 · close: dark ground, links, quiet colophon with the AI disclosure
  {
    const s = pres.addSlide();
    s.background = { color: P.dark };
    s.addImage({ path: path.join(assetDir, cfg.markDark), x: M, y: 0.85, w: 0.8, h: 0.8 });
    s.addText(cfg.closeLine, {
      x: M, y: 2.1, w: 10.5, h: 1.7, margin: 0, isTextBox: true,
      fontFace: SERIF, fontSize: 38, bold: true, color: P.darkInk, lineSpacingMultiple: 1.08,
    });
    cfg.links.forEach((lk, i) => {
      const y = 4.15 + i * 0.46;
      s.addText(lk[0].toUpperCase(), {
        x: M, y, w: 1.7, h: 0.32, margin: 0, isTextBox: true,
        fontFace: MONO, fontSize: 9.5, charSpacing: 2.5, color: cfg.straplineColorDark ?? P.accent,
      });
      s.addText(lk[1], {
        x: 2.55, y: y - 0.02, w: 9.5, h: 0.36, margin: 0, isTextBox: true,
        fontFace: MONO, fontSize: 11.5, color: P.darkInk,
        hyperlink: lk[2] ? { url: lk[2] } : undefined,
      });
    });
    s.addShape("line", { x: M, y: 6.55, w: W - 2 * M, h: 0, line: { color: P.darkLine, width: 0.75 } });
    s.addText(DISCLOSURE, {
      x: M, y: 6.72, w: W - 2 * M, h: 0.35, margin: 0, isTextBox: true,
      fontFace: SANS, fontSize: 9.5, italic: true, color: P.darkMuted,
    });
    s.addNotes("The colophon stays. It is the disclosure — one honest line, not a watermark.");
  }

  return pres;
}

// ---------------------------------------------------------------- content
const COMMON_LINKS_TAIL = [
  ["Email", "YasirAMalik@gmail.com", "mailto:YasirAMalik@gmail.com"],
  ["Site", "malikai-786.github.io", "https://malikai-786.github.io"],
  ["LinkedIn", "linkedin.com/in/yasiramalik", "https://linkedin.com/in/yasiramalik"],
];

const FIU_DECK = {
  palette: FIU,
  markDark: "mark-fiu-on-dark.png",
  markLight: "mark-fiu-on-light.png",
  straplineColorDark: "B6862C",
  title: "FIU DBA — Yasir A. Malik",
  footerLabel: "YASIR A. MALIK · FIU DBA · COHORT 8.14",
  strapline: "Doctorate in Business Administration · Cohort 8.14",
  titleLine: "Presentation title goes here.",
  subtitle:
    "One sentence on what this session argues — written as a claim someone could disagree with, not a topic.",
  byline: "YASIR A. MALIK  ·  FLORIDA INTERNATIONAL UNIVERSITY  ·  DATE",
  agenda: [
    ["The question", "What is being asked, and why it is worth a room's time."],
    ["The evidence", "What the data actually shows, sourced."],
    ["The method", "How the analysis was built, step by step."],
    ["The argument", "The claim, and the strongest case against it."],
    ["Discussion", "Where the room pushes back."],
  ],
  hookEyebrow: "The question",
  hook: "State the one claim this presentation defends.",
  hookSideLabel: "Why it matters",
  hookSide:
    "Two or three sentences on the stakes. Who is affected, what changes if the claim holds, and what it costs if it doesn't.",
  statsTitle: "Three numbers that carry the argument.",
  stats: [
    { label: "Measure one", value: "00%", desc: "What it measures and where it comes from." },
    { label: "Measure two", value: "0.00", desc: "What it measures and where it comes from." },
    { label: "Measure three", value: "0×", desc: "What it measures and where it comes from." },
  ],
  statsNote: "Every number on this slide needs a source in the notes. No source, no slide.",
  stepsTitle: "The method, in four steps.",
  steps: [
    ["Frame", "Define the construct and what would falsify it."],
    ["Collect", "Instrument, sample, and the limits of both."],
    ["Analyze", "The model, and the assumptions it leans on."],
    ["Judge", "What the result licenses you to claim — and no more."],
  ],
  record: [
    ["Regulator", "Safety-and-soundness examination — Florida Office of Financial Regulation"],
    ["Operator", "Fifteen years in audit and risk — Citigroup, JPMorgan Chase, to Vice President"],
    ["Builder", "Production AI shipped into a live audit function"],
    ["Researcher", "DBA candidate, Florida International University — expected 2028"],
  ],
  closeLine: "Discussion.",
  links: [
    ["FIU DBA", "business.fiu.edu/academics/graduate/doctor-of-business-administration",
      "https://business.fiu.edu/academics/graduate/doctor-of-business-administration/"],
    ...COMMON_LINKS_TAIL,
  ],
};

const ATA_DECK = {
  palette: EMBER,
  markDark: "mark-ember-on-dark.png",
  markLight: "mark-ember-on-light.png",
  title: "Audit the Algorithm — Yasir A. Malik",
  footerLabel: "AUDIT THE ALGORITHM · YASIR A. MALIK",
  strapline: "Audit · Risk · Governance",
  titleLine: "Audit the Algorithm.",
  subtitle:
    "Governance-first AI advisory for regulated organizations. Five offers, each grounded in work already done rather than a capability claimed.",
  byline: "YASIR A. MALIK  ·  ADVISORY PRACTICE  ·  DATE",
  agenda: [
    ["The problem", "AI arrives already confident — and review quietly stops."],
    ["The evidence", "What twenty years of audit work says about deference."],
    ["The method", "NIST AI RMF and SR 26-2, applied — not recited."],
    ["The offers", "Five engagements, each already done once."],
    ["Discussion", "Your AI use, your examiners, your questions."],
  ],
  hookEyebrow: "The problem",
  hook: "The most dangerous number in the room is the one nobody questions.",
  hookSideLabel: "The mechanism",
  hookSide:
    "A system tuned on human approval agrees with the position you already hold — and it is most agreeable exactly where a reviewer most needs pushback.",
  statsTitle: "The record, in numbers.",
  stats: [
    { label: "Cycle time", value: "35%", desc: "Reduction after shipping a retrieval assistant into a live audit function." },
    { label: "Years in audit & risk", value: "20", desc: "Regulator's seat, then Citigroup and JPMorgan Chase to Vice President." },
    { label: "Doctoral focus", value: "1", desc: "Question: does the reviewer still review when the analysis arrives formed?" },
  ],
  statsNote: "Sources: the record at malikai-786.github.io — every claim verifiable there.",
  stepsTitle: "How an engagement runs.",
  steps: [
    ["Inventory", "What AI is actually in use, including the unofficial."],
    ["Map", "Against NIST AI RMF and SR 26-2 — gaps, not vibes."],
    ["Design", "Human-oversight points where deference is likeliest."],
    ["Evidence", "The trail an examiner will actually ask for."],
  ],
  record: [
    ["Regulator", "Safety-and-soundness examination — Florida Office of Financial Regulation"],
    ["Operator", "Fifteen years in audit and risk — Citigroup, JPMorgan Chase, to Vice President"],
    ["Builder", "Production AI shipped into a live audit function"],
    ["Researcher", "DBA candidate, Florida International University — expected 2028"],
  ],
  closeLine: "Let's talk.",
  links: [
    ["Brief", "malikai-786.github.io/governance", "https://malikai-786.github.io/governance.html"],
    ...COMMON_LINKS_TAIL,
    ["Newsletter", "proofoverpromise.substack.com", "https://proofoverpromise.substack.com"],
  ],
};

// ------------------------------------------------------------------ write
(async () => {
  for (const [cfg, name] of [
    [FIU_DECK, "fiu-dba-deck.pptx"],
    [ATA_DECK, "audit-the-algorithm-deck.pptx"],
  ]) {
    const pres = buildDeck(cfg);
    const out = path.join(outDir, name);
    await pres.writeFile({ fileName: out });
    console.log("wrote", out);
  }
})();
