# Discovery intake: MVP and expansion roadmap

Owner: Yasir A. Malik. Version 1.0. 2026-09-15.

## Positioning

Lead with Yasir's established Audit · Risk · Governance identity. The proposed AuditingAI offer is evidence-led operational improvement: diagnose a decision or workflow, agree a bounded pilot, measure results, then consider scale. Do not promise an audit opinion, franchise approval, placement, campus outlet or university contract.

## MVP implementation

- `/intake/`: guided, accessible form; business, hospitality, education and exploratory paths.
- Required contact and problem/outcome fields; plain-language examples; optional evidence, assumptions and constraints.
- Versioned JSON and text brief with UUID, timestamp, inquiry-only consent, self-reported stage, missing context and transparent suggested agenda.
- No hidden lead score. All leads remain unreviewed until a person checks them.
- Client-only processing; no database, analytics, cookies, local storage or third-party scripts. No answers in page URL, public issues or committed test fixtures. Explicit email handoff is user-initiated and passes the chosen brief to the user's mail client.
- Long mailto links fall back to a short draft; the user must paste or attach the brief. Preparing or downloading is never a confirmed submission.
- Homepage and newsletter-page links plus an original, source-linked field note. External newsletter publishing is not part of this deploy.

## Operating sequence

1. Prospect prepares and sends the brief. Email receipt, not button use, establishes an inbound lead.
2. Yasir reviews fit, evidence gaps and conflicts; no automatic partner forwarding.
3. Initial 1:1 validates the problem and sponsor.
4. If both parties agree, invite relevant specialists to discovery with permission. Confirm MK Aquila's actual capabilities and commercial terms before assigning delivery. Do not represent BDO or any other organization without authorization.
5. Write a paid diagnostic or pilot scope: deliverable, owner, baseline, acceptance criteria, dependencies, data boundaries, fee and stop/go decision. Pricing remains to be agreed, not invented.
6. Consider repeat work only after evidence review; separate client consent from permission to publish any case study.

## Next-stack plan and release gates

| Phase | Build | Gate before release |
| --- | --- | --- |
| 1 — current MVP | Static Pages + guided brief + explicit email handoff | Validation, export, mobile, privacy and repository checks pass; deployed page loads |
| 2 — private capture | Small HTTPS API; server-side validation; rate limiting and abuse protection; encrypted private database; receipt IDs; retry/idempotency handling | Choose hosting/account, privacy notice, retention/deletion policy and notification destination; verified end-to-end receipt; no secret in browser |
| 3 — private CRM | Map schema into a private CRM/Notion database; deduplicate by contact plus inquiry; track received → reviewed → discovery → scoped → won/lost | Access roles, audit trail, consent and deletion propagation tested; email/CRM failures visible; human approval for outbound |
| 4 — delivery and measurement | Approved partner routing; scoped proposals; pilot milestones; outcomes dashboard | Signed scopes and disclosure controls; baseline and benefit attribution verified; no automated promises |

Suggested phase-2 architecture: existing static frontend → serverless API → private relational database → notification job. Choose vendor only after account, region, retention and budget decisions. No infrastructure subscriptions or partner commitments are created by this plan.

## Useful measures

Track privately after capture exists: received inquiries, qualified discoveries, proposals, wins, time-to-first-response, pilot completion and verified benefits. For the MVP, use actual inbox receipts and a private manual tracker; website traffic is not a lead count. Avoid collecting behavioral telemetry merely to fill a dashboard.

## Source record and limits

- SOURCE-DERIVED: [FIU Class of 2028](https://business.fiu.edu/academics/graduate/doctor-of-business-administration/our-students/class-of-2028/index.html) identifies Yasir and summarizes his audit/risk and AI-governance background. Supports biography, not university endorsement. No cohort names are harvested as leads.
- SOURCE-DERIVED: [PilotWave Holdings](https://www.pilotwaveholdings.com/) describes staged AI-enabled transformation. Its marketing performance claims are not independently validated here and are not reused.
- SOURCE-DERIVED: [Jennifer Kinne, In the Absence of Reason](https://www.jenniferkinne.com/in-the-absence-of-reason/) distinguishes similar outputs from claims about shared cognitive mechanisms.
- INFERENCE: guided intake, disconfirming-evidence question, staged pilot gates and track-specific agendas are our implementation choices, not the sources' prescribed workflow.
- PROPOSED: education cases, hospitality operating reviews and delivery partnerships require discovery and approvals; none are established programs.

## Deferred editorial scope

The new field note and website/newsletter entry points are included. Existing external articles and Substack posts remain unchanged until the exact pieces are identified. Never silently rewrite third-party pages, student profiles or source articles.
