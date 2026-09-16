---
name: discovery-intake
description: >-
  Use for lead intake, discovery briefs, business qualification, hospitality
  growth inquiries and education collaboration scoping. Keep inquiry data
  private, distinguish local preparation from receipt, and qualify through
  evidence and human review rather than unsupported scoring or promises.
---

# Evidence-led discovery intake

- Source: https://www.jenniferkinne.com/in-the-absence-of-reason/ and https://www.pilotwaveholdings.com/
- Evidence status: INFERENCE. These sources inspire evidence discipline and staged implementation; neither specifies this intake workflow. See `plans/discovery-mvp.md` for source-derived observations.
- Problem solved: turn a vague opportunity into an actionable, privacy-conscious first conversation.
- Trigger: intake form, inbound lead, business/hospitality/education discovery.
- Inputs: voluntarily shared contact, organization, problem, outcome, evidence, assumptions, constraints, timing and inquiry-only permission.
- Procedure: validate required fields; preserve uncertainty; generate versioned brief; select a transparent agenda by track; mark it unreviewed; confirm actual receipt separately; obtain human approval before partner routing; scope a pilot only after discovery.
- Verification: run `node --test tools/audit/intake.test.mjs`; test browser validation, export, edit invalidation, reset and mobile layout; check that no answer leaks into public URLs, persistence, analytics or repository fixtures.
- Failure modes: treating download as receipt; inventing partner authority; conflating student projects with approved programs; inferring demand from construction; giving a fake lead score; treating self-report as verified evidence.
- Safety/privacy: no confidential records, file uploads, public issue submissions or auto newsletter subscription. Current MVP uses explicit email handoff, not a submission backend. Never commit real lead data. Sharing with specialists requires separate permission.
- Best home: this skill, `/intake/`, and the public-safe roadmap. Actual inquiries belong in private email/CRM only.
- Related skills: `source-ingestion`, `brand-design`, `repo-governance`; `professional-communications` for subsequent outreach.
