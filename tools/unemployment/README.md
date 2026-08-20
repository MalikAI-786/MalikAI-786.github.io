# Unemployment claim — filing playbook and benefit-maximisation checklist

New Jersey Unemployment Insurance. Everything needed to file, to keep a claim
alive, and to make sure the weekly rate is the highest one the rules allow.

Not part of the website. Nothing here is served or linked.

> **Nothing personal goes in this file.** No SSN, no employer, no dates of
> employment, no dollar figures, no claim or confirmation numbers. This
> repository is public on every branch. The rules live here; **your** claim
> lives in the control center (Notion) and in `claim.local.md`, which
> `.gitignore` already excludes via `*.local.*`.

---

## The one thing that decides the money

**Your claim's effective date is the Sunday of the week you first file — not
the day you were separated.** File on a Thursday and the claim starts that
Sunday. Wait until next Monday and you have moved the start forward a full
week and given up that week's benefit. There is no retroactive credit for
weeks nobody claimed.

New Jersey has **no unpaid waiting week** (eliminated in 2002), so the first
eligible week is a paid week. That cuts both ways: every week not filed is a
paid week thrown away, not a deferred one.

So the sequence is always: **file first, resolve questions second.** An
imperfect application filed today beats a perfect one filed Monday. Corrections
are routine; a lost week is not recoverable.

---

## Decide first: new claim, or reopen?

This is the fork that most people get wrong, and getting it wrong costs weeks.

| Situation | What to do | Why it matters |
|---|---|---|
| No claim in the last 12 months | **File a new claim** | Sets a new benefit year and a new weekly rate off the current base year |
| A claim exists, opened under 12 months ago, and weeks remain | **Reopen it** — do not file new | Reopening inside the benefit year **does not change your payment amount**; filing new can reset you onto a worse base year |
| A claim exists but you stopped certifying for some weeks | **Reopen, then call** to request access to the missed weeks | Missed weeks are not paid automatically and are not paid retroactively without that call |
| Benefit year has expired | File new | A new base year applies |

Reopening: <https://www.nj.gov/labor/myunemployment/apply/reopen.shtml>

To request access to certify weeks you missed, the number to call is
**732-761-2020**. That specific ask goes to a human — the portal will not
open closed weeks on its own.

**Backdating must be requested by phone.** The online application has no
backdate field. If the claim should start earlier than the Sunday of this
week, you file online first, then call and ask for the backdate. Do not delay
the filing to ask for the backdate — do both, in that order.

---

## Before you open the application

Have all of it on the screen before starting. The session times out, and a
timeout mid-application is the single most common reason an application
"won't submit."

- Social Security number
- NJ driver's licence or state ID
- Alien Registration number, if not a US citizen
- **Every employer for the last 18 months** — complete legal name, address,
  phone number, and your exact first and last day worked at each
- Reason for separation for each one, in the employer's language, not yours
- Amount and type of any separation money — severance, pay in lieu of notice,
  accrued vacation, bonus — and the dates it covers
- Bank routing and account number for direct deposit
- Pension or 401(k) distribution details, if any are being drawn
- Dependants: names, dates of birth, SSNs, and whether the other parent is
  employed or already claiming them

The 18-month employer list is what determines the base year, which determines
the rate. An employer left off is wages left out is a lower weekly cheque.

---

## Filing

**Online, 24/7:** <https://myunemployment.nj.gov/> — this is the only path
that is open outside business hours. Use it.

**By phone,** if the portal blocks you. Route by where you live, not where you
worked:

| Region | Number | Hours |
|---|---|---|
| North NJ (incl. Essex / Newark) | **201-601-4100** | Mon–Fri 7am–6pm |
| Central NJ | **732-761-2020** | Sat–Sun 8am–12pm |
| South NJ | **856-507-2340** | (same hours, all three) |

Other links you will need:

- Claim status: <https://uistatus.dol.state.nj.us/>
- How benefits are calculated: <https://myunemployment.nj.gov/before/about/calculator/>
- Dependency benefits: <https://myunemployment.nj.gov/before/about/howtoapply/dependencybenefits.shtml>
- Identity verification: <https://myunemployment.nj.gov/before/about/identity/>
- ID.me for NJDOL: <https://hosted-pages.id.me/njdolverify>
- In-person appointment scheduler: <https://telegov.njportal.com/njdolui>
- Rights and responsibilities (PR-94): <https://www.nj.gov/labor/myunemployment/assets/pdfs/PR-94.pdf>
- Instructions for claiming (BC-10): <https://www.nj.gov/labor/forms_pdfs/ui/BC10.pdf>

Expect **2–3 weeks** before the first payment lands. That is normal processing,
not a problem to chase on day four.

---

## Then certify, every week, without exception

Filing the claim is not claiming the money. Certification is a separate weekly
act, and **benefits are not paid retroactively for weeks not certified.**

