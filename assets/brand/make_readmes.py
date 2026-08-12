#!/usr/bin/env python3
"""
Every README on the account, generated from one manifest.

The account should read as one thing. A visitor landing on any repository
should see immediately what it is, how it relates to the rest, and how to get
back to the top. Hand-written READMEs drift apart within a month; generated
ones cannot.

Three decisions worth knowing before you edit this file.

1. **Art is referenced, not copied.** Previously each repository carried its
   own `.github/brand/banner-*.png`. That meant a brand change was a commit in
   nine places and the account was one forgotten push away from being visibly
   inconsistent. Banners now live once, here, and are served from GitHub Pages.
   Re-run make_banners.py and every README on the account updates its artwork
   with no commits anywhere else.

2. **The footer is the connective tissue.** Every repository ends with the same
   navigation strip, so the account is a graph rather than a pile. The profile
   is always one click away from the furthest leaf.

3. **This manifest is the editing surface.** `body` holds the hand-written
   middle of each README — the part that is actually about the code. The
   generator only ever supplies the chrome around it. To change how a
   repository presents itself, change it here and regenerate; do not edit the
   README in the repository, it will be overwritten.

Output lands in build/readmes/<repo>/README.md for review before pushing.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "build", "readmes")

USER = "MalikAI-786"
SITE = "https://malikai-786.github.io"
CDN = f"{SITE}/assets/brand"
LINKEDIN = "https://linkedin.com/in/yasiramalik"
SUBSTACK = "https://proofoverpromise.substack.com"

# The control center. Git is the published record; this is the live state.
CONTROL = "https://www.notion.so/3b54ffd38c7e8183ad84fa2ca08c5c3c"

ARCHIVE_NOTE = (
    "> **Archived.** An earlier attempt at my personal site, kept for history\n"
    "> rather than maintained. The live site is\n"
    f"> **[malikai-786.github.io]({SITE})**.\n")


# ---------------------------------------------------------------------------
# The manifest.
#
#   banner    slug under assets/brand/banners/
#   alt       alt text for the banner image
#   archived  prepend the archive note above the body
#   body      the hand-written middle. Everything the generator does not own.
# ---------------------------------------------------------------------------

REPOS = {}

REPOS["MalikAI-786.github.io"] = dict(
    agent="""\
This repository is the source of the whole identity system. Everything under
`assets/brand/` is generated: run the `make_*.py` scripts, never hand-edit an
SVG or a PNG. `make_marks.py` holds the constants every other generator
imports, so a change there propagates to the entire family — which is the
point, and also why an unconsidered edit there is expensive.

Banners are referenced by other repositories over `https://malikai-786.github.io`.
Moving or renaming anything under `assets/brand/banners/` or
`assets/brand/profile-readme/` breaks the README art on nine other repositories
at once. Regenerate rather than reorganise.

This is a GitHub Pages site published from `main`. A push is a deploy.""",
    banner="site", alt="The Site — Yasir A. Malik", body="""\
# The site, and the identity system behind it

My research, advisory practice, and the brand that every other surface on this
account inherits from.

This is the canonical surface. Everything else on my GitHub either feeds it or
points back at it.

It also holds the identity system itself: the palette, the mark, and the
generators that produce every logo, banner, avatar and card I use. Nothing here
is drawn by hand. The whole family derives from one set of constants in
`assets/brand/make_marks.py`, so the mark on a business card and the mark on a
repository banner are provably the same geometry rather than two things that
happen to look alike.

The colour is not invented either. Ember `#E0662E` was sampled from a physical
badge holder and white-balanced. It carries a documented limitation, written
into the tokens file rather than discovered later: at 3.11:1 on paper it fails
WCAG for body text, so a darker cut (`#AD4317`) carries any words set on a light
ground.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The site |
| `brand.html` | The identity system, documented — palette, mark, type, usage rules |
| `newsletter.html` | Proof Over Promise |
| `linkedin.html` | Profile copy, kept in sync with the resume |

