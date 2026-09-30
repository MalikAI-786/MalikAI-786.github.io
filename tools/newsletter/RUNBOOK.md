# The weekly run — runbook for any agent

This is the weekly newsletter run written so that **any** agent can execute it:
Claude, Codex, ChatGPT, or a person. It is the same procedure the
`newsletter-weekly` skill describes; this file is the model-agnostic copy, and
it is the one an automated harness should hand to whatever model it runs.

Read first, in this order: root `AGENTS.md` (safeguards), `voice.md`,
`format.md`, `heuristics.md`, `review.md`, `topics.md`. Do not work from this
file alone.

---

## Part 1 · The run

**Roles.** Two of the steps below name agents that exist as Claude agent
definitions. They are procedures, not magic — any model performs them by
reading the definition and following it:

| Named role | Where it is defined | What it actually is |
|---|---|---|
| the record check | `.claude/agents/malik-record.md` | Every biographical or professional claim about Yasir sourced to a live public page (`index.html`, `linkedin.html`) or removed. Answers "can I say this?" with yes plus a source, or no. |
| the editor | `.claude/agents/newsletter-editor.md` + `voice.md` as system prompt | Drafts against the voice, the format and one named heuristic. |

**Steps.**

1. **What shipped.** `git log --oneline origin/main -10` and `ls insights/`.
   Never repeat a published topic.
2. **Pick.** Next unblocked item in `topics.md`, unless the week has a clearly
   better issue. Never from that file's "Not yet" list.
3. **Verify before drafting.** Facts about Yasir through the record check.
   Every citation against the publisher record or the live regulatory text —
   never memory. `heuristics.md` carries verified citation forms and an
   explicit "do not assert" list; both are binding. A citation that cannot be
   verified is removed, not softened.
4. **Name one heuristic** from `heuristics.md`. It must explain *why* the
   failure in the issue happened. If none fits, the item is an opinion — cut it.
5. **Draft.** Two items. Question as header. One checkable number per item.
   1,200–1,800 words. Voice per `voice.md`, container per `format.md`.
6. **Gate.** Run `review.md` in order. Section A is pass/fail. Record the
   verdict naming the check: `GATE: PASS · A1-A8 clear · B: B5 noted` or
   `GATE: FAIL · A4 — citation unverified`. "Needs work" is not a verdict.
7. **Build the field note.** Self-contained HTML in `insights/`, matching
   `insights/proof-passed-what-certified.html`: `../assets/brand/tokens.css`
   and `../intake/intake.css`, `<p class="eyebrow">Field note · DD Month
   YYYY</p>`, `<h1>`, `<p class="intro">` carrying the one-sentence thesis,
   `<h2>` question headers, footer with the drafting-assistance disclosure
   intact. Point the "Read the latest field note" links in `newsletter.html`
   and `index.html` at it; keep older notes reachable.
8. **Invariants.** `python3 tools/audit/invariants.py`. Fix by changing a
   generator, never a generated file.
9. **Branch and push.** `claude/newsletter-<slug>` (or `codex/newsletter-<slug>`
   — the prefix names the executor) off current `main`. Plain `git push -u`.
   **Never force-push.**
10. **Open the PR, and request review from `MalikAI-786`.** The review request
    is what makes GitHub email him. If no PR tool is available, the pushed
    branch is still the deliverable — report the compare URL:
    `https://github.com/MalikAI-786/MalikAI-786.github.io/compare/main...<branch>?expand=1`
11. **Deliver.** The final message is the briefing, in exactly this shape:

    ```
    <Issue headline>
    <One-sentence thesis.>

    Number: <the hard number>
    Heuristic: <which one, and why it fits>
    Gate: <verdict, naming the check>
    Read it: <PR or compare URL>

    Needs you: <the decision, or "nothing — merge when you have read it">
    ```

**Where it stops.** At the open PR. No merge, no mail sent, no LinkedIn post,
no Substack. Root `AGENTS.md` safeguard 4: Yasir publishes, every time. A
harness that structurally cannot publish is the design, not a limitation.

**A quiet week is a valid outcome** and it is still delivered, in the same
shape: what was considered, why it did not clear the bar, what would unblock
the queue. Never pad an issue to fill the slot.

### Known failure modes of unattended runs — from run 1, 21 September 2026

The first scheduled Claude run fired on time, wrote for six minutes, reported
success, and pushed nothing. Evidence: session ended in a review-ready state,
no branch reached `origin`, notification unread. The lesson is not about the
model. It is about the harness:

- **An unattended session cannot answer a permission prompt.** Any step that
  might prompt — a push, a network call, a destructive-looking command —
  stalls the run silently. The harness must run where those steps are
  pre-authorized, or the run must end with everything written to the branch
  *before* any step that could prompt.
