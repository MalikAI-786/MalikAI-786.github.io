# Proof Over Promise — drafting tool

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
