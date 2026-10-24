# Mīzān Lab — the participant protocol

The Lab is the participant edition of Mīzān: `mizan/lab/` plus `mizan/lab/log/`,
driven by `mizan/lab/lab.js`. It exists so that people other than the owner can
run the same seven measures on their own days and tell us where the model is
wrong. It is **separate from the owner's instrument** — its own localStorage
key (`mizan.lab.v1`), its own page shell, no shared engine — and it is
deliberately the *same model*: measures, weights, phase boundaries and ladder
gates mirror `core.js`, so that feedback is about one model and not two.

## Roles

| Who | Does |
|---|---|
| Participant | Runs the sheet daily. Writes feedback in the three boxes. Builds a packet and sends it from their own mail app, weekly or when there is something to say. |
| Owner | Sends the invitation link. Forwards or pastes packets into the Mīzān session. Sends the two drafted notes. Decides what the Log says is adopted. |
| Assistant (this session) | Ingests packets, writes the read, proposes a decision, edits the instrument where the case is made, writes the Log entry, commits, drafts both notes. **Sends nothing.** |

## The loop

1. **Invite.** The owner sends a participant the link
   `https://malikai-786.github.io/mizan/lab/?to=<owner email>&partner=<owner name>`.
   The two query parameters only prefill the onboarding card; they live in the
   participant's browser, not in this repo.
2. **Onboard.** Five questions once: work this month, expected hardest measure,
   self-placed stage, the restraint commitment, an optional intention. Plus a
   handle, which never enters a packet. The page generates a participant code
   (`P-XXXX`). Day 1 is the day they finish onboarding.
3. **Daily.** Phase-gated sheet, One Thing, closing line, fit rating 0–3, and
   three feedback boxes (what held up / what was wrong / what to change) with an
   "about" selector (a measure, the weights, the phases, the ladder).
4. **Packet.** `Send packet by email` opens a `mailto:` to the partner address
   with the packet in the body; if it is too long for a mail link the page
   copies it instead. `Show & copy` and `Download` are the fallbacks. The packet
   is plain text between `MIZAN-LAB-PACKET` and `END-PACKET` — see
   `buildPacket()` for exactly what it holds and what it withholds.
5. **Ingest.** When a packet reaches the session (pasted, or forwarded):
   ```bash
   node .claude/skills/mizan/scripts/lab-ingest.js $SCRATCH/lab/inbox/<file> $SCRATCH/lab/private
   ```
   It appends to the participant's private ledger, prints the read, and writes
   three drafts under `$SCRATCH/lab/private/<pid>/` — a note to the owner, a
   note to the participant, and a Log entry stub. All private, none committed.
6. **Decide and change.** The decision is a judgment made in the session: adopt,
   decline with reason, or wait for a second participant. An adopted change is
   made in **both** `core.js` and `lab.js` (they mirror; `smoke.js` checks the
   rubrics still agree), the Log entry is filled in and added to
   `mizan/lab/log/index.html`, and the whole thing is committed with the
   participant code in the message. A declined item still gets a Log line.
7. **Draft the two notes.** From the stubs. The owner sends them. If the Gmail
   connector is available, the drafts may be placed in the owner's Drafts
   folder — a draft, never a send.

The nightly routine already fires into this session every evening; the ingest
step runs then if a packet has arrived, so "update git daily" means: a commit
on every night that carries a change, and a Log line for every packet read.

## Privacy, in one place

- The repo is public. **No participant name, email, handle, One Thing, closing
  line or commitment line is ever committed.** Participants appear on the Log
  by code only. The code → person mapping lives in the scratchpad.
- Packets, ledgers, drafts: `$SCRATCH/lab/` only.
- The invitation link carries the owner's address, not the participant's.
- `lab.js` has no network call. The smoke test's no-fetch check covers it.
- Erase is one button on the Record card and is irreversible on purpose.

## Research boundary

This is a collaboration to refine a personal instrument, with a colleague who
knows what they are testing. If any participant data is ever to be reported,
presented or published — including as part of the owner's DBA — that is
human-subjects research and the FIU IRB decides what is required before, not
after. This file does not make that determination; it only says when the
question must be asked.

## What is different from the owner's instrument, and why

| Thing | Owner | Lab | Why |
|---|---|---|---|
| Ṣalāh | prayer-time engine, in-window per prayer | count of prayers held in window | no geolocation on a participant's device; still a tally, not a rating |
| Badan | sleep hours vs target, gym status, food flags | four ticked inputs | same four inputs, no module behind them |
| Stage-2 gate 3 | clean-day ratio ≥ 60% (ledger) | Ẓabt ≥ 3 on ≥ 8 of 14 | the Lab has no ledger; declared on the Log |
| Nav | five pages | Sheet · Log | the Lab is one sheet |

Everything else — rubrics, weights, phases, the other eight gates — is the same
text. When one changes, the other changes in the same commit.
