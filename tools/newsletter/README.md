# The newsletter — drafting tool, archive and sign-up

## Sign-up and visit tracking — what to configure

The site is static, so it cannot store an email address or count a visit by
itself. `newsletter.html` has one config block at the top of `<body>`:

```js
window.NEWSLETTER = {
  substack:    "",   // publication subdomain → embeds yasiramalik.substack.com/embed
  formAction:  "",   // or a POST endpoint that takes {email}: Buttondown, Beehiiv
  goatcounter: ""    // GoatCounter site code → visit counts, no cookies, free
};
```

Fill in whichever exists. These are public identifiers, not secrets — the
embed exposes the same thing — so they belong in the page, not in a `.env`
(which `invariants.py` would reject anyway). While all three are empty the
form still works: it opens an email to Yasir with the address in the body,
and the page says so plainly rather than pretending a list exists.

- **Substack** (the plan): create the publication, put its subdomain in
  `substack`. The two forms are replaced by Substack's own embed, so the
  double opt-in, the unsubscribe link and the subscriber count are theirs.
- **Buttondown / Beehiiv**: paste the embed-subscribe URL in `formAction`.
- **Visits**: create a site at goatcounter.com, put the code in `goatcounter`.
  It records page views and referrers (so a LinkedIn post can be seen landing),
  sets no cookies, and needs no consent banner. The LinkedIn post links carry
  `?utm_source=linkedin` for the same reason.

What gets counted, per issue, lives in `format.md` ("What gets counted"):
subscribers, net new, open rate, LinkedIn comments, replies to the correction
invite. Record them from the provider's dashboard, never estimated.

## The archive

`make_archive.py` rebuilds the issue list on `newsletter.html` from the notes
in `insights/` — date from the eyebrow, title, thesis, and the `thread` and
`heuristic` meta tags. Run it after adding a note; `invariants.py` fails if
the block is stale or hand-edited. Notes dated in the future are hidden by the
page until their date, so a batch can merge once and surface one a week.

---

## Drafting tool

Drafts an issue from source material in the newsletter's own voice. It writes a
markdown file and stops there: **it does not post, publish, email, or touch
Substack.** Sending stays with you, deliberately.

Not part of the website. Nothing here is served.

## Setup

```bash
pip install anthropic
export ANTHROPIC_API_KEY=...        # or run `ant auth login` once
```

## Use

```bash
./draft_issue.py notes.md
./draft_issue.py notes.md transcript.txt --words 1200 --title "What the walkthrough found"
```

The draft streams to your terminal as it is written, then lands in `drafts/`
as `YYYY-MM-DD-slug.md`. That directory is gitignored — this repo is public and
serves from `main`, so drafts stay local until you decide otherwise.

| Flag | Default | |
|---|---|---|
| `--words` | 900 | Target length. Guidance, not a hard cap. |
| `--title` | — | Working title. Claude will propose a better one if it has it. |
| `--out` | `./drafts` | Where the file lands. |
| `--effort` | `high` | `low` … `max`. Raise for a hard piece, lower for a quick pass. |

## The voice lives in `voice.md`

Not in the script. It is the system prompt, reloaded on every run — edit it and
the next draft changes. It was derived from published work: the copy on
`index.html`, the design argument in `tokens.css` and `brand.html`, and the
public LinkedIn profile. It asserts no biographical facts, on purpose.

If drafts start sounding generic, fix `voice.md` rather than arguing with the
output. The two things that move it most are the quoted exemplar sentences and
the "What the voice is not" list.

## The rules it carries

Four constraints are written into `voice.md` and are not stylistic:

1. **Never invent a fact** — no date, title, employer, credential, metric,
   citation, or finding. Anything missing comes back as `[UNVERIFIED: ...]`
   inline and is collected under a `## Gaps` heading at the end of the draft.
   **Read that section first.**
2. **Never overstate the research** — nothing is peer-reviewed, replicated, or
   concluded unless the source material says so and cites it.
3. **Nothing private** — no account numbers, addresses, identity documents, legal
   matters, medical history, tenants, or family. Anything dropped under this rule
   is named in `## Gaps`.
4. **Draft, never send.**

## Notes

Runs `claude-opus-5` with adaptive thinking. The voice spec is sent as a cached
prefix, so the second and later issues re-read it at roughly a tenth of the cost
— the run prints how many input tokens were cached.

`USE_REFUSAL_FALLBACK` at the top of the script opts into Anthropic's recommended
fallback model if the request is declined by a safety classifier. If your account
does not have that beta enabled the request will 400 — set it to `False`.
