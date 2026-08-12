---
name: mizan
description: >-
  Extend, audit, or debug Mīzān — the private self-audit instrument at
  mizan/index.html in this repo, which scores seven Qur'anic measures against
  Iqbal's Khudī ladder and carries a prayer-time engine, an intoxicant ledger,
  an attention module, the Badan training/food module, the Best-50 standards
  and the self-calibration charts. Use this skill whenever work touches
  mizan/index.html, and whenever a request mentions Mīzān, khudī, the seven
  measures, the Khudī index or ladder, muḥāsaba, the arbaʿīn / 40-day path,
  prayer-time or qibla calculation, the Badan or Best-50 module, the intoxicant
  or urge ledger, forecast-vs-actual calibration, or adding or changing a
  measure, rubric, weight, phase, chart, module or citation on that page —
  including when it is phrased loosely as "add a section", "track X too",
  "make the dashboard show Y", "score my Z" or "enhance this" without naming
  the file. The page has a versioned local-storage contract, computed scores
  that phase-gating silently depends on, and a citation-provenance rule; all
  three are easy to break without any visible error.
---

# Mīzān — extending the instrument

## What this is, and why it is built the way it is

`mizan/index.html` is a single self-contained page that turns the owner's
professional method — audit, measurement, deviation from a reference line —
inward. It is not a habit tracker. A habit tracker measures compliance; this
measures whether a control is **designed** correctly and **operates**
effectively, which is a harder and more useful question.

Everything below exists because the page has three properties that are easy to
destroy by accident: it holds real personal data, it makes religious claims
that must be verifiable, and its scores are partly computed rather than
entered. Read the invariants before writing code.

## Invariants — breaking any of these is a defect, not a style choice

**No network. Ever.** No CDN, no font URL, no fetch, no analytics, no
telemetry, no external image. Prayer times are computed from solar geometry in
JS precisely so the page needs nothing. If a feature seems to require a
network call, it is the wrong feature. The page must work offline, from
`file://`, on a plane.

**No personal data in the repo.** This repository is public. Body
measurements, weight, prayer records, session logs and ledger entries live in
`localStorage` only, and reach the page through the existing JSON import.
Never hard-code the owner's health or behavioural data into the file, not even
as a "sample". Synthetic demo data must be generated at runtime and tagged
`synthetic: true`.

**Synthetic data is quarantined.** Anything tagged `synthetic: true` is
excluded from streaks and from the calibration statistics, because those are
the two numbers that would become lies. It *is* included in charts and the
ladder, so the page looks alive before real history exists. Preserve that
split when adding any new statistic: ask whether the number is a *claim about
the owner* (exclude synthetic) or a *demonstration of the display* (include).

**`<meta name="robots" content="noindex, nofollow">` stays**, and the page
stays unlinked from the site's `index.html` unless the owner asks otherwise.

**Single file.** All CSS and JS are inline, in one `<script>` IIFE. Do not
split it into modules or add a build step. Portability is the point — the
owner can save the file and it still works.

## Architecture

One IIFE, in this order: helpers → measure/constant tables → state
(`load`/`save`/`day`) → prayer-time astronomy → scoring → ladder → ledger
analytics → `render*` functions → event delegation → Badan module → boot.

`renderAll()` is the single entry point; every mutation calls `touch()`, which
is `save()` + `renderAll()`. There is no diffing and no framework — full
re-render on every change is correct here because the page is small and the
immediacy is a deliberate accommodation (see "Immediate feedback" in the
Attention section: a delayed loop does not work on this wiring).

Function declarations are hoisted within the IIFE, so `renderPrayers` may call
`isGymDay` even though the Badan block is defined lower. Keep it that way
rather than reordering — but do not rely on hoisting for `var` values.

## Before changing state, read the contract

`references/state-schema.md` documents every field, who writes it, and which
computations read it. Read it before adding a field. The most common way to
break this page is to add a per-day field and forget to normalise it in
`day(k)`, which throws only for users whose stored history predates the
change.

## Adding a measure

Measures are the spine. Adding one touches six places, and missing any of them
fails silently rather than loudly:

1. `MEASURES[]` — id, name, Arabic, `sub`, `fac` (which faculty), `cite`,
   `why`, and a four-entry `rubric` array. `auto: true` if computed.
2. `DEFW` — a weight. Weights must be declared, not smuggled; if you add one,
   reduce another, and say so in the Weighting note.
3. `FACULTY` — assign it to `yaqin`, `amal` or `ishq`. If the assignment is
   not obvious, explain the reasoning in the Three Faculties card; the
   `zabt → ishq` mapping has a written justification precisely because it
   looks wrong at first glance.
4. `PHASES[].ms` — decide which of the four phases switches it on. A measure
   that is on from day one had better be one of the three the owner can
   actually hold in week one.
