# Malik OS — Skill Map

This is the one-page routing map for work in this repository. It is not a substitute for the skills themselves. Its job is to make the correct specialist behavior obvious before work begins.

## Operating rule

For every substantive task:

1. Identify the work domain.
2. Load the matching `.claude/skills/<name>/SKILL.md` skill before drafting, coding, publishing, or changing anything.
3. If the user supplied an external source, also load `source-ingestion`.
4. If the task is a professional email, letter, memo or follow-up, also load `professional-communications`.
5. If two domains overlap, load all relevant skills and obey the strictest privacy/provenance rule.
6. Keep private evidence in private systems; public Git contains only sanitized reusable instructions and public-safe outputs.
7. Apply the Reference Mark brand system to public-facing artifacts unless a domain-specific rule explicitly overrides it.

## Auto-consult routing

| User intent / trigger | Required skill | What it governs |
|---|---|---|
| Reel, video, article, PDF, screenshot, transcript, external link; “learn from this”, “extract the skills”, “remember this method” | `source-ingestion` | Source capture, provenance, durable skill extraction, no invented content |
| Email, memo, professional letter, follow-up, outreach, reply, signature | `professional-communications` | Purpose-first writing, domain-aware tone, next-action clarity, branded signature routing |
| Mīzān, workout, coach, training, health import, body/skills dashboard | `mizan` | Mīzān data model, coach boundaries, privacy, training UI and invariants |
| Iqbal, khudī, Roohe Iqbal, reel/caption/merch involving Iqbal | `roohe-iqbal` | Iqbal provenance, reel grammar, series, caption system, merch gates |
| Court filing, affirmation, motion, discovery, legal letter, opposing counsel, legal chronology or exhibit | `legal-work` | Legal tone, factual discipline, record citations, no invented authority or facts, litigation-ready structure |
| Website, dashboard, PDF, slide, resume visual, social creative, email signature, logo, palette, typography or layout | `brand-design` | Reference Mark identity, polished visual hierarchy, accessibility, consistent logo/palette/type |
| Resume, bio, cover letter, interview packet, professional profile | `career-docs` | Evidence-led positioning, quantified achievements, ATS clarity, executive presentation |
| GitHub architecture, Pages, workflows, agents, skills, automation, repository governance | `repo-governance` | Safe branching, public/private boundary, invariants, PR discipline, skill discoverability |

## Combination examples

- “Draft a letter to the court about discovery” → `professional-communications` + `legal-work`; add `brand-design` if a polished PDF/letterhead is requested.
- “Turn this Instagram reel into a reusable system” → `source-ingestion`; add `roohe-iqbal` if the reel concerns Iqbal/khudī.
- “Build a coach dashboard” → `mizan` + `brand-design` + `repo-governance`.
- “Improve my resume and publish it on GitHub” → `career-docs` + `brand-design` + `repo-governance`.
- “Email a recruiter using my branding” → `professional-communications` + `career-docs` + `brand-design`.
- “Write opposing counsel about discovery” → `professional-communications` + `legal-work`.

## Global quality gate

Before calling work complete, verify:

- Correct specialist skill(s) were consulted.
- Source claims are traceable to evidence.
- Sensitive/private information did not cross into public Git.
- Branding is consistent rather than reinvented per artifact.
- A future session can discover the governing skill without chat memory.
- Existing invariants/tests still pass or any unverified test is explicitly reported.

This map should stay short. Detailed operating procedures belong in the individual skills.
