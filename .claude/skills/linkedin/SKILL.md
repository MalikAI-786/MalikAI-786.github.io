---
name: linkedin
description: >-
  Draft, revise, sequence and audit LinkedIn posts for Yasir A. Malik, whose
  feed runs a life-theories series ("Measures") that translates Iqbal's khudī,
  the Qur'anic self-audit and the Mīzān instrument into audit, risk and AI
  governance arguments. Use this skill whenever a request involves a LinkedIn
  post, comment, carousel, document post, headline, About section, profile
  copy, content calendar, posting queue, hook, call-to-action, hashtags, or the
  first-comment link — and whenever it mentions the Measures series, a life
  theory, khudī, faqr, himmat, su'āl, muḥāsaba or Mīzān *in the context of
  publishing rather than the instrument itself*. Also use it for "what should I
  post", "turn this into a post", "write something about X for LinkedIn",
  "schedule the next few weeks", or any request to move an idea from
  tools/linkedin/ideas.md into the queue. It carries a hard no-transmit rule, a
  religious-register rule that keeps the feed professional, a
  never-invent-a-fact rule, and a fold-and-character budget that silently
  breaks a post if ignored.
---

# LinkedIn — the Measures feed

## What this feed is for

Two things earn, and only two. **Subscribers to Proof Over Promise**, which is
the asset that compounds, and **speaking, teaching and guest-lecturing
invitations**, which arrive because someone forwarded a post to a program chair
or a head of L&D. Every post is written to serve one of those. Nothing here is
written to attract a recruiter, and nothing is written to sell an advisory hour.

That single decision settles most format questions. A post that would perform
well and cannot be forwarded to a program chair is the wrong post.

## The hard rules

These are not style. Breaking one is a defect.

**1. Never post. Never send.** Safeguard 4 in `AGENTS.md`: draft freely,
transmit nothing. That covers publishing a post, a comment, a reply, a DM, a
connection note, and scheduling anything through a third-party tool. Approval
to draft is not approval to publish, and approval for one post is never
approval for the next. Write the file, tell him it is ready, stop.

**2. Never invent a fact.** Not a date, a title, an employer, a credential, a
metric, a client, a citation, or an outcome. If a post needs a number that is
not in the source material, write `[UNVERIFIED: what is missing]` inline and
keep drafting. Do not round, do not approximate, do not reach for "roughly" to
make a sentence land. The feed's entire argument is that a claim is worth what
its evidence is worth — a fabricated line here costs more than it would in
almost any other feed.

**3. Nothing private, and remember what "private" means here.** No client
names, no employer-internal detail, no participant data (IRB-25-0462), no
family, no legal matters, no medical history, no addresses. The live Mīzān
instrument under `mizan/` is `noindex` and unlinked; **never link it from a
post and never screenshot real data out of it.** Posts point at
`instrument.html`, the public case study, which was built for exactly this.

**4. The tradition is the origin of an idea, never the authority for a
claim.** This is the rule that keeps the feed professional, and it is the one
most easily lost. Iqbal, the Qur'an and the seven measures supply the *concept*.
The evidence for any assertion is the audit experience, the regulatory record,
or the research — never the scripture. Write every post so that a reader who
skips the Arabic entirely still gets a complete governance argument. If
deleting the citation would leave a hole in the reasoning, the post is
preaching and needs rebuilding. See `references/register.md`.

**5. One post, one argument.** If a draft carries two, it is two posts. This is
the most common failure and it always feels like generosity at the time.

## Cadence

Two per week, Tuesday and Thursday. That is the committed rate and the queue is
built to it. An empty pipeline is worse than a slow one, so never raise the
cadence to fill a good week — bank the surplus in `tools/linkedin/queue/`
instead.

Roughly, across any four posts: two from the Measures series, one from the
working record (something he actually did, built, or found), and one response
to a live regulatory or research development. A feed that is only philosophy
reads as a devotional. A feed that is only news reads as an aggregator.

## Where the work lives

```
tools/linkedin/
  ideas.md            the bank — every idea, unranked, cheap to add
  queue/              drafts, numbered, one file per post
  posted.md           the ledger — what shipped, when, and what it did
  draft_post.py       drafting tool, writes to disk and stops
```

`ideas.md` is the "bump into ideas" surface. Adding to it should cost one line
and no ceremony. Promoting an idea into `queue/` is where the work happens.

**Everything in that directory is public.** `tools/` is not linked from the
site, but Safeguard 1 is explicit that unlinked is not private. Write every
idea, every draft and every note in it as though a recruiter, a regulator and a
program chair will read it — because the moment it is committed, they can.

## Writing a post

`tools/newsletter/voice.md` is the governing voice document for all of his
published writing. **Read it first.** This skill does not replace it; it
records the handful of places where LinkedIn's format forces a deviation, and
those are in `references/voice-delta.md`.

The short version of the delta: `voice.md` bans "LinkedIn cadence" — one line
per paragraph, "Here's the thing:", rhetorical questions as section breaks.
That ban stays. What is permitted is **short paragraphs with blank lines
between them**, because a wall of text on a phone does not get read. The
distinction is real and worth holding: line breaks for legibility are a
typographic concession, and line breaks used *as a substitute for an argument*
are the thing being banned. One-sentence paragraphs are allowed. A stack of
six of them, each pretending to be profound, is not.

### The order of construction

1. **Find the finding.** What is the one thing the reader did not know, or knew
   but had not had named? If there is no finding, there is no post. Do not
   start writing to see what turns up.
2. **Write the first 200 characters last, and write them hardest.** They are
   all that shows before the fold. See `references/platform.md`.
3. **Build the body around the record.** Concrete before abstract, per
   `voice.md`. Name the control, the document, the moment, the year.
4. **End on the open question, not the summary.** The feed is named after a
   standard. A post that closes by restating itself has stopped meeting it.
5. **Place the call to action.** Almost always Proof Over Promise. Never more
   than one.
6. **Run the checklist** in `references/checklist.md` before calling it done.

## References in this skill

| File | Read it when |
| --- | --- |
| `references/platform.md` | Character budgets, the fold, links, hashtags, carousels, comments |
| `references/voice-delta.md` | Anything about how the writing sounds on this platform |
| `references/register.md` | Any post touching the tradition, khudī, Iqbal, or the measures |
| `references/series-measures.md` | Working on the life-theories series or planning the calendar |
| `references/checklist.md` | Before declaring any draft finished |

## When you are asked to "just write a post"

Ask what the finding is, if it is not obvious from the request. One question,
not a menu. If he supplies source material, draft from it and mark every gap
`[UNVERIFIED: ...]`. If he supplies nothing, pull the next unqueued item from
`references/series-measures.md` and say which one you took and why.

Then write it, save it into `tools/linkedin/queue/`, and report the character
count against the fold and the 3,000-character ceiling. Do not paste the whole
draft into chat and also write the file — the file is the deliverable.
