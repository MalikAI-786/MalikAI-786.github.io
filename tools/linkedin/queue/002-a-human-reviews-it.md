# 002 · working record · "a human reviews it"

**Slot:** week 1, Thursday · **Format:** text · **Link:** first comment
**Series:** record · **Status:** drafted, awaiting his review. Nothing posted.

---

## Post

"A human reviews the output" appears in almost every AI control description I have read. It is almost never a control.

A control has a design you can describe, an operation you can evidence, and a failure mode you can name. Read that sentence again against those three tests and it fails all of them. It describes a seating arrangement.

I ran into this from the inside. I built a retrieval-augmented assistant for audit and workpaper inquiry and put it into a live audit function, where it cut review cycle time by an estimated 35%. Then I had to write the governance framework that said under what conditions a thing like it was allowed to operate.

The number was the easy part. The hard section was human oversight, and it was hard for a reason I did not expect.

Every version I drafted said some form of "the reviewer validates the output before use." And every version failed the question an examiner would ask on the first day: what evidence would exist if the reviewer had not validated it? There isn't any. A reviewer who reads carefully and a reviewer who scrolls to the bottom and clicks produce identical artefacts.

So the control cannot be "a human reviews it." The control has to be something that changes what the human does.

The versions that survived had a shape in common. They specified what the reviewer must independently produce before seeing the machine's answer, or what must be recorded when the reviewer agrees, or what threshold of disagreement triggers a second look. Each one makes the moment of deference visible by making agreement cost something.

That is the whole of it. You cannot audit for deference directly, because nobody documents the moment they stopped thinking. There is no exception report for the reviewer who agreed because agreeing was easier. You can only infer it from design — from whether the arrangement makes disagreement possible, cheap and expected, or merely permitted in principle.

What I still do not know is how much of the cycle-time saving survives a control built that way. If the reviewer has to form a view first, some of the 35% goes back. I would rather know that number than not, and I have not seen anyone publish it.

If you are writing an AI control description this quarter, the question worth putting to every line of it is simply: what would make the human disagree, and would we be able to tell?

#AIGovernance #ModelRisk #InternalAudit

---

## First comment

I write about this at longer length in Proof Over Promise — model risk, AI governance, and what happens to professional judgment when the analysis arrives already formed:
https://proofoverpromise.substack.com/subscribe

---

## Notes

**Sourcing.** Every factual claim here already appears on his public profile:
the RAG assistant for audit and workpaper inquiry, the estimated 35% reduction
in review cycle time, and authorship of an AI governance framework referencing
the NIST AI RMF. No client, system, team or institution is named. No detail is
added beyond what is already public.

**The "35%" is carried as "estimated"** because that is the word his own
profile uses. Do not drop it. Dropping the hedge would upgrade an estimate into
a measurement, which is precisely the move this feed exists to argue against.

**Why this is post 002.** The launch post makes an argument about
self-assessment; this one shows him doing the work in a professional setting. A
reader arriving from 001 needs to see the practitioner before the series
introduces the philosophical vocabulary in 003.

**Strongest line, for a possible image card:** "A reviewer who reads carefully
and a reviewer who scrolls to the bottom and clicks produce identical
artefacts."

**Expected pushback,** and it is fair: that specifying what the reviewer must
produce first destroys the efficiency case. The post concedes this rather than
defending against it, which is the right move and should stay that way in the
replies. If someone has the number, that is a genuine result and worth asking
for directly.

**Length: 2,420 characters,** slightly over the 2,400 target and well inside the
3,000 ceiling. The target exists to catch a second argument that has crept in,
so I checked for one: this post carries a single thread from "that sentence is
not a control" to "here is what would make it one." No second argument. Kept at
length deliberately rather than trimmed evenly.

## Gaps

- The claim that the human-oversight section was the hardest to draft is his
  characterisation of his own work. It is not independently evidenced and does
  not need to be — it is a first-person report, and it is phrased as one.
- The three control shapes described ("what the reviewer must independently
  produce", "what must be recorded when the reviewer agrees", "what threshold
  triggers a second look") are stated as the shape of versions that survived,
  not as a published framework. Do not let a later draft turn them into a named
  methodology.
- No claim is made that the framework was adopted, approved, examined, or
  effective. It was authored. That is what the record supports.

## Checklist

Run before posting. Safeguards, register (no citation used — the delete-the-
citation test is trivially passed), voice and mechanics pass.
