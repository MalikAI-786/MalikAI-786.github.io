# The heuristics

`voice.md` says how it sounds. `format.md` says how it is built. This says what
each issue is **about underneath** — the cognitive shortcut that explains why
the failure in the issue happened.

Every issue names one. Not as decoration, and not as a psychology lecture: the
heuristic is the mechanism. An issue that describes a control failure without
naming what made competent people miss it has reported an incident rather than
explained one.

This is also the bridge to the doctoral work. The research question — when an AI
system produces the analysis, does the reviewer still review it? — is a question
about heuristics operating on a new kind of input.

---

## How to use this file

1. **One heuristic per issue.** Two is a lecture. Zero is an anecdote.
2. **Name it in the text.** The reader should be able to say which one it was.
3. **It has to fit.** If the heuristic has to be argued into place, the item is
   probably an opinion with a header. Cut the item, not the standard.
4. **Keep the two claims separate.** What the literature established, and what
   it looks like in an audit file, are different assertions. The first needs a
   citation. The second is his own inference from fifteen years of findings and
   should read as such — "what I think this looks like in practice," never "the
   research shows."

That separation is the whole editorial standard applied to the newsletter's own
argument. A piece that blurs it is doing the thing it is objecting to.

---

## 1 · Anchoring and adjustment

**The shortcut.** An initial value captures the estimate, and adjustment away
from it is insufficient — even when the anchor is known to be arbitrary.

**In the seat.** *(Inference.)* This is the one his research is pointed at. When
an analysis arrives already formed, it is not the starting point for a review.
It is the anchor the review adjusts from. The reviewer who would have
independently concluded "inconclusive" concludes "broadly reasonable, with
exceptions" — the exceptions being the adjustment, and the adjustment being too
small.

The AI case is the sharpest version because the anchor arrives fluent,
complete, and without a visible author to argue with.

**The tell.** The conclusion in the working paper is a near-paraphrase of the
tool's output, with hedging added. Look at what changed between the machine's
answer and the signed one. If the only difference is softer language, nobody
reviewed anything.

**The counter-move.** Form the estimate first, write it down, then open the
tool. An anchor you recorded before seeing theirs is the only evidence you were
not moved by it. This is cheap, and almost nobody does it.

## 2 · Automation bias

**The shortcut.** Reliance on an automated aid displaces vigilance, in two
distinct shapes: acting on a wrong automated cue, and failing to act on
something the automation did not raise.

**In the seat.** *(Inference.)* The second shape is the expensive one and the
one that never shows up in a finding. An exception report with no exceptions
ends the inquiry. Nobody writes a memo about the thing the model did not flag,
because there is no artifact to write it about.

**The tell.** Every finding in the file originated inside the tool. A population
the tool cleared has no testing on it at all. Ask when the team last opened
something the system passed.

**The counter-move.** Sample what it cleared, not only what it flagged. The
cleared population is where automation bias lives, and it is almost never in the
sampling plan.

## 3 · Fluency

**The shortcut.** Ease of processing is read as a signal of truth. Material that
is easy to take in feels more likely to be correct, independent of whether it is.

**In the seat.** *(Inference.)* This is the specifically new problem. Previous
generations of bad analysis announced themselves — they were badly organized,
internally inconsistent, hedged into incoherence. A language model produces
prose that is well-structured, confident and correctly formatted whether or not
the substance holds. The usual early-warning signal for weak work has been
decoupled from the weakness.

A hedged correct answer now reads as weaker than a confident wrong one. That is
a reversal, and it is not one the profession has adjusted to.

**The tell.** The reason given for accepting it is about the output rather than
the evidence — "it is thorough," "it is well laid out," "it covers everything."
None of those is a reason.

**The counter-move.** Check one thing at random, all the way down to source.
Not the weakest-looking claim: a random one. What is being tested is the
generator, not the sentence, and a sentence you selected because it looked
shaky tells you nothing about the ones that looked fine.

## 4 · Confirmation

**The shortcut.** Evidence is sought and weighted in the direction of the held
position. Disconfirming evidence is held to a higher standard than confirming
evidence.

