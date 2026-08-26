# methods

How research gets done here. Not part of the website — nothing links to it,
and GitHub Pages serves it only because everything in this repository is served.

This directory is **method, not data**. It carries no participant response, no
transcript, no interview recording, and no unpublished finding. Those live in
`malik-research`, private, under IRB-25-0462. If a file here contains something
a participant said, it is in the wrong directory.

## Why it exists

Two reasons, and the second one is the durable one.

1. **A qualitative proposal is due.** The doctoral coursework requires one, built
   on a research topic that until now has been entirely quantitative.
2. **Method learned and not written down is method lost.** The point of this
   directory is that it can be read cold in three years and taught from.

## Layout

| Path | What belongs here |
| --- | --- |
| `qualitative/` | One file per approach and per cross-cutting technique |
| `qualitative/DESIGN.md` | The actual study design — approach, sampling, collection, analysis, validation |
| `prompts/` | One research task per file, copy-pasteable into any model |
| `risk/` | The LLM-reliance risk register |
| `RUNBOOK.md` | Numbered tasks, each pointing at a prompt |
| `BIBLIOGRAPHY.md` | Every source cited anywhere in this directory |

## The shape every method file takes

Five sections, always, in this order:

- **What it is**
- **When it applies**
- **What it cannot do**
- **Citation**
- **How I explain this**

The third one is not optional and it is not decoration. `malik-research` already
requires that every model carry a README stating what it cannot do; the same
rule applies to a method. A technique described only by its strengths is a sales
pitch, and the argument this whole practice makes is that a claim is worth what
its evidence is worth.

The fifth section is written to be said out loud. It exists so this can be
taught rather than only consulted.

## Rules

**Nothing here asserts a fact about a person.** Not a date, an employer, a
credential, or a finding. Method files describe method. Where a worked example
is useful it draws on work already published on this account.

**Every citation resolves.** A marker in a method file must correspond to an
entry in `BIBLIOGRAPHY.md`. `tools/audit/invariants.py` checks this, because a
citation that goes nowhere is worse than no citation.

**Prompts are self-contained.** Each file in `prompts/` must run when pasted
alone into a chat window with no other context, on any model. The precedent is
`tools/datadump/init-datadump.sh`, which carries every file it writes inside
itself so it survives being copied to a machine that has never seen this repo.