## The generators

| File | What it makes |
| --- | --- |
| `assets/brand/tokens.css` | Single source of truth for the palette |
| `assets/brand/make_marks.py` | The mark family — every other generator imports its geometry |
| `assets/brand/make_banners.py` | Repository banners, light and dark |
| `assets/brand/make_profile_hero.py` | The profile hero, with the portrait re-lit into the palette |
| `assets/brand/make_avatars.py` | Stream avatars — A, M, P letterforms |
| `assets/brand/make_linkedin.py` | LinkedIn cover, verified against the mobile crop |
| `assets/brand/make_card.py` | Business card |
| `assets/brand/make_readmes.py` | Every README on the account, including this one |

Each generator asserts its own clearances rather than trusting the eye. Run any
of them directly; they print what they wrote.
""")

REPOS["malik-research"] = dict(
    agent="""\
**IRB-25-0462.** This is the repository where the safeguards actually bite.
`data/` and `output/` are denied in `.gitignore` and that exclusion is tested,
not assumed. Never weaken it, never `git add -f` past it, and never place a
participant response anywhere in this tree.

Analysis decisions are logged in `docs/decision-log.md` when they are made, not
reconstructed afterward. If you change an analysis, log it in the same commit.
A record written after the conclusion is not evidence of the reasoning, which
is the argument this whole study rests on.""",
    banner="research", alt="Research — Yasir A. Malik", body="""\
# Research

Models, instrument, and analysis for doctoral research at Florida International
University on **what happens to professional judgment when auditors begin
trusting AI output more than their own review**.

IRB-approved empirical study, IRB-25-0462.

> ### Human-subjects data does not live in this repository
>
> `data/` is git-ignored and stays that way. Under the IRB protocol,
> participant data is held in approved storage only. What lives here is the
> instrument, the models, the analysis code, and the documentation needed to
> reproduce the work given access to the data.
>
> If a file contains a participant response, it is in the wrong place.

## Layout

| Path | What belongs here |
| --- | --- |
| `instrument/` | The measurement model. Constructs, items, scales, and the Qualtrics export. |
| `models/` | Models built from the research. One directory each, with its own README stating inputs, assumptions, and known limits. |
| `analysis/` | Scripts in run order: exploratory factor analysis, confirmatory factor analysis, structural model. |
| `data/` | Git-ignored. `data/README.md` records where the real data lives and who may access it. |
| `docs/` | Protocol, codebook, IRB correspondence, decision log. |

## Reproducing

Each script states its inputs and outputs in a header comment. Run them in
numeric order. Nothing writes outside `output/`, which is also git-ignored, so a
clean checkout plus the data directory reproduces every result.

## A note on method

The subject of this research is over-reliance on systems that agree with you.
That argument obliges the work itself: every model here carries a README stating
what it cannot do, and analysis decisions are logged in `docs/decision-log.md`
when they are made rather than reconstructed afterward. A record written after
the conclusion is not evidence of the reasoning.
""")

REPOS["MalikAI-786-spx"] = dict(
    agent="""\
The ledger is **append-only**, and the integrity hashes exist so that a
prediction cannot be edited once the outcome is known. Do not rewrite a past
row, do not "correct" a historical call, and do not rebase away ledger history.
If a past entry is wrong, append a correction — that is the whole control.

The educational-use-only disclaimer is not boilerplate. It stays, in full, and
it does not get softened.

Emails are drafted, never sent.""",
    banner="malikai-786-spx", alt="Research Instrument — Yasir A. Malik", body="""\
# Research instrument

A governed, fully instrumented decision pipeline, built to study AI decision
quality with markets as the test bed.

I needed a system where a machine makes a call, the call is recorded before the
outcome is known, and the record cannot be quietly revised afterwards. Markets
provide exactly that: a daily decision with an unambiguous answer a few hours
later.

