# Workstreams — the public ones

What is in flight across the public work, so a session can start from the map
instead of rebuilding it. Written 2026-08-16.

> **This file covers public work only.** Career pipeline, legal matters,
> property, tenants, medical and family items are **deliberately not here** —
> every file in this repository is public (safeguard 1), and those categories
> never go into version control (safeguard 3). They live in the Notion control
> center, and the `chief-of-staff` agent reads them there.

> **Git is the published record, not the current state.** If this file and the
> [control center](https://www.notion.so/3b54ffd38c7e8183ad84fa2ca08c5c3c)
> disagree, Notion wins — and say out loud that you found the conflict.

---

## 1 · Proof Over Promise — the newsletter

**State:** built, never shipped.

| Piece | Status |
|---|---|
| Front door — `newsletter.html` | Live: position, five threads, audience, subscribe |
| Brand — banners, avatars, verdigris mark | Live |
| Voice — `tools/newsletter/voice.md` | New, 2026-08-16 |
| Drafting tool — `tools/newsletter/draft_issue.py` | New. Untested against the live API |
| Issue queue — `tools/newsletter/topics.md` | Five candidates, ship order |
| **Published issues** | **None on record** |

**Cadence:** fortnightly. The site promises "no schedule I would not keep."
**Next:** Issue 01, *The three links* — calendar block Sat 2026-08-22, 09:00.
**Publishing:** Substack canonical → LinkedIn syndication a few days later.
Nothing automated; nothing sends on his behalf.
**Unverified:** the Substack itself could not be reached from the build
environment. If issues already exist there, this section is wrong.

## 2 · Site and identity system

**State:** live and deploying. This repository is the source of the whole
identity system; a push to `main` is a deploy.

- Everything under `assets/brand/` is generated — run the `make_*.py` scripts,
  never hand-edit an SVG or PNG.
- `README.md` and `AGENTS.md` on every repo are generated from
  `assets/brand/make_readmes.py`. Change the manifest, regenerate.
- Banners are hot-linked by nine other repositories. Regenerate rather than
  reorganise.

**Open:** the control center lists "Pages build failing ×4" and "PR #1 open
with 2× P1 findings." The Pages entry may be stale — the site has deployed
through recent pushes. **PR #1's two P1 findings are real and unresolved:** a
script that truncates files in non-empty directories, and a pre-commit hook
that validates the working tree instead of staged blob contents. The second is
a control-design failure — the control tests the wrong population — and it is
the kind of finding he would write up in a walkthrough.

## 3 · Doctoral research — public surface only

**State:** qualifying examination passed July 2026. DBA expected 2028.

The completed study reached **feasibility, not validation**, and that is the
contribution: specialist professional populations cannot be reached through
standard research infrastructure at any price. Current direction —
anchor → sycophancy → epistemic drift — is **in development**. No results.

Nothing about participants, instruments or data goes in any repository
(IRB-25-0462). Coursework status and deadlines live in Notion and the calendar,
not here.

## 4 · Research instrument — `MalikAI-786-spx`

**State:** automation silently dead for roughly three weeks.

`sync-dashboard` and `integrity-audit` were **auto-disabled** by GitHub after
60 days of repository inactivity. They do not restart on their own — re-enable
under Actions → select workflow → Enable.

This is the highest-credibility-cost item on the list. The instrument's entire
argument is that an AI-assisted pipeline should be instrumented and disclosed;
its own integrity audit being off undercuts that. Fix before writing publicly
about governed pipelines.

Educational-use-only disclaimers on this repo and `index007.html` are
load-bearing. They do not get softened.

## 5 · Agents and operating system

**State:** new, 2026-08-16.

| Agent | Job |
|---|---|
| `chief-of-staff` | Status across every workstream; names the one thing today |
| `malik-record` | The authority on what he has done; sources or refuses every claim |
| `newsletter-editor` | Drafts and checks Proof Over Promise |

All three live in `.claude/agents/` — in git, so they survive a session ending,
a new machine, or a different assistant. A daily brief fires each morning and
reports against this file plus Notion.

---

## The pattern worth naming

His own status log, 3 August 2026: **"The bottleneck is the send step, not
discovery."** Ten job-digest runs, consistently good output, near-zero
submissions. The newsletter is the same shape — front door, brand, voice, tool,
zero issues.

Anything that measures activity rather than completions will therefore read as
healthy while nothing ships. Count sends, submissions, publishes and merges.
