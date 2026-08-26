# LLM-reliance risk register

The failure modes of professional judgment assisted by a language model, written
as an audit register rather than an essay.

This is the piece that travels. The research question behind it is specific to
audit, but the register applies anywhere a qualified reviewer receives an answer
before forming their own — credit, underwriting, legal review, medical triage,
examination work.

## How to read it

**Exposure** — how much of the judgment is affected when it occurs.
**Detectability** — how likely the failure is to be noticed by normal review.
Both on 1–5, low to high. **Residual** is exposure weighted by inverse
detectability: a failure nobody can see is worse than a bigger one that is
obvious.

This scoring reuses the measure-and-weight pattern already running in `mizan/`.
It is deliberate — the same arithmetic, pointed at a different subject.

---

| # | Failure mode | Definition | Observable indicator | Exp. | Det. | Residual |
|---|---|---|---|---|---|---|
| 1 | **Anchoring** | The first value or conclusion seen constrains the final judgment, which adjusts insufficiently away from it | Final conclusions cluster near the model's initial output regardless of evidence quality | 5 | 2 | **High** |
| 2 | **Sycophancy** | The system affirms the position the user already holds, and does so most where pushback is most needed | Model agreement rate rises after the reviewer states a view; disagreement is rare and shallow | 5 | 1 | **Critical** |
| 3 | **Automation bias** | Machine output is trusted over the reviewer's own analysis; errors of omission and commission both rise | Review notes cite the tool rather than the evidence; contradictory source material goes unremarked | 4 | 2 | **High** |
| 4 | **Epistemic drift** | The standard of what counts as sufficient evidence quietly moves toward what the model reliably produces | Scope narrows to questions the tool answers well; unanswerable questions stop being asked | 4 | 1 | **Critical** |
| 5 | **Deskilling** | The reviewer's independent capability degrades through disuse | Junior staff cannot perform the judgment unassisted; review time falls without a fall in defects found | 3 | 2 | **Moderate** |
| 6 | **Fluency-as-quality** | Confident, well-formed prose is read as well-founded analysis | Output quality judged on presentation; citations unverified because the surrounding text reads well | 4 | 2 | **High** |

---

## The two critical rows

**Sycophancy and epistemic drift score critical for the same reason: near-zero
detectability.** Neither produces an artefact. An anchored number can be compared
against an independent estimate. A reviewer whose standard of sufficiency has
moved has nothing to compare against, because the thing that moved is the
yardstick.

That is what makes this a controls problem before it is a technology problem.
Ordinary review cannot catch a failure whose signature is the absence of an
objection.

## Controls

| Failure mode | Control that actually bites |
|---|---|
| Anchoring | Reviewer records their own conclusion **before** the model output is displayed. Sequence is the control; anything after is mitigation |
| Sycophancy | Adversarial prompting as standing procedure — require the case against, from the same model, on every material judgment |
| Automation bias | Sampled independent re-performance without the tool; compare defect rates, not throughput |
| Epistemic drift | Track the questions asked over time, not only the answers. A narrowing scope is the leading indicator |
| Deskilling | Periodic unassisted work as a competency check |
| Fluency-as-quality | Citation verification mandatory and separately signed off |

The first row is the one that matters most and the one most often skipped: **the
order of operations is the control.** Once the answer has been seen, no amount
of care fully undoes the anchor.

## What this register cannot do

- **It is not empirically calibrated.** Exposure and detectability are reasoned
  estimates, not measurements. They mark where to look. Treating them as
  findings would repeat the fluency-as-quality error the register itself lists.
- **It does not distinguish the model from its deployment.** Most of these
  failure modes are properties of how a tool is placed in a workflow, not of the
  tool.
- **The scoring is ordinal.** Residual ranks; it does not quantify.

## Mapping to the research

Rows 1, 2 and 4 are the ones the dissertation touches. Each proposition surviving
the qualitative phase should be tagged to the row it speaks to, so that the
register and the instrument stay in correspondence rather than drifting into two
separate accounts of the same problem.

## Citation

Tversky & Kahneman (1974); Kahneman, Slovic & Tversky (1982); Parasuraman &
Riley (1997); Skitka, Mosier & Burdick (1999); Perez et al. (2022); Sharma et
al. (2023). See `../BIBLIOGRAPHY.md`.