So the interesting part is not the trading. It is the governance scaffolding
around it — a five-bucket scored model, calibration against a rolling ledger,
cross-checks across three independent AI sources, an append-only ledger, and
integrity hashes so a prediction cannot be edited after the fact. It is the
control environment I argue for in writing, built so that I have to live inside
it.

> ## DISCLAIMER
>
> **This project is for educational and research purposes only. It is NOT
> investment advice, NOT a recommendation, and NOT an offer to buy or sell any
> security. No compensation flows are associated with this project. Past
> performance does not indicate future results. Options trading involves
> substantial risk of loss. Do not act on signals produced by this system with
> real money.**

## How it runs

At 9:00 AM ET on US trading days it runs the five-bucket model (futures, macro,
news, international, sentiment), scores a composite with a calibration overlay
from a rolling ten-day ledger, writes a morning report, updates the public
dashboard, and drafts the 9:30 AM email. At 4:15 PM ET it determines the
outcome, updates the running ledger, and drafts a close-of-day email.

## Tech stack

- **Python 3.9+** — model, ledger, report rendering
- **bash** — orchestration, bootstrap, scheduled wrappers
- **Gmail OAuth** — drafting morning and close emails (drafts only, no auto-send)
- **GitHub Actions** — daily dashboard sync and integrity audits
- **GitHub Pages** — public dashboard
- **launchd** (macOS) — scheduling at 9:00 AM and 4:15 PM ET

## Quick start

```bash
git clone git@github.com:malikai-786/MalikAI-786-spx.git
cd MalikAI-786-spx

./deploy/bootstrap.sh "$HOME"          # idempotent, paranoid by default

cp scripts/.env.example scripts/.env   # then edit — .gitignore covers it
python scripts/setup_gmail_oauth.py

./scripts/install_launchd.sh           # schedule

python scripts/run_morning.py --dry-run
python scripts/run_close.py   --dry-run
```

Full setup, including Pages and the cross-repo deploy key, is in
[`deploy/GITHUB-SETUP.md`](deploy/GITHUB-SETUP.md).

## Layout

| Path | What it is |
| --- | --- |
| `skill/` | `SKILL.md` and supporting files used by Claude Code |
| `scripts/` | The morning and close pipelines, calibration, rendering, publishing |
| `ledger/` | Append-only P&L and signal ledger |
| `audits/` | Integrity anchors and the ethics and regulatory review memo |
| `sources/` | The five-bucket source manifest and daily raw responses |
| `docs/` | Methodology, and how the rolling ledger feeds next-day calibration |
| `SPX-Reports/` | Daily morning and close reports |
| `dashboard/` | JSON synced to the public dashboard |

## Documentation

- [`docs/methodology.md`](docs/methodology.md) — the model, the five buckets, the
  calibration overlay, and the limits of the approach
- [`audits/audit-memo-v5.md`](audits/audit-memo-v5.md) — ethics and regulatory
  review, including why this is educational research and not investment advice
- [`docs/self-improving-loop.md`](docs/self-improving-loop.md) — how outcomes
  feed back into calibration

## License