5. `scoreOf()` — add a branch only if computed.
6. A rubric with **four written definitions**. A 0–3 scale without definitions
   is a mood ring, and the page says so out loud. If you cannot write four
   distinguishable definitions, the thing you are measuring is not yet a
   measure.

Phase-gating is the subtle part: `indexOf()` normalises over *active* measures
only, so adding a measure to an early phase silently changes every historical
index for days in that phase. That is usually acceptable, but say it in the
commit message.

## Adding a module (a new section)

Follow the Badan module as the worked example — it is the most recent and the
best-shaped. A module is: a `<section id="...">` with a `sec-head`, a nav
link, a `render<Name>()` called from `renderAll()`, its own state under
`S.<name>` or per-day fields, and event handling via the existing delegated
`click`/`change` listeners rather than new per-element bindings.

A module earns its place if it answers a question the owner cannot answer
today, from data they will actually log. The Badan "Effect on output" panel is
the model: it settles an argument with a measured difference rather than an
exhortation. Prefer one panel like that over five panels of restated inputs.

## The scoring contract

Scores are 0–3. The index is a weighted percentage over *active* measures.
Computed measures (`salah`, `amal`, `body`) must never become
self-assessments — their whole value is that they cannot be talked up at
eleven at night. If you add a computed measure, its inputs must be things the
owner logs for another reason.

Ladder stages are a maturity rating over a rolling 14-day window, with
published gates and **downward revision**. Do not add a stage that cannot be
lost. Do not gate the ladder on streaks — the page promises "no streak shame"
and means it, because an honestly logged relapse is worth more than a fictional
clean run.

## Citations and provenance — the part that matters most

The owner's field is epistemic integrity: how confident claims outrun their
evidence. A page that cites the Qur'an loosely would fail its own thesis.

- Every Qur'anic claim carries `sūrah:āyah` so it can be checked against a
  muṣḥaf. No exceptions, including in body prose.
- English renderings are working translations. Where a rendering carries
  interpretive weight, the reference must be adjacent so the reader can go
  behind it.
- Ḥadīth get a collection name. Iqbal quotations get a collection only where
  the attribution is established — `Bāl-e-Jibrīl` for the two couplets on the
  ladder, `Asrār-i-Khudī` for the three-stage structure. Anything from
  *The Reconstruction of Religious Thought in Islam* is **paraphrase, labelled
  as paraphrase**, never quotation.
- Constructed material — rubrics, weights, thresholds, phase design, the
  Best-50 ladders — is declared as constructed and carrying no authority
  beyond its usefulness. Keep the Provenance card honest as the page grows;
  if you add a claim type it does not cover, extend the card.
- Empirical claims about sleep, cannabis or attention are stated as the
  direction of the literature, without fabricated citations, and flagged as
  prompts to verify.

`references/citations.md` is the register of every citation currently on the
page. Add to it when you add one; check it before re-quoting something.

Arabic: use font-safe text. The verse-separator glyph ۝ renders as tofu on
many systems and was replaced with a gold ◆ ornament for exactly that reason —
do not reintroduce it.

## Charts

All SVG is hand-rolled against a fixed `viewBox`; there is no chart library and
there must not be one (see: no network). Conventions live in
`references/design-system.md`. Two rules worth stating here: never use
`preserveAspectRatio="none"` on anything containing text — it shears the
labels on narrow viewports, which is how the day-spine bug happened — and
always render a legible empty state, because this page is most often opened by
someone who has almost no data yet.

## Verify before you commit

`scripts/smoke.js` drives the page in headless Chromium, exercises the main
interactions, and fails on any console error, page error, or horizontal
overflow at 390 px. Run it after any change:

```bash
node .claude/skills/mizan/scripts/smoke.js
```

It also prints the computed prayer times. **Sanity-check them against the
container's timezone**, which is usually UTC while the owner is in America/
New_York — times that look four or five hours late are almost certainly
correct, and this has been mistaken for a bug more than once. To test a real
local-time scenario, set `TZ=America/New_York`.

Beyond the smoke test, exercise the specific thing you changed and say in your
report what you actually ran. A change to scoring should be verified by
setting scores and reading the index, not by the page merely loading.

## Voice

Direct, specific, unsentimental; the register of a good examiner's memo rather
than a wellness app. It states uncomfortable things plainly and without
moralising, concedes what is true on the other side of an argument before
making its own, and never uses encouragement as a substitute for a number. Two
patterns to preserve: name the failure mode the owner is *actually* likely to
hit rather than the generic one, and put the argument-settling number in front
of the exhortation. If a paragraph could appear unchanged in any self-help
product, it does not belong on this page.

## Reference files

- `references/state-schema.md` — the full localStorage contract, field by
  field. Read before touching state.
- `references/citations.md` — every citation on the page, with reference and
  provenance class.
- `references/design-system.md` — tokens, component classes, chart and SVG
  conventions.