- **Sunday through Friday, 8am–6pm.** Not 24/7 — this is the trap. The
  application is always open; certification is not.
- Certify for the week that has just ended.
- Report **all** gross earnings in the week you *earned* them, not the week you
  were paid. Under-reporting is what creates an overpayment demand and a fraud
  finding a year later.
- Keep a work-search record — dates, employer, role, method, outcome. If the
  claim is based on full-time work, you must be looking for full-time work,
  including while working part-time.

Put a recurring Sunday reminder in the calendar with the certification link on
it. A missed week costs a week's benefit and requires a phone call to recover.

---

## The seven levers on how much you actually get

Order matters — the first three set the rate, the rest protect it.

### 1. Complete the 18-month employer list

Rate is **60% of your average weekly wage during the base year**, capped at
the 2026 maximum of **$905/week**. The base year is **the first four of the
last five completed calendar quarters** before you file. A missing employer or
a wrong last-day-worked pulls that average down permanently for the whole
benefit year. Check the Monetary Determination when it arrives and dispute it
in writing if the wages are wrong — that appeal window is short and it is the
only clean chance to fix the rate.

### 2. Watch which quarter you file in

Because the base year is the first four of the last five completed quarters,
crossing a quarter boundary swaps a quarter out and a quarter in. If your
recent quarters are your strongest, filing sooner captures them; if a high
quarter is about to become countable, the alternate base year may be worth
asking the call center about. **This is a question to ask, not to guess at** —
and never a reason to delay the initial filing. File, then ask.

### 3. Claim every dependant

Worth up to **15% on top of the weekly rate**: **+7% for the first dependant,
+4% each for up to two more**. Only available if your rate is *below* the
$905 maximum, and the combined total still cannot exceed $905.

The hard part is the deadline: **proof of dependency is due within six weeks
of the claim date.** Most recent federal or state tax return is the cleanest
proof; failing that, birth/marriage certificates, civil union licence, or a
certified support or custody order. Miss the six weeks and the allowance is
gone for the benefit year. Put the deadline in the calendar the day you file.

### 4. Do not let separation pay be mislabelled

The distinction is worth thousands and turns on wording in the separation
agreement, not on what it is called in conversation:

- **Lump-sum severance for past service** — generally does **not** bar
  benefits. Report it, but it should not push out the start.
- **Pay in lieu of notice / salary continuation** — treated as extending
  employment, so those weeks are generally **not** payable.
- **Lump-sum accrued vacation at termination** — not a bar.
- **Ongoing vacation payments** during unemployment — deducted.

Report every payment honestly and let the Division classify it. If a lump sum
is being recorded as salary continuation, that is a determination to appeal
with the agreement language attached, not something to argue on the phone.

### 5. Work part-time, but stay under the 20% line

Earnings **at or below 20% of your weekly rate** cost you nothing — you keep
the full benefit. Above that line, the reduction is **dollar for dollar**.
So the first fifth of your rate is genuinely free money, and the amount just
past it is not. If part-time work is available, knowing exactly where your 20%
line sits is worth more than any other single number here.

### 6. Protect the 26 weeks and the benefit year

Up to **26 weeks** of benefits, available for **one year from the date of
claim**. Not calendar weeks — the balance is yours until the benefit year
ends. Weeks not certified are forfeited; weeks certified while working part-time
draw down slowly and stretch further.

### 7. Clear identity verification immediately

ID.me is the most common cause of a claim that appears to be filed but never
pays. It is a **separate system from NJDOL**, and they desynchronise. Budget
**~15 business days** after ID.me verifies, plus **up to 5 business days** for
NJDOL to process it. NJDOL staff cannot see or fix your ID.me account.

If self-service fails, do not retry it a fourth time. Use live video chat, or
in-person at one of the **38 UPS locations in NJ** that partner with ID.me.

---

## If weeks were missed: the good-cause adjudication

Missed weeks are not simply certified late. The Division sends a questionnaire —
a claimant statement listing up to **12 week-ending Saturday dates** — and pays
or denies those weeks on the answers. It is an adjudication, not paperwork, and
it is decided against one sentence:

> **"Good cause" means any situation which was substantial and prevented the
> claimant from reporting as required by the Division.** — N.J.A.C. 12:17-4.1(b)

Every narrative answer therefore has to establish three things: that you
**tried**, that the obstacle was **substantial**, and that it **prevented** you.
With dates. An answer describing how the delay felt fails the test; an answer
listing dated attempts and a concrete obstacle meets it.

**How to write the attempts field.** The form asks for all dates and means it.
Chronological rows beat prose:

    06-12-2026 — Online, portal — attempted to certify, error [verbatim]. No confirmation number.
    06-15-2026 — Phone, 201-601-4100, 7:04am — hold 48 min, call dropped. Log attached.

