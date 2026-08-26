# Research runbook

Numbered tasks. Each points at one file in `prompts/`.

## How these work

Every prompt in `prompts/` is **self-contained**. Open the file, paste the whole
thing into any chat window, fill the `INPUTS` block, send. No tool access, no
repository checkout, no prior conversation. That is the design constraint, and
it is borrowed from `tools/datadump/init-datadump.sh`, which carries every file
it writes inside itself so it survives being copied to a machine that has never
seen this repo.

The reason for the constraint: **research should not be trapped in one chat
session or one vendor.** A prompt that only works here is a prompt that dies
when the session does.

## Which model for which task

| Task | Best fit | Why |
| --- | --- | --- |
| 1 · Literature sweep | **Perplexity** (Deep Research) | Live retrieval with citations; the others reconstruct references from memory and will invent one |
| 2 · Article decomposition | Any long-context model | Needs the full text held at once, not retrieval |
| 3 · RQ conversion | Any | Short, rule-bound, verifiable by inspection |
| 4 · Codebook build | Any long-context model | Volume of transcript, not search |
| 5 · Proposition extraction | Any strong reasoning model | Judgement, not retrieval |
| 6 · Adversarial critique | **A different model than the one that produced the work** | The point is a source that has no stake in the prior output |

Task 6's rule is not a preference. Asking a model to critique its own output is
the sycophancy failure mode in `risk/llm-reliance-register.md`, performed
deliberately.

## The tasks

| # | Task | Prompt | Output goes to |
| --- | --- | --- | --- |
| 1 | Sweep the literature on a construct | `prompts/literature-sweep.md` | `BIBLIOGRAPHY.md` |
| 2 | Decompose a qualitative article | `prompts/article-decompose.md` | Course notes; `qualitative/` |
| 3 | Convert a quantitative RQ to qualitative | `prompts/rq-convert.md` | `qualitative/DESIGN.md` |
| 4 | Build a first-order codebook | `prompts/codebook-build.md` | *private repo* — `qualitative/coding/` |
| 5 | Extract propositions from codes | `prompts/proposition-extract.md` | *private repo* — `qualitative/propositions/` |
| 6 | Attack the design | `prompts/adversarial-critique.md` | `docs/decision-log.md` |

⚠️ **Tasks 4 and 5 operate on transcripts.** Transcripts are participant data
under IRB-25-0462 and must not be pasted into a general-purpose chat interface.
Run those two only against de-identified excerpts, or in an approved environment.
The prompt files say so too, at the top, where it cannot be missed.

## Verifying a prompt still works

Run the same prompt on two different models and compare. Divergence beyond
wording means the prompt is under-specified — it is relying on something the
model brought rather than something the prompt supplied. Tighten `INPUTS` until
the outputs converge.
