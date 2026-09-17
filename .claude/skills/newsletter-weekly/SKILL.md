---
name: newsletter-weekly
description: >-
  Use for the weekly newsletter run, drafting or editing an issue, picking the
  next topic, naming the heuristic an issue turns on, or publishing a field note
  to insights/. Drafts and opens a PR; never sends, posts or merges. Trigger on
  newsletter, issue, field note, weekly run, insights, Substack or LinkedIn
  syndication.
---

# The weekly newsletter run

- Source: `tools/newsletter/` — `voice.md` (how it sounds), `format.md` (how it is built), `heuristics.md` (the spine), `review.md` (the gate), `topics.md` (the queue). Read them; do not work from this file alone.
- Evidence status: PROCEDURE. The cadence and the gate are Yasir's own decisions, recorded in `format.md` and `review.md`. The heuristics catalogue is sourced literature; the audit applications in it are inference and say so.
- Problem solved: his own record, 3 August 2026 — *the bottleneck is the send step, not discovery.* Ten runs of good output, near-zero submissions. A weekly run with a named gate produces a decision every week instead of an open question.
- Trigger: the weekly schedule, or any request to draft, edit, gate or publish an issue.
- Inputs: the topic (from `topics.md` or the week's event), verified facts, one heuristic from `heuristics.md`, one checkable number per item.

## Procedure

1. **Pick the topic.** Next unblocked item in `topics.md`, unless something in the week is better. Do not pick a topic in the file's "Not yet" list.
2. **Verify before drafting.** Every fact about Yasir goes through the **malik-record** agent. Every framework citation is checked against the live text — not memory, not this file. A4 in `review.md` is the most expensive check to fail.
3. **Name the heuristic.** One per issue, from `heuristics.md`. The heuristic is the explanation, not decoration: it says *why* the failure in the issue happened. If no heuristic fits, the item is probably an opinion.
4. **Draft.** Use the **newsletter-editor** agent with `voice.md` as the system prompt and `format.md` as the container. Question-as-header. Two items. One hard number each. 1,200–1,800 words.
5. **Run the gate.** `review.md`, in order. Section A is pass/fail. Write the verdict in the handback note, naming the specific check: `GATE: PASS · A1-A8 clear · B: B5 noted` or `GATE: FAIL · A4 — citation not verified against live text`. "Needs work" is not a verdict.
6. **Build the field note.** Published issues are self-contained HTML in `insights/`, matching `insights/before-we-automate.html`: `tokens.css` + `intake/intake.css`, `<p class="eyebrow">Field note · DD Month YYYY</p>`, `<h1>`, `<p class="intro">` carrying the one-sentence thesis, `<h2>` question headers, and the footer disclaimer kept intact.
7. **Open a PR. Stop there.** Link the gate verdict in the body. Draft the LinkedIn post as a separate block in the PR body so it is ready but unposted.
8. **Hand back.** Report: topic, heuristic named, gate verdict, PR link, what is still unverified.

## Where it stops

**It drafts. It does not publish.** No merge, no send, no LinkedIn post, no Substack, no scheduler — root `AGENTS.md` safeguard 4. Publishing is a decision, and the most reliable way to honor that is a routine that structurally cannot make it. Yasir merges the PR and posts to LinkedIn himself, every time.

## The harness

The run is automated. Config, recorded here so it can be rebuilt if it is ever lost:

| | |
|---|---|
| Routine | `trig_01HZQENNnJP2Xg2BQNYQFUTL` — "Weekly newsletter — draft, gate, deliver to Yasir" |
| Schedule | `0 14 * * 1` — Mondays, 14:00 UTC (7am Pacific, 10am Eastern) |
| Mode | Fresh session each firing. No memory of previous runs, so the prompt is self-contained and the repo is the only state. |
| Delivery | Push and email notification on completion |

**Step 12 of the routine prompt is the actual deliverable.** Connectors are not available to routines on this organization, so a fired session has no Gmail, no Notion and no way to mail anything. What reaches Yasir is the completion notification, and a notification carries the run's final message. That makes the final message the newsletter briefing rather than a status report, and it is why the prompt specifies its shape down to the line breaks:

```
<Issue headline>
<One-sentence thesis.>

Number: <the hard number>
Heuristic: <which one, and why it fits>
Gate: <verdict, naming the check>
Read it: <PR or compare URL>

Needs you: <the decision, or nothing>
```

Ten seconds should be enough to decide whether to open it now or at the weekend. A run that buries that under an account of its own process has not delivered, however good the draft is.

If connectors ever become available, add Gmail from the claude.ai routines interface and the prompt's step 11 starts working — it creates a **draft**, never a send.

## On the cadence

The **run** is weekly. The **promise** is whatever Yasir has publicly committed to, which is currently nothing — `newsletter.html` says email subscriptions are not yet available, so there is no cadence to break. Keep those separate. A weekly routine that reliably produces a reviewed draft is a different object from a weekly publishing commitment, and only the second one can fail in public. Do not add a cadence claim to the site without his explicit say-so.

If a week produces nothing worth shipping, that is a valid outcome. Record it and move the queue. A skipped week with a reason beats a thin issue, and `format.md` is explicit that two strong items beat five weak ones.

## Verification

- `python3 tools/audit/invariants.py` passes before the PR opens.
- The field note renders: no broken `../assets/` paths, no missing stylesheet, no horizontal scroll on mobile.
- Every number in the issue is traceable to a source in the PR body.
- Nothing generated was hand-edited — change the generator and re-run.

## Failure modes

- **Drafting before verifying**, then keeping a sentence because it reads well.
- **Upgrading the research.** The completed study is feasibility, **not** validation. The AI-and-judgment work is **in development** — a question, never a result.
- **Letting the gate become a formality.** An agent never clears its own draft to publish.
- **Naming a heuristic that does not fit**, to satisfy step 3. Cut the item instead.
- **Publishing a claim about markets or the research instrument** without the educational-use disclaimer intact.
- **Treating a weekly run as a weekly obligation to publish** — that is how the schedule becomes the thing that fails.

## Safety and privacy

No examination material. No client or employer specifics. No participant data from IRB-25-0462 — not a response, not a paraphrase. No account-level financial detail; his real positions stay out pending an explicit disclosure decision. Drafts in `tools/newsletter/drafts/` are gitignored and stay that way.

## Related skills

`dba-research` when the issue touches the study or the bias literature. `brand-design` for the field note's visual treatment. `repo-governance` for branching and the PR. `professional-communications` if the run produces outreach. `source-ingestion` when an issue is built from something Yasir sent in.
