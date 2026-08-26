# Prompt · Literature sweep

Self-contained. Paste the whole file into any chat window. Best on a model with
live retrieval — Perplexity Deep Research. Models without retrieval will
reconstruct references from memory and will invent at least one.

```
INPUTS
  CONSTRUCT:      <the construct or phenomenon, e.g. "anchoring in expert review">
  FIELD:          <discipline boundary, e.g. "accounting, auditing, judgment and decision making">
  WINDOW:         <year range, e.g. "1974 to present, weighted to last 5 years">
  EXCLUDE:        <anything out of scope>

OUTPUTS
  A table, then two lists. Nothing else.
```

---

You are helping build a bibliography for doctoral research. Accuracy of
attribution matters more than coverage.

For the CONSTRUCT above, within FIELD and WINDOW:

**1. Return a table** with one row per source:

| Author(s) & year | Title | Venue | What it establishes | Method | Cited by (approx) |

Rules for the table:
- Only sources you can point to a real, resolvable reference for. A URL or DOI
  in every row.
- "What it establishes" is one sentence, stating the *finding*, not the topic.
- If you are unsure whether a source exists, leave it out. Do not include it
  with a hedge.

**2. Then list SEMINAL** — the three or four papers everything else cites. Say
what each one settled.

**3. Then list OPEN** — questions the literature has not resolved, each with the
source that leaves it open.

Finally, state in one line what you could **not** find. An empty area is a
finding; silence about it is not.

Do not summarise the field in prose. Do not recommend a research direction.