A row with a date, a method and an outcome supports good cause. A row missing
any of the three is filler.

**Two mechanics that make this irreversible.** The form is due on the date given
in the covering email, and **submitting closes access permanently.** Save a
complete copy — print to PDF or screenshot every page — before certifying, or
there is no record of what you said if it goes to appeal. If no confirmation
email arrives, it did not submit.

**List every week.** Weeks omitted cannot be added afterwards. Under-listing is
the expensive and permanent mistake; the only ceiling is that no week can
precede the claim's effective date.

**Evidence is the differentiator**, because most people attach none. Screenshots
of failed attempts with visible timestamps, a phone log showing calls and
durations, confirmation numbers from internet attempts, dated application and
rejection emails. Use a job-search tracker as an *index* of what to pull, not as
the exhibit — a tracker whose rows were all created on one recent date reads as
reconstructed. Upload the contemporaneous primary documents it points to.

### The student question is a trap worth knowing about

"Were you attending school or job training?" answered falsely is a false
statement on a certified form. Answered "yes" with no explanation, it invites a
student disqualification. The answer is yes plus the exception.

Under **N.J.A.C. 12:17-12.6** a student in full-time attendance is disqualified
**unless** the programme is Division-approved training, **or** — the exception
that catches most working professionals — **during the base year the individual
earned sufficient wages while in full- or part-time attendance at an educational
institution to establish a claim.** Wages earned while enrolled put you inside
it as a matter of record rather than argument.

Separately, a claimant is **not** deemed unavailable *solely* for being a
student, provided attendance does not in fact make them unable or unavailable
for work and they can demonstrate actively seeking work. Note the limit: if
suitable work is offered, it must be accepted even where it collides with the
class schedule.

---

## The availability hold — how one wrong answer freezes weeks

The most expensive failure mode on a live claim is not a rejected application.
It is a **hold** placed mid-claim by an answer on a routine weekly
certification — most often the school/training question — which silently
blocks every subsequent week until an adjudicator lifts it.

What makes it costly is that it is invisible from the claimant side. The
weeks do not appear as denied. They appear as un-certifiable. Nothing in the
portal explains why, and nothing in the portal will clear it: **a hold is
lifted by an adjudicator, never by the claimant.**

The pattern to recognise:

1. A certification asks whether you are attending school or training.
2. An answer is entered that does not reflect the actual arrangement.
3. An availability hold attaches to the claim record.
4. Subsequent weeks cannot be certified, with no stated reason.
5. Weeks accumulate unpaid while the claimant assumes the system is broken.

### What to do

**Correct the entry — do not re-answer it differently and hope.** The fix is
an adjudicator correcting the claim record. That means a written statement
setting out what the true arrangement is and why it never limited
availability, delivered to the adjudication centre handling the claim.

**Answer the same question accurately every time it reappears.** When the
question shows up again on a missed-weeks questionnaire, the temptation is to
give the answer that avoids the hold. That is a false statement on a form
certified under penalty, and it converts a recoverable delay into a fraud
finding. Answer it truthfully and explain it in the narrative field instead.

**Frame enrolment against the actual statutory test.** The question is not
whether you are enrolled. It is whether attendance in fact made you unable or
unavailable for full-time work. An evening or executive programme built for
candidates who remain in full-time employment is evidence on that point;
so is a record of applications and interviews across the held weeks.

**Never state a limitation on availability.** "I cannot work Fridays" is a
ground for ineligibility in its own right, and it contradicts the "able and
available" certification on the same form.

### Watch for a conflicting claim

Before certifying **able and available** for a set of weeks, check whether
any disability or income-protection claim covers the same weeks. A claim
asserting inability to work and a UI certification asserting availability
cannot both be true for the same week. New Jersey runs **Disability During
Unemployment** for precisely that overlap — use it rather than letting the
two records contradict each other. An inconsistency found later is an
overpayment and a fraud finding, not a correction.

---

## When the application will not submit

In rough order of likelihood:

1. **Session timeout.** The form is long and the window is short. Have every
   field's answer ready before you start; do not research mid-application.
2. **Identity verification pending.** The claim exists but is frozen behind
   ID.me. Check the ID.me account status, not the NJDOL portal.
3. **An existing claim in the benefit year.** The new-claim path is blocked
   because the correct path is *reopen*. Different URL, different flow.
4. **An employer record that will not validate** — a name or address the
   system does not accept, or dates that overlap. Try the employer's exact
   legal name from a W-2 or pay stub, not the trading name.
5. **Browser state.** Different browser, cache cleared, no VPN, no autofill.
6. **Something requiring a human.** Stop retrying and call. Repeated failed
   submissions can flag the claim for review, which is slower than the call.

Before the third attempt, screenshot the error. An error message with a
timestamp is what makes the phone call short.

---

## Escalation, in order

