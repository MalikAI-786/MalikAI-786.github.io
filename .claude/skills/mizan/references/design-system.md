# Mīzān design system

The identity is a **calibration instrument**: hairline rules, mono labels,
measurement against a reference line. It inherits from the owner's main site
and adds a second voice — a warmer serif/gold register for the Qur'anic
material, so scripture and scoring never look like the same kind of claim.

## Tokens

Dark is the default; `:root[data-theme="light"]` supplies a warm parchment
palette. The toggle reads `data-theme` with `'dark'` as the assumed default —
there is no `prefers-color-scheme` block, which is deliberate, and the toggle
must not try to infer the OS preference (that bug shipped once: on a
light-preferring OS the first click did nothing).

| Token | Role |
|---|---|
| `--ground` `--surface` `--raise` `--sunk` | Backgrounds, receding to advancing |
| `--ink` `--muted` `--faint` | Text, three levels |
| `--line` `--line2` | Hairlines; `line2` for interactive borders |
| `--accent` `--accent2` `--accent-wash` | Teal. Structure, actions, "in" states |
| `--gold` `--gold-wash` | Qur'anic register, current phase, skill blocks |
| `--signal` `--bad` `--good` | Warning / failure / pass |
| `--display` `--read` `--mono` `--arabic` | Type stacks; all system fonts, no webfonts |

Colour carries meaning: teal = the instrument, gold = the text and the
present, red = a real failure, green = a met standard. Do not use gold for
emphasis on non-scriptural content — it dilutes the one signal that is doing
semantic work.

## Components

`.card` / `.card.flat` · `.eyebrow` (+`.gold`) · `.tag` · `.lede` ·
`.small` / `.tiny` · `.ayah` (Arabic + translation + `.ref`) · `.iq` (Iqbal:
Urdu + roman + translation + `.ref`) · `.measure` (row + `.seg` control) ·
`.seg` (0–3 selector; `.on.s0` red, `.on.s1` amber) · `.stat` / `.stat-row` ·
`.kv` (dotted key/value) · `.pill` · `.notice` (+`.gold` / `.teal`) ·
`.chartbox` · `.rung` · `.phase` · `.chk` · `.btn` (+`.primary` / `.gold` /
`.danger`) · `table.t`.

Grid helpers `.g2 .g3 .g4 .g-2-1 .g-1-2` all collapse to one column at 900 px.

## Charts

Hand-rolled SVG against a fixed `viewBox`, no library. Conventions:

- **Never** `preserveAspectRatio="none"` on an SVG containing text. It shears
  labels on narrow viewports. The day spine originally had this and the
  labels were unreadable on a phone; it now scales proportionally with
  `width:100%; height:auto`.
- Fixed `viewBox` widths in use: 640 for trend charts, 1000 for the day
  spine, 400 for the ratio bar. Keep to these so padding constants stay
  comparable.
- Always render a legible empty state. This page is usually opened by someone
  with almost no data, and an empty chart that looks broken reads as a bug.
- Gaps in a series break the polyline into segments rather than interpolating
  across them. A missing day is missing, not a straight line — the whole page
  distinguishes *no evidence* from *bad evidence* and the charts must too.
- Colour by meaning, not by series index: red for a session or a deficit,
  gold for the rolling median and the reference line, teal for the primary
  series, green for a surplus.
- Time-scaled x-axes where the data is irregular (the measurement index has
  multi-year gaps and they should stay visible).
- Diagrams that carry an argument (the khudī force diagram) are drawn in JS
  rather than written as static markup, so they can read live state — that one
  marks the owner's currently computed stage. Use `var(--…)` tokens for every
  fill and stroke so the diagram follows the theme.

## Copy

Mono uppercase micro-labels; sentence case everywhere else. Em dashes for
asides. Bold for the sentence a reader would highlight — roughly one per
paragraph, never a run of bolded fragments.

The register is an examiner's memo, not a wellness app: it concedes the true
part of the other side before making its own argument, names the specific
failure mode rather than the generic one, and puts the number before the
exhortation. Every explanatory note should tell the reader *why*, because the
page's whole claim is that declared reasoning beats hidden judgment.

## Responsive

Test at 390 px, on **every** page. Nothing may scroll horizontally — wide
tables and charts scroll inside their own container. Below 760 px a `table.t`
directly inside a card becomes `display:block; overflow-x:auto`. Do not add
`white-space:nowrap` to table headers: it was added once for tidiness and
pushed the khudī page 188 px wide on a phone. The smoke test asserts all of
this per page.
