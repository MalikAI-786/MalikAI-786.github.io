# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The personal site of Yasir A. Malik (audit, risk, AI governance), served by GitHub
Pages at https://malikai-786.github.io/ straight from the `main` branch. There is
no build step, no package manager, no test suite, and no framework. The files in
the repository are the files the browser receives.

`.nojekyll` is present on purpose — it stops Pages from running the files through
Jekyll, so `assets/brand/` directories beginning with `_` or containing raw HTML
are served untouched.

## Commands

```bash
# Preview locally — relative asset paths need a server, file:// will not do
python3 -m http.server 8000        # then open http://localhost:8000/

# Regenerate the brand assets (needs cairosvg + its cairo system library)
python3 assets/brand/make_marks.py     # run FIRST — emits the SVG family
python3 assets/brand/make_banners.py   # imports make_marks, rasterises banners
python3 assets/brand/make_card.py      # imports make_marks, emits card PNG + PDF
```

`make_banners.py` and `make_card.py` both `import make_marks as M` and reuse its
geometry constants, so a change to the mark propagates to every surface — but only
if you re-run all three. The generated SVG/PNG/PDF files are committed deliberately:
Pages serves them directly and nothing rebuilds them on deploy.

## Architecture

**Two pages, one stylesheet.**

- `index.html` (~176KB) is the entire public site — head metadata, one inline
  `<style>` block, the content sections, and one inline `<script>` block at the
  bottom. Sections in order: research, advisory, record, work, road, khudi,
  collaborate, contact. Edit it in place; there are no partials to assemble.
- `brand.html` is the identity-system reference page. It is `noindex` and is not
  linked from `index.html` — it exists so the design system can be inspected and
  audited. Every swatch on it is driven by the tokens, so a wrong swatch means a
  wrong token.
- `assets/brand/tokens.css` is the only external stylesheet and the single source
  of truth for colour, type and measure. Both pages link it.

**How the CSS is layered.** `tokens.css` defines the raw scales (`--ember-*`,
`--ink-*`, `--verd-*`), then the semantic layer (`--ground`, `--surface`, `--ink`,
`--accent`, `--accent-ink`, `--evidence`). The inline `<style>` in `index.html`
aliases those semantics into component names at `:root`
(`--display:var(--statement)`, `--read:var(--record)`, `--mono:var(--instrument)`,
`--signal:var(--accent)`) and builds components from there. There is exactly one
hardcoded hex in `index.html` — the `theme-color` meta tag — and it should stay
that way: new colour goes into `tokens.css`, not into a component rule.

**Theming.** Three layers, in this order: `:root` defaults to light, a
`prefers-color-scheme: dark` media block flips the semantics, and explicit
`:root[data-theme="light"]` / `:root[data-theme="dark"]` blocks override both so
the manual toggle wins regardless of what the OS reports. The `#themeBtn` handler
in `index.html` sets that attribute; it does not persist the choice.

**JavaScript.** Vanilla, no dependencies, wrapped in IIFEs at the bottom of
`index.html`. Three things only: the theme toggle, an IntersectionObserver that
adds `.in` to reveal elements on scroll, and the filter chips that show/hide cards
in `#projGrid`. GoatCounter (`gc.zgo.at`) is the sole third-party script — cookieless,
loaded async in `<head>`.

**Brand generators.** `make_marks.py` computes the whole mark family from one block
of constants (centre, ring radius `R`, strokes `SW`/`AW`, the gap angles, the apex
and crossbar coordinates). The geometry is calculated rather than eyeballed so
clearances stay exact across cuts. Change a constant, not a path.

## Design rules that constrain edits

These are enforced by convention, not by tooling, and they are the point of the
system — see `brand.html` §rules and `assets/brand/theme-ember-instrument.md`.

1. Ember `#E0662E` is 3.11:1 on paper. It carries rules, fills, marks and large
   type — **never body text on a light ground**. Body text and links use
   `--accent-ink` (ember-650 on light, ember-tint on dark), which is contrast-checked
   to ≥4.85:1 against every light surface in the system.
2. One ember element per view carries the weight. If two things shout, neither is
   a signal.
3. Ember marks what pulls you; verdigris marks what was verified. The semantics are
   the argument the site is making — do not swap them for visual variety.
4. Warm neutrals only. A cold grey next to this ember reads as a rendering error.
5. Below 32px use `mark-micro.svg`; the primary cut's clearances close up and the
   mark turns to mud.
6. Clear space around the mark is one ring radius. Nothing sets inside it.
7. The mark is ember, warm black, or reversed white — never a third hue, never a
   gradient.

Provenance matters here: the mark is original geometry with a family resemblance to
an existing badge, and it must never be presented as any other organisation's mark
(`brand.html` §provenance).

## Deployment

Pushing to `main` publishes. Work on any other branch is not live. Absolute URLs in
the OG/Twitter meta tags point at `https://malikai-786.github.io/` — update them
together with any domain change, along with `site.webmanifest`.

`assets/brand/profile-readme/` is **not part of this site**. It is a package meant to
be copied by hand into a separate public repo named `MalikAI-786` to render a GitHub
profile README; see its `INSTALL.md`.
