---
name: professional-communications
description: >-
  Use for professional emails, letters, memos, follow-ups, outreach, executive
  messages, signatures, and correspondence that should sound polished and
  context-aware. Trigger on email, memo, message, follow-up, outreach, reply,
  letter, signature, "send this", "draft this", or "make this more polished".
  Auto-consult the relevant domain skill too: legal-work for courts/counsel,
  career-docs for recruiters/jobs, brand-design for visual/signature treatment.
---

# Professional communications

## Routing rule
A communication inherits the specialist rules of its subject matter.
- Court, counsel, discovery, motion, settlement → `legal-work`.
- Recruiter, employer, application, interview → `career-docs`.
- Branded HTML, signature, letterhead or visual treatment → `brand-design`.
- External source or attachment being learned from → `source-ingestion`.

## Default writing standard
1. Put the ask or purpose in the first screenful.
2. Use exact names, dates and commitments when known.
3. Remove throat-clearing, filler and performative politeness.
4. Preserve evidence and uncertainty; never make a claim stronger than the record.
5. Give the recipient the next action, owner and timing when appropriate.
6. Use a subject line that identifies the matter rather than merely saying “Follow up”.
7. Keep tone firm, courteous and proportional to the relationship.

## Brand / signature rule
For HTML signatures and formal branded correspondence, use the existing Reference Mark assets and tokens through `brand-design`; do not invent a new logo, palette or typography. The identity should be consistent across email, resume, website and formal artifacts without overpowering the message.

## Privacy
Do not commit filled emails, recipient lists, legal correspondence, medical details, account information or private attachments to public Git. Public Git may contain sanitized templates and reusable communication rules only.
