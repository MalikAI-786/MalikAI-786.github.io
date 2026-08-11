# Newsletter drafting

Tooling for **[Proof Over Promise](https://proofoverpromise.substack.com)**.

The deliverable in this directory is **[voice.md](voice.md)** — the system
prompt. It carries the editorial position, the five threads, the facts that are
actually on the record, and the lines the draft may not cross. Everything that
decides how an issue reads lives there. `draft_issue.py` is plumbing around it.

```
tools/newsletter/
├── voice.md          the system prompt — this is the actual deliverable
├── draft_issue.py    reads source material, streams a draft to disk
└── README.md
```

## Use

```sh
pip install anthropic
export ANTHROPIC_API_KEY=...
./draft_issue.py notes.md --title "What the walkthrough found"
```

The draft streams to your terminal as it is written and lands in
`build/newsletter/<date>-<slug>.md`.

```
./draft_issue.py notes.md transcript.txt --thread evidence
./draft_issue.py notes.md --effort max          # low | medium | high | xhigh | max
./draft_issue.py notes.md --dry-run             # print the prompt, call nothing
./draft_issue.py notes.md -o /tmp/draft.md
```

Sources are any files readable as text — interview notes, a framework excerpt,
a transcript, a half-written draft. Pass as many as you like; each is labelled
so the draft can point back at it.

Every draft ends with a **Notes for Yasir** section: what was left out for want
of a fact, which claims the model is least confident in, and what in the source
material it deliberately did not use. That section is not part of the issue.

## What it will not do

**It writes a file. That is the entire output surface.** There is no send path
— no Substack, no LinkedIn, no email — and there should never be one.
[AGENTS.md](../../AGENTS.md) is explicit that transmission is Yasir's decision
every time, and the most reliable way to honor that is a tool that structurally
cannot transmit.

`voice.md` also refuses on his behalf in the places that matter: it may not
invent a fact about him, may not present the doctoral work as further along
than it is (the completed study reached **feasibility, not validation**), may
not put words in anyone's mouth, and may not carry a participant response from
the study under IRB-25-0462 into a file. If a draft needs a fact that is not on
the record, it leaves the hole visible and says so.

## Drafts are not public

`build/newsletter/` is gitignored. This is the one deliberate exception to the
rule that everything in this repository is public: `build/readmes/` is
committed because generated READMEs are reviewed output, but an unreviewed
newsletter draft is neither finished nor checked, and a draft that quotes a
half-remembered number should not be a permanent public artifact. Publish from
Substack, not from git.

## Editing the voice

`voice.md` is meant to be edited — it is the surface, not an implementation
detail. Two things to know:

- **The facts section is a whitelist.** The model may state those facts and no
  others. Adding a fact means adding it there; it will not infer one from
  context, and it is told not to.
- **Editing it invalidates the prompt cache.** The system prompt carries a
  cache breakpoint, so repeated runs against an unchanged `voice.md` pay for it
  once at read rates. Edits are cheap; they just reset that.

The tone rules are drawn from his own published writing on
[the site](https://malikai-786.github.io) — the newsletter page, the ethics
section and the Iqbal reflection — rather than invented. When his voice moves,
move `voice.md` to match rather than fighting it in the draft.

## Model

Runs on `claude-opus-5` with adaptive thinking, streaming, and effort `high` by
default. Server-side refusal fallbacks are requested and quietly dropped if the
installed SDK does not support them.

---

<sub>[Site](https://malikai-786.github.io) ·
[Newsletter](https://malikai-786.github.io/newsletter.html) ·
[Agent instructions](../../AGENTS.md)</sub>
