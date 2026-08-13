# LinkedIn — the drafting bench

Where posts get made. Not part of the site: nothing here is linked, styled or
served as a page, in the same way `tools/newsletter/` is not.

**Everything in this directory is public.** `AGENTS.md` Safeguard 1 is explicit
that unlinked is not private and that there is no internal folder anywhere in
these repositories. Write every idea and every draft here as though a recruiter,
a regulator and a program chair will read it, because from the moment it is
committed they can. If a thought cannot survive that, it belongs in the control
center, not in git.

**Nothing here posts anything.** Safeguard 4: draft freely, transmit nothing.
`draft_post.py` writes a markdown file to disk and stops. It does not touch
LinkedIn, it has no LinkedIn credentials, and it never will. Publishing is a
decision made by a human, one post at a time.

## The layout

```
ideas.md        the bank. Every idea, unranked, one line to add.
queue/          checked drafts, numbered in posting order. Committed.
drafts/         raw output of draft_post.py. Gitignored, local only.
posted.md       the ledger. What shipped, when, and what it did.
draft_post.py   drafting tool. Writes a file. Stops.
```

The split between `drafts/` and `queue/` is the same one
`tools/newsletter/` already makes, and it is deliberate. `drafts/` is
unreviewed machine output and is gitignored, because an unchecked draft in a
public repository is exactly the failure this practice argues against. A file
earns its way into `queue/` only after the checklist in
`.claude/skills/linkedin/references/checklist.md` has been run against it by a
human. Committing to `queue/` is therefore a statement: *this has been read.*

## How it runs

**Bumping into an idea.** Add a line to `ideas.md`. No format, no ceremony, no
judgment about whether it is good — the whole value of an inbox is that adding
to it is free. Ideas that turn out to be nothing cost one line.

**Promoting an idea.** Move it into `queue/` as a numbered draft. This is where
the work is: finding the actual finding, the record that supports it, and the
open question underneath. An idea that cannot survive promotion goes back to the
bank or gets struck through.

**Posting.** He posts, by hand, on a Tuesday or a Thursday morning. Then the
draft file moves out of `queue/` and its row gets filled in on `posted.md`.

## The rules that govern the writing

The voice is `tools/newsletter/voice.md`. It governs all published writing and
it is not restated here.

The platform rules, the register discipline for the tradition, the Measures
series architecture and the pre-flight checklist live in the `linkedin` skill at
`.claude/skills/linkedin/`. Read the skill before drafting; it carries the
things that break a post silently.

## draft_post.py

```
pip install anthropic
export ANTHROPIC_API_KEY=...

./draft_post.py notes.md
./draft_post.py notes.md --measure M2 --chars 1400
```

It loads `voice.md` and the whole `linkedin` skill as a cached system prompt, so
every draft is written against the same rules the checklist audits against. It
reports the character count against the fold and the ceiling. It marks gaps
`[UNVERIFIED: ...]` rather than filling them.

Read what it produces. It is a draft, and it is wrong about something.