- **Cloud routines here carry no connectors.** No GitHub API tool, no mail.
  Plain `git` over the environment's credentials is the only reliable channel
  to the repo, and the final message is the only reliable channel to Yasir.
- **A "success" status is not delivery.** Success meant the process exited.
  The run had produced nothing he could read. Count a run as delivered only
  when a branch exists on `origin` and a review request has been sent.

---

## Part 2 · A harness ChatGPT can execute

The question is not "which model" — Part 1 is model-agnostic. The question is
**where the schedule and the credentials live**, because that is where run 1
failed. Two options; the first is the recommendation.

### Option A — GitHub Actions is the harness, the model is a parameter (recommended)

The schedule is a cron in the repo. The push credential is the workflow's
`GITHUB_TOKEN`. There are no permission prompts. The model is called over an
API with the runbook as its instructions, and the model *can be OpenAI's* —
that is the whole point of this option.

```
.github/workflows/newsletter-weekly.yml   cron: Mondays 14:00 UTC
tools/newsletter/run_weekly.py            the runner (model-agnostic)
tools/newsletter/gate.py                  deterministic checks, no model
```

**The runner** (`run_weekly.py`) does, in order: read the governing files;
call the model with Part 1 as instructions and the repo files as context,
using the provider's web-search tool so step 3 (verification) is real and not
memory; write the field note and link updates; run `gate.py`; commit to
`codex/newsletter-<slug>`; open the PR with the briefing as its body; request
review from `MalikAI-786`. Provider is a switch: `OPENAI_API_KEY` +
`OPENAI_MODEL`, or `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`. The existing
`draft_issue.py` is the Anthropic half already written; the OpenAI half is the
same shape against the Responses API with the web-search tool enabled.

**The gate script** (`gate.py`) is the part a model cannot be trusted to run
on itself. It fails the workflow if any of these is false:

- word count of the article body is within 1,200–1,800
- the drafting-assistance disclosure line is present, verbatim
- no string from a forbidden list appears: the retired Substack domain, "peer-reviewed", "validated", "replicated" unless within a sourced sentence, any IRB-25-0462 participant reference
- every `href` in the note resolves (relative to `insights/`)
- `python3 tools/audit/invariants.py` passes
- the PR body contains `GATE: PASS`

A gate failure produces a PR anyway, titled `GATE FAIL — <reason>`, so the
failure is delivered rather than lost. That is the difference from run 1.

**Delivery.** The review request. GitHub emails the repo owner when review is
requested; no connector is involved. That works for every model.

**What Yasir does once.** Add `OPENAI_API_KEY` as a repository secret
(Settings → Secrets → Actions). Never in a file — root `AGENTS.md` safeguard 3,
and `invariants.py` will catch a `.env`. Optionally a ChatGPT scheduled Task
on Monday afternoon: "open the newsletter PR and read it" — a reminder, not a
producer.

### Option B — Codex runs Part 1 directly against the repo

Codex reads `AGENTS.md` files natively, so `tools/newsletter/AGENTS.md`
pointing here is enough for it to find the runbook. A Codex cloud task with the
prompt "Execute `tools/newsletter/RUNBOOK.md` Part 1" produces a branch and a
PR through Codex's own GitHub integration.

What to check before relying on it: whether Codex on the current plan can run
this **on a schedule** without a person starting it, and whether its
environment permits outbound web access for step 3. If either is no, Option B
degrades to "a person starts it on Monday," which is still fine — and Option A
remains the automated path.

Option B is also the right way to **build** Option A. The first Codex task is
not "write the newsletter." It is:

> Read `tools/newsletter/RUNBOOK.md`. Implement Part 2, Option A: the workflow,
> `run_weekly.py` with an OpenAI provider using the Responses API and web
> search, and `gate.py` with every check listed. Do not touch `voice.md`,
> `format.md`, `review.md`, `heuristics.md` or `topics.md`. Never add a merge
> or send step. Open a PR; do not merge it.

### Acceptance — how we would know it works

1. Run the workflow manually (`workflow_dispatch`) once, before trusting the
   cron. A branch appears on `origin`, a PR opens, a review-request email
   arrives. All three, or it is not working.
2. Break it on purpose: plant a forbidden string in a test draft and confirm
   the gate fails and the failure still arrives as a PR.
3. Watch two consecutive Mondays. Only then remove the manual reminder.

### What stays the same under either option

- Every safeguard in root `AGENTS.md`, especially 3 (no secrets in the repo),
  4 (never publish as him) and 5 (never invent a fact about him).
- The gate. `review.md` for the model's self-check; `gate.py` for the checks
  that must not depend on the model's honesty.
- Yasir merges. The harness ends at a PR with a review request, and the cost of
  getting that wrong is the reason the newsletter exists.