**In the seat.** *(Inference.)* Systems trained to be agreeable make this
structurally worse, and they are most agreeable exactly where a reviewer most
needs pushback — on the conclusion the reviewer has already implied. Ask whether
a control is operating effectively and you will tend to receive the case that it
is. The prompt carried the answer.

**The tell.** Read the prompt, not the output. If the question contains its
conclusion, the output is a mirror and should not be cited as corroboration.

**The counter-move.** Require the strongest case against the position, and
require the system to state what evidence would change the answer. An answer
that cannot name its own disconfirming evidence is not an analysis.

## 5 · Availability

**The shortcut.** Frequency and likelihood are judged by how readily instances
come to mind.

**In the seat.** *(Inference.)* Risk coverage drifts toward whatever the tooling
surfaces fluently, because those risks are the ones available when the plan is
written. A risk the system has no good way to describe becomes a risk nobody
raises — not because it was assessed and dismissed, but because it never
reached the table.

**The tell.** Compare this year's risk assessment with the tool's most common
outputs. Convergence is not agreement. It may be an echo.

**The counter-move.** Build part of the plan before consulting the tooling, and
keep that list. What fell off it between the first draft and the final plan is
the question worth asking.

## 6 · The accountability gap

**The shortcut.** *(Weakest literature grounding of the six — treat the label as
his, not the field's, until the reference is settled.)* When a process has more
participants, individual responsibility for the outcome dilutes.

**In the seat.** *(Inference.)* Insert a tool into a review chain and each human
in it can reasonably believe someone else did the checking. The analyst assumes
the reviewer will verify. The reviewer assumes the analyst confirmed the output.
The approver assumes the model was validated. Everyone is being reasonable and
nothing was checked.

This is the governance failure the others roll up into, and the one most likely
to survive a well-run remediation, because nothing in it is anyone's error.

**The tell.** Ask three people in the chain who verified the output. If you get
three different names, none of them their own, that is the finding.

**The counter-move.** Name the accountable reviewer for the output, in the
document, before the work starts. Not the process owner — the person answerable
for that specific conclusion.

---

## Sources

Checked against publisher records 16 September 2026. Cite these forms exactly.
Anything not on this list does not go in an issue.

**Foundational**

- Tversky, A., and Kahneman, D. (1974). Judgment under Uncertainty: Heuristics
  and Biases. *Science*, 185(4157), 1124–1131. doi:10.1126/science.185.4157.1124
  — introduces all three of representativeness, availability and
  anchoring-and-adjustment. The issue number 4157 is part of the citation.
- Nickerson, R. S. (1998). Confirmation Bias: A Ubiquitous Phenomenon in Many
  Guises. *Review of General Psychology*, 2(2), 175–220.
  doi:10.1037/1089-2680.2.2.175

**Automation**

- Mosier, K. L., and Skitka, L. J. (1996). Human decision makers and automated
  decision aids: Made for each other? In Parasuraman and Mouloua (Eds.),
  *Automation and Human Performance: Theory and Applications*. Erlbaum. — this
  is where "automation bias" and the omission/commission distinction come from.
- Skitka, L. J., Mosier, K. L., and Burdick, M. (1999). Does automation bias
  decision-making? *International Journal of Human-Computer Studies*, 51(5),
  991–1006. doi:10.1006/ijhc.1999.0252 — cite for the **evidence**, that people
  using a highly but imperfectly reliable aid made *more* monitoring errors than
  people without one. Do not cite it for the definition.
- Parasuraman, R., and Riley, V. (1997). Humans and Automation: Use, Misuse,
  Disuse, Abuse. *Human Factors*, 39(2), 230–253. doi:10.1518/001872097778543886
  — the terms are **misuse** (over-reliance) and **disuse** (under-reliance).
  Use their words. Writing "over-reliance and under-reliance" and attributing it
  to this paper is the kind of thing this audience notices.

**Anchoring, in auditors specifically**

- Kinney, W. R., Jr., and Uecker, W. C. (1982). Mitigating the Consequences of
  Anchoring in Auditor Judgments. *The Accounting Review*, 57(1), 55–69. — the
  citation for auditors anchoring: on client-provided unaudited book values in
  analytical review, and on even odds in compliance evaluation. **Do not assert
  any specific mitigation result from it** — that half is unconfirmed.
- Joyce, E. J., and Biddle, G. C. (1981). Anchoring and Adjustment in
  Probabilistic Inference in Auditing. *Journal of Accounting Research*, 19(1),
  120–145. doi:10.2307/2490965 — **the evidence here is mixed.** Auditors
  departed from normative benchmarks, but the departures could not consistently
  be attributed to anchoring. Never write "Joyce and Biddle found auditors
  anchor." Also do not confuse it with the same authors' companion 1981 paper,
  *Are Auditors' Judgments Sufficiently Regressive?*

**The analysis that arrives already formed — the closest thing to his thesis**

- Ricchiute, D. N. (1999). The effect of audit seniors' decisions on working
  paper documentation and on partners' decisions. *Accounting, Organizations and
  Society*, 24(2), 155–171. doi:10.1016/S0361-3682(98)00029-4 — seniors' prior
  decisions shape what they document, and partners seeing only that documented
  subset decide in the senior's direction.
- Tan, H.-T., and Yip-Ow, J. (2001). Are Reviewers' Judgements Influenced by
  Memo Structure and Conclusions Documented in Audit Workpapers? *Contemporary
  Accounting Research*, 18(4), 663–678. doi:10.1506/UG8M-8H3D-1GA2-7BYK —
  reviewers are influenced by the preparer's documented conclusion, but rely on
  it **less** when the memo is visibly stylized. **The asymmetry is the finding
  worth building on:** the anchor works best when it looks neutral, which is
  exactly how machine-generated analysis arrives.
- Nelson, M., and Tan, H.-T. (2005). Judgment and Decision Making Research in
  Auditing: A Task, Person, and Interpersonal Interaction Perspective.
  *AUDITING: A Journal of Practice & Theory*, 24(s-1), 41–71.
  doi:10.2308/aud.2005.24.s-1.41 — the review. Note the "s-1" supplement
  designation and the full subtitle.

**Reliance on AI specifically**

The literature here is thinner than it should be. There is no 2024–2026
experiment in a top audit journal on reliance on AI-generated analysis that
verification could find, which is itself worth saying out loud in an issue.

- Commerford, B. P., Dennis, S. A., Joe, J. R., and Ulla, J. W. (2022). Man
  Versus Machine: Complex Estimates and Auditor Reliance on Artificial
  Intelligence. *Journal of Accounting Research*, 60(1), 171–201.
  doi:10.1111/1475-679X.12407 — still the canonical reliance experiment. Cite it
  and date it honestly rather than implying something more recent exists.
- Kokina, J., Blanchette, S., Davenport, T. H., and Pachamanova, D. (2025).
  Challenges and opportunities for artificial intelligence in auditing: Evidence
  from the field. *International Journal of Accounting Information Systems*, 56,
  100734. doi:10.1016/j.accinf.2025.100734 — field evidence, not an experiment.

**Supervisory**

- **SR 26-2, "Revised Guidance on Model Risk Management," 17 April 2026.**
  Interagency, issued with OCC Bulletin 2026-13. **Supersedes both SR 11-7
  (2011) and SR 21-8 (2021).** Most relevant to banking organizations over
  thirty billion dollars in total assets.
  - Effective challenge is "the critical analysis conducted by objective experts
    who evaluate model risk and effect appropriate changes throughout the model
    lifecycle," performed by individuals with appropriate **expertise**,
    sufficient **independence** to maintain objectivity, and the organizational
    **standing and influence** to effect change.
  - **This is a rewrite, not a restatement.** SR 11-7's triad was incentives,
    competence and influence. Any draft still quoting that phrasing as current
    is stale.
  - Validation is now risk-based rather than fixed-cycle, and its quality
    "depends on the rigor and effectiveness of the review rather than on
    organizational structure."
  - `[UNVERIFIED: the reported scope exclusion for generative and agentic AI as
    "novel and rapidly evolving." Real according to secondary sources, not
    confirmed verbatim against the Fed text. Do not quote it until it is.]`

**Still open**

- **Fluency** (section 3) has no reference selected, and it carries the most
  weight of any section here. Until one is settled, write it as observation, not
  as a named effect.
- **The accountability gap** (section 6) has no settled reference either. Keep
  describing the mechanism without claiming the label belongs to the field.
