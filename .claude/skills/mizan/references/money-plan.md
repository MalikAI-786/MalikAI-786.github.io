# Mīzān Money — the two-stage plan

Decided 2026-10-27: **both, staged; Supabase for the backend.**

## Stage 1 — local statement import (live: `mizan/money/`)

- `money/index.html` + `money/money.js`, loaded after `core.js` (which supplies
  nav, theme and footer). Own storage key **`mizan.money.v1`**, deliberately
  apart from `mizan.v1`, so the weekly Mīzān export never carries bank data.
- Reads CSV (column detection; signed amount *or* debit/credit; header row
  found within the first 12 lines) and OFX/QFX (`STMTTRN`, `LEDGERBAL`,
  `CCACCTFROM` ⇒ credit). A preview comes before anything is added, with one
  "flip signs" switch for card exports that invert spending.
- Dedupe key: `acct|FITID` when the file carries one, else
  `acct|date|amount|merchant`. Re-importing an overlapping download is safe.
- Transfers between own accounts are excluded from spending and cash flow.
- Recurring bill = same merchant ≥3×, median gap 25–35 days, every amount within
  10% (min $2) of the median. Tighter than it looks on purpose: a monthly
  grocery run is not a bill.
- Loans: entered from the statement. Fixed-rate amortisation,
  `n = −ln(1 − rB/P) / ln(1 + r)`; a sub-1% residual month is treated as paid
  off, because statement payments are rounded to the cent. An extra-principal
  slider shows months and interest saved. The bank's payoff quote is the
  authority; the page says so.
- Q 2:282 heads the page (the debt verse — write it down). Interest is shown as a
  number; permissibility of any financing is referred to a scholar, never ruled on.

## Stage 2 — live sync via Plaid, from a private Supabase backend (not built)

Nothing in stage 2 may live in this repository, because it is public. It needs:

1. **A new private repository** (proposed `MalikAI-786/mizan-money-private`),
   created only with the owner's go-ahead.
2. **Supabase project** (owner authorises the Supabase connector). Postgres with
   row-level security bound to the owner's auth user; a single-tenant schema:
   `items(plaid_item_id, institution, access_token_encrypted, cursor)`,
   `accounts`, `transactions`, `liabilities` (Plaid Liabilities product covers
   mortgages, student loans and credit cards).
3. **Edge functions**: `create_link_token`, `exchange_public_token` (stores the
   access token encrypted with a key held in Supabase secrets, never returned to
   the browser), `sync` (`/transactions/sync` with a stored cursor, plus
   `/liabilities/get` and `/accounts/balance/get`), and a Plaid webhook receiver.
4. **Plaid environments**: build and test in **Sandbox** (fake institutions, free).
   Real banks need Plaid **Production** approval on the Malik LLC team, and carry
   per-connection pricing; the owner decides that step.
5. **The Money page gains a "Connect bank" mode** that, when signed in to the
   private backend, pulls the same shape stage 1 writes (`accounts`, `txns`,
   `loans`). The local importer stays as the fallback. The no-network invariant
   is relaxed for this page only, and only towards the owner's own backend.

### What never happens
- No Plaid secret, client ID, access token or account number in any file here.
- No bank data in `mizan.v1`, in the weekly export, in a commit, or in the
  scratchpad beyond a session's working copy.
- The assistant never initiates a payment or transfer. Read-only products only
  (Transactions, Balance, Liabilities).
