# Platform mechanics

Two kinds of statement live in this file and they are kept apart on purpose.

**Limits** are enforced by the composer. They are checkable, and a draft that
breaks one is broken.

**Conventions** are the folklore of the platform — widely repeated, not
documented by LinkedIn, and not verified by anyone here. They are recorded as
defaults to operate under, and they are labelled as untested. This feed is
named after a standard that says a claim is worth what its evidence is worth.
It would be an embarrassment to run it on unexamined advice, so `posted.md`
carries a column that turns each convention into something the ledger can
eventually answer.

---

## Limits

| Field | Budget | Source |
| --- | --- | --- |
| Post body | 3,000 characters | Composer limit |
| Headline | 220 characters | Enforced; matches the counter in `linkedin.html` |
| About | 2,600 characters | Enforced; matches the counter in `linkedin.html` |
| Comment | 1,250 characters | Composer limit |
| Document post (PDF) | Uploaded as a file; page count varies by upload | Composer |

Character counts drift as LinkedIn ships changes. If a draft is anywhere near a
ceiling, verify it in the live composer before publishing rather than trusting
this table.

## The fold

Only the opening of a post shows before `…see more`. How much depends on
viewport, device and whether the post carries media, and it has changed more
than once.

**Operating budget: the first 200 characters must carry the whole hook.**
That is deliberately more conservative than the widest reported cut. A post
that works at 200 works everywhere; a post tuned to the widest desktop crop
loses its opening on a phone, which is where most of the audience reads.

Practical consequences:

- The first sentence states the problem or the finding. Never the author, never
  the setup, never "I have been thinking about…".
- **The text before the first line break must itself be a complete, working
  hook.** A break inside the budget is fine — good posts usually have one — but
  it becomes the effective truncation point on some layouts, so everything
  before it has to stand alone. Treat the first paragraph as the real hook and
  the 200 characters as the outer bound.
- The hook must make sense as a complete thought. If it ends mid-argument the
  reader has been given a cliffhanger, and manufactured suspense is banned by
  `voice.md`.
- Write them last. The hook is a compression of the finished argument, and it
  cannot be compressed before it exists.

## Structure that survives a phone

- Paragraphs of one to three sentences, blank line between. See the voice delta
  — this is legibility, not cadence.
- No more than one list per post, and only for genuinely enumerable facts.
  Three sentences beat three bullets whenever the content is reasoning.
- Nothing that depends on indentation, tabs or a table. The composer strips
  formatting, including bold and italic. Anyone pasting Unicode pseudo-bold is
  breaking screen readers to gain nothing; do not do it.
- Em dashes are already discouraged by `voice.md`. On a narrow column they also
  wrap badly. Use a full stop.

## Links

**Convention, untested:** a post carrying an external link in its body reaches
fewer people than the same post with the link in the first comment.

Operating default: **link in the first comment**, and reference it in the body
in plain words — "the full case study is in the first comment" — so the reader
is not hunting. Write the first comment as part of the draft, in the same file.
It is not an afterthought and it is where the newsletter conversion actually
happens.

One link. A post with three links converts on none of them.

## Hashtags

Three, at the end, after a blank line. Lowercase-joined words, no camel case
unless the term is normally written that way.

The steady set, which should not drift post to post, because consistency is the
point of a tag: `#AIGovernance` `#ModelRisk` `#InternalAudit`. Swap at most one
for something the specific post has earned — `#NISTAIRMF`, `#ISO42001`,
`#OperationalResilience`.

No `#motivation`, no `#leadership`, no `#mindset`. Those tags deliver an
audience this feed is not written for, and their arrival will distort every
reading of the ledger.

## Media

| Format | Use it when |
| --- | --- |
| Text only | The default. Most Measures posts are text. |
| Single image | There is a real artefact to show — a chart, a page, a mark. Not a stock photo, ever. |
| Document post (PDF) | The argument is genuinely sequential and has 5–10 beats. Built from the brand system, never from a template. |
| Video | Only for a recorded talk or lecture excerpt. Nothing filmed to camera for its own sake. |

An image that adds nothing costs more than it gives: it displaces the text
crop on some layouts and it makes the post look like everything else in the
feed. The typographic restraint *is* the differentiator here.

## Comments

Replies to comments are drafted like posts and transmitted like posts — which
is to say, never, by anything in this repository. Draft them into the post's
own file under a `## Replies` heading if he asks for them.

Answering a comment substantively is worth more than another post. A serious
question in a comment thread is the highest-value writing surface on the
platform and the one most often wasted on "Great point, thanks for sharing".

## Timing

Tuesday and Thursday, morning Eastern. Held constant on purpose: a fixed
schedule is the only way the ledger can attribute a change in performance to
the post rather than to the hour.

## What the ledger is testing

`tools/linkedin/posted.md` records, per post: the date, the series item, the
format, whether the link was in the body or the first comment, and the observed
result. After roughly twenty posts that is enough to say something about the
conventions above instead of repeating them. Until then they are defaults, and
they are labelled as defaults everywhere they appear.