1. Portal — retry once, clean browser.
2. **201-601-4100** (North NJ), at 7:00am. Call volume is lowest in the first
   fifteen minutes.
3. In-person appointment: <https://telegov.njportal.com/njdolui>
4. Written appeal, if a determination is wrong. Appeal deadlines in NJ are
   short and strictly enforced — the date on the notice is the date that counts.
5. Constituent services at your state legislative district office. Genuinely
   effective on stuck claims, and routinely underused.

---

## Your claim file

Fill in `claim.local.md` in this directory. `.gitignore` excludes `*.local.*`,
so it stays on your machine and out of this public repository. Track:

| Field | Why it earns its place |
|---|---|
| Date of claim / effective Sunday | Every deadline counts from here |
| Confirmation number | First thing asked for on every call |
| Weekly benefit rate as determined | The number to check the maths against |
| Dependency proof deadline (claim date + 6 weeks) | Hard cutoff, no extension |
| 20% partial-earnings line | The number that makes part-time work decidable |
| Certification log — week ending, date certified, amount | Proves the week was claimed if a payment goes missing |
| Every call — date, time, agent, what was said | The only evidence that exists of a phone conversation |
| Every determination letter received | Each one starts an appeal clock |

---

## Sources

Rates and thresholds are as reported for **2026** and were gathered from search
results; the `nj.gov` and `myunemployment.nj.gov` domains were not directly
reachable from the environment where this was compiled, so **confirm the
figures on the official pages before relying on them.** Where a rule below is
secondary-sourced rather than from NJDOL directly, it is marked.

| Rule | Source |
|---|---|
| 2026 maximum weekly rate $905; base week $310; alternative $15,500 | [NJDOL, new benefit rates for 2026](https://www.nj.gov/labor/lwdhome/press/2025/20251229_newbenefitrates2026.shtml) |
| 60% of average weekly wage; base year definition | [NJDOL, How we calculate benefits](https://myunemployment.nj.gov/before/about/calculator/) |
| Dependency allowance and six-week proof deadline | [NJDOL, dependency benefits](https://myunemployment.nj.gov/before/about/howtoapply/dependencybenefits.shtml) · [N.J.A.C. 12:17-7.4](https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-12-17-7-4) |
| Reopening; benefit year; rate unchanged on reopen | [NJDOL, reopening or reapplying](https://www.nj.gov/labor/myunemployment/apply/reopen.shtml) |
| Certification hours and no retroactive payment | [NJDOL, how to certify](https://myunemployment.nj.gov/before/about/howtoapply/howtocertify.shtml) · [BC-10](https://www.nj.gov/labor/forms_pdfs/ui/BC10.pdf) |
| Effective date = Sunday of the week first claimed | [N.J.A.C. 12:17-4.2](https://regulations.justia.com/states/new-jersey/title-12/chapter-17/subchapter-4/section-12-17-4-2/) |
| Severance vs. pay in lieu of notice; vacation pay | [N.J.A.C. 12:17-8.7](https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-12-17-8-7) · *secondary:* [Swartz Swidler](https://swartz-legal.com/will-my-severance-prevent-me-from-collecting-unemployment/) |
| Partial benefits: 20% threshold, dollar-for-dollar above | [NJDOL, factors that reduce your rate](https://myunemployment.nj.gov/help/faqs/reducebenefits.shtml) |
| Identity verification timing and in-person options | [NJDOL, verifying your identity](https://myunemployment.nj.gov/before/about/identity/) · [ID.me help](https://help.id.me/hc/en-us/articles/1500005127662-New-Jersey-and-ID-me) |
| Call centre numbers and hours | [NJDOL, call a Reemployment Call Center](https://myunemployment.nj.gov/before/about/howtoapply/callrcc.shtml) |
| Good cause definition for late or missed weeks | [N.J.A.C. 12:17-4.1](https://regulations.justia.com/states/new-jersey/title-12/chapter-17/subchapter-4/section-12-17-4-1/) — *quoted from search results; domain unreachable, verify* |
| Student disqualification and its exceptions | [N.J.A.C. 12:17-12.6](https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-12-17-12-6) — *quoted from search results; domain unreachable, verify* |
| Student not unavailable solely by attendance | [N.J.S.A. 43:21-4](https://law.justia.com/codes/new-jersey/title-43/section-43-21-4/) |
| Disability During Unemployment (conflicting able-and-available) | [NJDOL, Disability During Unemployment](https://www.nj.gov/labor/myleavebenefits/worker/resources/ddu.shtml) — *verify; domain unreachable at compile time* |
| No waiting week since 2002 | *secondary:* [remotelaws.com](https://remotelaws.com/unemployment/us-states/new-jersey/) — **confirm** |

This is a procedural checklist compiled from public sources. It is not legal
advice, and NJDOL's determination is the one that counts.
