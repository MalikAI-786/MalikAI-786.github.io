---
name: legal-work
description: >-
  Use for court filings, motions, affirmations, discovery, legal letters,
  correspondence with counsel, legal chronologies, exhibit lists, hearing prep,
  settlement analysis, and any request that should read like litigation work.
  Trigger on words such as court, judge, motion, affirmation, discovery,
  NYSCEF, exhibit, opposing counsel, legal brief, subpoena, hearing, settlement,
  or "draft a letter to the court". Prioritize record accuracy, procedural
  posture, sourced authority, precise dates, and separation of fact from argument.
---

# Legal work

## Standard
Produce litigation-ready work, not generic business prose.

## Required method
1. Establish court, case, index/docket number, procedural posture and requested relief from the available record.
2. Separate: record fact; user position; legal authority; inference; unresolved gap.
3. Use exact dates and document identifiers when known.
4. Never invent a filing, quote, holding, citation, exhibit, service event or court instruction.
5. When authority matters, verify the current text/source before relying on it.
6. Draft the strongest accurate argument, including adverse facts that must be addressed rather than hidden.
7. Keep confidential evidence out of public GitHub. Public repositories may contain only sanitized templates or reusable process instructions.

## Draft structure
Default to: caption/context → purpose/relief → concise factual chronology → governing rule → application → requested action → attachments/exhibits if applicable.

For correspondence, write as a professional legal communication: short subject, clear demand/question, factual basis, deadline only when justified, and preservation of rights without theatrical threats.

## Financial disclosure builds (statements of net worth, schedules, tracing)
- Work from the court's current official form and its section order. Map every line to a source document before writing a number.
- Keep two date columns apart: the date the action began and the "as of" date. Never substitute a later closing balance for the commencement balance. If you derive a date-specific balance from an opening balance plus dated activity, label it as derived.
- For each account, record the owner names exactly as printed on each statement, period by period. Title changes after commencement (an owner removed, or a relative added) are material and must be disclosed, not smoothed over.
- A business-entity account is not a personal account. Report it under the business interest, and route its rental income and expenses to the income and expense sections.
- Tracing: tie each transfer to both legs (sending and receiving statements, with matching reference numbers). A one-legged entry is a lead, not a finding. Any receiving account that is not yet on the account list goes on a "accounts to add" list.
- Payments described as rent or housing that exactly equal a loan payment are probably debt service routed through a card or platform. Flag the inference and have the client confirm it before it reaches the expense section.

## Retrieving records through connected tools
- If a text fetch returns blank, the PDF is probably image-only. OCR it through a fresh single-use download link (a link is consumed by any request, including a preview). Do not report a blank fetch as "empty document".
- Check a file's size and content hash before trusting it. Bulk "reorganized" or archive copies can be 0-byte placeholders. Go back to the original production folder.
- Email attachments (closing disclosures, statements) can be pulled from the raw message and parsed locally. The message ID is the citation.
- Bank-data connectors usually return balances and transactions, not bank-issued statement PDFs. Label feed data "FEED, as of <timestamp>". Never present it as a statement. The client downloads statement PDFs from the portal.
- Before asking the client to download anything, search the existing archive for it.

## Multi-agent harness
- Outputs from other models are drafts to audit, not facts. Spot-check balances and dates against the originals. Record what was verified, what was wrong, and what was missed in a dated check file, then issue the next work order.
- Work orders state: no invented numbers ("NOT IN FILE"); no sending, filing, sharing or signing; no moving or renaming files; exact save path and file-naming rule; the one-line reply expected.
- When another agent corrects your earlier output, adopt the correction explicitly and note it in the next file.

## Court procedure and contact
- Take chambers and courtroom numbers from the judge's published part rules or the clerk's email signature. Never guess a number.
- Calls to chambers are procedural only, because part rules typically bar one-sided communications. Log who answered, the date and time, and the answer in their words. Confirm in writing with all parties copied when the part rules require it.
- So-ordered subpoenas: track filing, a clerk's comments, signature, and how the signed copy will be returned. Work back from the return date to the service date, allowing the statutory response period plus mailing time. Line up a non-party process server early; some servers decline self-represented parties.

## Quality gate
- Every material factual assertion is supported by the supplied/connected record or expressly marked for verification.
- Authorities are real and proposition-matched.
- Dates, party names and document numbers are internally consistent.
- Tone is firm, neutral and court-appropriate.
- No confidential case material is committed to public Git.