[MIT](LICENSE) — Copyright (c) 2026 Yasir A. Malik. Questions:
[open an issue](https://github.com/MalikAI-786/MalikAI-786-spx/issues).
""")

REPOS["index007.html"] = dict(
    banner="index007", alt="SPX 0DTE Dashboard — Yasir A. Malik", body="""\
# SPX 0DTE dashboard

The public reporting surface for the research instrument: the daily call, the
running ledger, and how calibrated the model has actually been.

It is published because a prediction you can revise afterwards is not a
prediction. Every call is posted before the outcome is known and the ledger is
append-only.

> ### Disclaimer
>
> **Educational and research purposes only.** Not investment advice, not a
> recommendation, and not an offer to buy or sell any security. Not a track
> record. Options trading involves substantial risk of loss. Do not act on
> anything here with real money.

Single-page static HTML. Tailwind and Chart.js load from CDN; there is no build
step. The pipeline behind it is
[MalikAI-786-spx](https://github.com/MalikAI-786/MalikAI-786-spx).

## Branding

Runs on the shared identity system — ember `#E0662E` as the anchor colour, warm
graphite as the record, Charter for headlines, mono for labels. Because the page
is built on Tailwind utility classes, the identity is applied as a layer over
them rather than by re-pointing variables.
""")

REPOS["claudebot-onboarding"] = dict(
    banner="claudebot-onboarding", alt="ClaudeBot Onboarding — Yasir A. Malik",
    body="""\
# Practical AI adoption

A walkthrough for colleagues meeting LLM tooling for the first time.

Most AI training either oversells the tool or drowns people in prompt tricks. I
wrote this for audit and risk colleagues who need a third thing: what it is good
at, what it is bad at, and where a professional still has to do the thinking.
It is deliberately unglamorous, and it is the document I actually hand to
people.

## Getting started

**Understand the shape of the tool.** It drafts and edits text, explains
concepts, reads and writes code, summarises, and helps you think out loud. It
does not know what it does not know, and it will not tell you when it is
guessing.

**Ask properly.** Be specific about what you need and why. Give it the context a
new colleague would need. Break large tasks into steps. Say what format you want
back.

**Iterate.** Push back on the first answer. Ask it to argue the other side. The
second answer is usually the useful one.

## Where judgment stays yours

| The tool is good at | You still own |
| --- | --- |
| Drafting, editing, restructuring | Whether the conclusion is right |
| Explaining an unfamiliar concept | Whether it applies to your facts |
| Reading code and spotting patterns | Whether the control actually operates |
| Summarising long documents | What was left out of the summary |

The failure mode to watch for is not the obvious wrong answer. It is the
plausible one that arrives already formed, in confident prose, agreeing with the
position you walked in holding. That is the risk I research, and it is the
reason this guide exists.

## Working rules

1. Know what you want before you start.
2. Give context; vague requests get vague answers.
3. Verify anything you would be embarrassed to be wrong about.
4. Disclose the assistance where disclosure matters.
5. Never let it write the conclusion for you.
""")

REPOS["interview-prep-jpm"] = dict(
    banner="interview-prep-jpm", alt="Interview Preparation — Yasir A. Malik",
    body="""\
# Interview preparation

An interactive preparation toolkit for a VP Control Manager role in JPMorgan's
Global Investment Banking Control Management group. Public because the structure
travels further than the content.

## Contents

| File | What it is |
| --- | --- |
| `Interview_Prep_Dashboard.html` | Searchable dashboard — tabbed Q&A with model answers, STAR responses, control-management technical prep, narrative, questions to ask, coaching notes |
| `Interview_Prep_Dashboard.docx` | Printable version of the same content |
| `NotebookLM_Memorize_Script.md` | Audio-first memorisation script — short lines, first person, repetition, memory hooks |

## How to use it

Open the HTML and search to jump to a topic. Print the `.docx` to annotate. Load
the script into NotebookLM, generate an Audio Overview, and rehearse out loud.

## The through-line

*"I have judged controls from the outside for twenty years. Now I want to build
them from the inside."* The regulator and audit background reframed as the
advantage it is for a first- or second-line control role.
""")

REPOS["portfolio-website"] = dict(
    banner="portfolio-website", alt="Portfolio — Yasir A. Malik", archived=True,
    body="""\
# Portfolio

A single-page portfolio site covering audit transformation, AI for risk and
compliance, and real-estate operations.

Static HTML, CSS and vanilla JavaScript. No build step: open `index.html`, or
serve the directory.

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Layout and structure |
| `brand.css` | The identity layer — palette, type, components |
| `script.js` | Navigation and the client-side assistant demo |
""")

REPOS["YasirA.Malik"] = dict(
    banner="yasira-malik", alt="Yasir A. Malik", archived=True, body="""\
# Personal site

A static, dependency-free personal site covering audit leadership, doctoral
research on auditor judgment, and AI governance.

| File | What it is |
| --- | --- |
| `index.html` | About |
| `books.html` | Reading |
| `style.css` | Layout, structure, and the original type scale |
| `brand.css` | The identity layer |

**Known gap.** The Google Scholar and Goodreads links still point at `YOUR_ID`
placeholders. GitHub and LinkedIn are wired up.
""")

REPOS["yasir-malik-biolink"] = dict(
    banner="yasir-malik-biolink", alt="Links — Yasir A. Malik", archived=True,
    body="""\
# Links

A biolink page — one screen of destinations, for use anywhere a profile allows
only a single URL.
""")


# The 2020–21 coursework. Grouped and linked from the master rather than given
# individual READMEs: the value is the portfolio as a whole, not any one repo.
FOUNDATIONS = [
    ("Applied machine learning", [
        ("DeepLearning", "LSTM stock predictor"),
        ("Natural_Language_Processing", "Sentiment and NLP on financial text"),
        ("Machine_Learning_Classification", "Classification on credit data"),
        ("Time_Series", "Forecasting on market data"),
    ]),
    ("Quantitative finance", [
        ("API", "Monte Carlo retirement planning"),
        ("A-Whale-Off-the-Port-folio", "Portfolio risk and return analysis"),
        ("PyViz", "Interactive financial visualisation"),
        ("Apple_Card", "Consumer-credit case study"),
    ]),
    ("Distributed ledger", [
        ("BlockChain", "A chain built from first principles"),
        ("BlockChain-Python", "Proof-of-work and wallet mechanics"),
        ("Decentralized-Apps", "Solidity contracts and dApp scaffolding"),
    ]),
    ("Programme", [
        ("Columbia-FinTech", "Columbia Engineering FinTech programme"),
        ("Fintech_Introduction", "Introductory case work"),
        ("Python", "Python for financial analysis"),
        ("AWS", "Cloud deployment work"),
    ]),
]


def picture(slug, alt, prefix="banners/"):
    return (f'<p align="center">\n'
            f'  <picture>\n'
            f'    <source media="(prefers-color-scheme: dark)" '
            f'srcset="{CDN}/{prefix}{slug}/banner-dark.png">\n'
            f'    <source media="(prefers-color-scheme: light)" '
            f'srcset="{CDN}/{prefix}{slug}/banner-light.png">\n'
            f'    <img alt="{alt}" src="{CDN}/{prefix}{slug}/banner-light.png" '
            f'width="100%">\n'
            f'  </picture>\n'
            f'</p>\n\n')


def footer(on_profile=False):
    """The strip that makes the account navigable from any repository."""
    links = [(f"https://github.com/{USER}", "Profile"),
             (SITE, "Site"),
             (f"{SITE}/brand.html", "Brand system"),
             (SUBSTACK, "Newsletter"),
             (LINKEDIN, "LinkedIn")]
    if on_profile:
        links = links[1:]
    nav = " · ".join(f"[{label}]({url})" for url, label in links)
    return ("\n---\n\n"
            f"<sub>{nav}</sub>\n\n"
            "<sub><b>Yasir A. Malik</b> · Audit · Risk · Governance · "
            "Newark, NJ · NYC metro</sub>\n")


def render(spec):
    md = picture(spec["banner"], spec["alt"])
    if spec.get("archived"):
        md += ARCHIVE_NOTE + "\n"
    return md + spec["body"] + footer()


def render_master():
    """The README on the profile repository — the front door for everything."""
    md = ('<p align="center">\n'
          '  <picture>\n'
          f'    <source media="(prefers-color-scheme: dark)" srcset="{CDN}/profile-readme/profile-hero-dark.png">\n'
          f'    <source media="(prefers-color-scheme: light)" srcset="{CDN}/profile-readme/profile-hero-light.png">\n'
          f'    <img alt="Yasir A. Malik — Audit · Risk · Governance" src="{CDN}/profile-readme/profile-hero-light.png" width="100%">\n'
          '  </picture>\n'
          '</p>\n\n')

    md += (
        "I examined banks as a regulator, ran audits inside two of them, and "
        "built and shipped an AI tool into a live audit function. Now I research "
        "what happens to professional judgment when the evidence arrives "
        "pre-interpreted.\n\n"

        "### What I work on\n\n"

        "**Cognitive bias in audit judgment.** An eleven-construct, "
        "fifty-five-item measurement model grounded in dual-process theory and "
        "the anchoring-and-adjustment heuristic. The question underneath it: in "
        "a recurring engagement, does this year's judgment follow this year's "
        "evidence, or last year's number?\n\n"

        "**AI and professional judgment.** Where that question goes next. A "
        "system tuned on human approval tends to affirm the position you already "
        "hold, and it is most agreeable exactly where a reviewer most needs "
        "pushback. As successive models reprocess the same work, conclusions "
        "converge on each other rather than on evidence, and the record, written "
        "with the same tools, remembers the drift as consensus. That is a "
        "control problem, not just a technology problem.\n\n"

        "### How this account is laid out\n\n"

        "**Practice** is the live surface. **Research** is the doctoral work. "
        "**Applied** is what I have actually built and run. **Foundations** is "
        "the quantitative work underneath all of it. Every repository carries the "
        "same banner system and the same footer, so from anywhere on this account "
        "you are one click from here.\n\n"
    )

    def table(rows):
        return "| | |\n| --- | --- |\n" + "".join(
            f"| [**{name}**]({url}) | {desc} |\n" for name, url, desc in rows) + "\n"

    md += "#### Practice\n\n" + table([
        ("malikai-786.github.io", f"https://github.com/{USER}/MalikAI-786.github.io",
         "The site, the identity system, and the generators behind it"),
        ("Proof Over Promise", SUBSTACK,
         "My newsletter on AI governance, model risk, and professional judgment"),
    ])

    md += "#### Research\n\n" + table([
        ("malik-research", f"https://github.com/{USER}/malik-research",
         "Instrument, models and analysis for the DBA. No participant data, by design"),
    ])

    md += "#### Applied\n\n" + table([
        ("MalikAI-786-spx", f"https://github.com/{USER}/MalikAI-786-spx",
         "A governed decision pipeline, built to study AI decision quality"),
        ("index007.html", f"https://github.com/{USER}/index007.html",
         "Its public ledger. Every call posted before the outcome is known"),
        ("claudebot-onboarding", f"https://github.com/{USER}/claudebot-onboarding",
         "The LLM walkthrough I hand to audit and risk colleagues"),
    ])

    md += ("#### Foundations\n\n"
           "Quantitative and machine-learning work from the Columbia Engineering "
           "FinTech programme. Older, and still the reason the rest of this is "
           "possible.\n\n")
    for heading, repos in FOUNDATIONS:
        row = " · ".join(f"[{n.replace('_', ' ')}](https://github.com/{USER}/{n})"
                         for n, _ in repos)
        md += f"**{heading}** — {row}\n\n"

    md += (
        "### Where this is pointed\n\n"

        "Audit earned its reputation. Someone arrives, finds what went wrong, "
        "writes it down, and leaves. The organisation gets better at not being "
        "caught, which is not the same thing as getting better. I have written "
        "those findings. I know what they change and what they do not.\n\n"

        "But the skill of an auditor was never catching people. It is the "
        "ability to ask, without embarrassment and without apology, **how would "
        "we know?** — and to sit still while the room works out that it would "
        "not. That question is most of professional ethics, and unlike "
        "character, it can be taught.\n\n"

        "That matters more now than it did five years ago. The risk in front of "
        "us is not that somebody sets out to deceive. It is deference: an answer "
        "arrives fluent, confident and without visible provenance, and a tired "
        "professional accepts it. You cannot examine your way out of that. "
        "Nobody documents the moment they stopped thinking, so there is no "
        "finding to write and nothing for a watchdog to bite.\n\n"

        "So this is the focus. **Use the audit discipline to teach judgment "
        "rather than to police it.** Governance that produces better thinking, "
        "not just cleaner files. Ethics as a practice with a method behind it, "
        "taught by someone who has sat on both sides of the table, rather than a "
        "poster in the lobby.\n\n"

        "*I use AI systems intensively, which is precisely why I study how they "
        "fail. The risk I research is not hypothetical to me; it is the risk in "
        "my own workflow, managed deliberately. The judgment, synthesis and "
        "interpretation are mine.*\n"
    )

    return md + footer(on_profile=True)


# ---------------------------------------------------------------------------
# Agent instructions.
#
# AGENTS.md is the cross-tool convention; CLAUDE.md is what Claude Code reads.
# Rather than maintain two drifting documents, CLAUDE.md is a pointer and
# AGENTS.md carries the content.
#
# The safeguards below are written as hard rules with reasons attached. An
# instruction an agent can rationalise its way past is not a control. Each one
# exists because the failure it prevents is either irreversible (published,
# sent, disclosed) or destroys the thing that makes the record worth anything
# (a claim nobody can verify).
# ---------------------------------------------------------------------------

AGENT_HEADER = f"""\
# Instructions for AI agents

**Read the control center before you act.** These repositories are the
*published record*. They are deliberately not the current state of anything.
What is live, what is blocked, what was decided last week, and what is in
flight lives in one place:

### ▶ [Malik Operating System — the control center]({CONTROL})

If you can reach Notion, open it first. If you cannot, say so plainly and work
only from what is in the repository — do not infer current status from a file's
contents or a commit date. A README describes intent; it is not a status
report.

## Order of authority

| Rank | Source | Holds |
| --- | --- | --- |
| 1 | The control center (Notion) | Live status, decisions, what is blocked, what is next |
| 2 | `AGENTS.md` in the repo you are working in | Rules for that codebase |
| 3 | The repo `README.md` | The public narrative. Generated — see below |

When two disagree, the higher rank wins, and say out loud that you found the
conflict.
"""

AGENT_SAFEGUARDS = """\
## Safeguards

These are not preferences.

**1. Every file in these repositories is public.** There is no private
directory, no "internal" folder, and nothing is protected by being unlinked.
Before writing a file, assume a recruiter, a regulator, and a search engine
will read it.

**2. Never commit human-subjects research data.** The doctoral study runs under
**IRB-25-0462**. In `malik-research`, `data/` and `output/` are denied by
`.gitignore` and the exclusion is tested. Do not add exceptions, do not
`git add -f`, and do not paste participant responses into a file, an issue, a
commit message, or a README. If a file contains a participant response it is in
the wrong place, whatever the file extension says.

**3. Never commit secrets or personal records.** No credentials, tokens, API
keys, `.env` files, account numbers, addresses, or identity documents. Nothing
about legal matters, tenants, medical history, or family belongs in version
control. If you are unsure whether something qualifies, it does.

**4. Do not send, publish, or post as Yasir.** Draft freely; transmit nothing.
That covers email, LinkedIn, Substack, issues, PR comments, and anything that
leaves the machine. Sending is his decision every time, and prior approval for
one message is not approval for the next.

**5. Never invent a fact about him.** Not a date, a title, an employer, a
credential, a metric, or a research finding. The entire argument of his work is
that a claim is worth what its evidence is worth — a fabricated line in a
README does more damage here than in almost any other portfolio. If a fact is
missing, leave it out and say you left it out. Do not approximate a year. Do
not round a number up.

**6. Do not present research as further along than it is.** The DBA is in
progress. Nothing here is peer-reviewed, published, or replicated unless it
says so with a citation.

**7. Preserve the disclaimers.** `MalikAI-786-spx` and `index007.html` carry
educational-use-only language for a reason. It is not boilerplate to be tidied
away, and it does not get softened.

**8. Flag rather than fix, when the fix is a decision.** Renaming a repository,
deleting history, changing a public URL, force-pushing, or altering how he is
described professionally are his calls. Bring them to him.
"""

AGENT_BRAND = """\
## The brand is settled

Do not redesign it, and do not re-litigate the palette. It is documented at
[brand.html](https://malikai-786.github.io/brand.html), and the tokens are in
`assets/brand/tokens.css` in the site repository.

- Ember `#E0662E` is the anchor. **It can never carry body text on a light
  ground** — it measures 3.11:1, which fails WCAG AA. Use `#AD4317` on light
  and `#F58E5C` on dark.
- Warm graphite `#171A1D` on warm paper `#F6F3F0`. No cold greys.
- Verdigris `#0F5F5A` / `#4FC0B2` means *verified*. Ember means *priority*.
  They are never swapped.
- Charter for headlines, system sans for body, mono uppercase with wide
  tracking for labels.
- The descriptor is **Audit · Risk · Governance**. Not AI-forward, on purpose.

## Generated files

`README.md` in every repository on this account is generated from
`assets/brand/make_readmes.py` in the site repo, and so is this file. Editing
either one in place works until the next regeneration silently reverts it.
Change the manifest and regenerate.

The same applies to every image under `assets/brand/`: marks, banners,
avatars, the LinkedIn cover, the business card and the profile hero all come
out of `make_*.py` generators driven by one set of constants. Never hand-edit
an SVG or retouch a PNG — change the generator and re-run it.
"""


def render_agents(repo, spec):
    md = AGENT_HEADER
    if spec.get("agent"):
        md += f"\n## This repository\n\n{spec['agent']}\n"
    return md + "\n" + AGENT_SAFEGUARDS + "\n" + AGENT_BRAND + footer()


def render_claude_md(repo):
    """Claude Code reads CLAUDE.md. Keep one document, not two."""
    return (f"# {repo}\n\n"
            "Instructions for this repository live in **[AGENTS.md](AGENTS.md)**. "
            "Read it before making changes.\n\n"
            f"Start with the control center: **[Malik Operating System]({CONTROL})** "
            "— git is the published record, Notion is the live state.\n")


def check(name, text):
    """Cheap guards against the ways a generated README goes quietly wrong."""
    problems = []
    if text.count("# ") == 0:
        problems.append("no heading")
    if "](None" in text or "](}" in text:
        problems.append("broken link")
    for slug in ("banners/", "profile-readme/"):
        for part in text.split(f"{CDN}/{slug}")[1:]:
            rel = os.path.join(HERE, slug + part.split('"')[0])
            if not os.path.exists(rel):
                problems.append(f"missing art: {os.path.relpath(rel, HERE)}")
    return problems


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    failures = 0

    def write(repo, text, name="README.md"):
        global failures
        d = os.path.join(OUT, repo)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, name), "w") as fh:
            fh.write(text)
        problems = check(repo, text)
        failures += len(problems)
        flag = "  " + "; ".join(problems) if problems else ""
        print(f"  {repo + '/' + name:40s} {len(text):>6,}{flag}")

    write(USER, render_master())
    for repo, spec in REPOS.items():
        write(repo, render(spec))
        write(repo, render_agents(repo, spec), "AGENTS.md")
        write(repo, render_claude_md(repo), "CLAUDE.md")

    print(f"\n{len(REPOS) * 3 + 1} files to {os.path.relpath(OUT, ROOT)}"
          + (f" — {failures} problem(s)" if failures else " — all checks pass"))
