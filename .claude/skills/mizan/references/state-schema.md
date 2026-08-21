# Mīzān state contract

Everything persists to `localStorage` under the key `mizan.v1`. One JSON
object. No server, no sync, no export except the explicit **Export JSON**
button.

## Top level

| Key | Type | Notes |
|---|---|---|
| `v` | number | Schema version. Currently `1`. See *Migrations*. |
| `settings` | object | See below. |
| `days` | object | Map of `YYYY-MM-DD` → day record. The bulk of the data. |
| `urges` | array | Delay-and-decide log. Append-only in practice. |
| `ships` | object | Map of ISO week-start `YYYY-MM-DD` → bool. Phase-4 output requirement. |
| `measures` | array | Body-measurement index. Sparse — every field except `date` is optional. |
| `best50` | object | Map of standard id → level `0–5`. |

## `settings`

| Key | Default | Read by |
|---|---|---|
| `lat`, `lng` | `40.7357`, `-74.1724` (Newark NJ) | `prayerTimes()` |
| `method` | `'ISNA'` | `prayerTimes()`. One of `ISNA MWL EGYPT KARACHI MAKKAH`. |
| `asr` | `1` | `prayerTimes()`. `1` = standard, `2` = Ḥanafī shadow factor. |
| `path` | `'taper'` | Ledger. `'taper'` (Path A) or `'guard'` (Path B). |
| `start` | today | `phaseFor()`, `taper()`. The 40-day clock origin. |
| `cap` | `2` | `guardrails()` weekly session cap. |
| `floorHour` | `20` | `guardrails()` earliest permitted hour. |
| `weights` | `DEFW` | `indexOf()`, `facultyScore()`. Per-measure integer weights. |
| `gymDays` | `[0,2,4,6]` | `isGymDay()`. JS `getDay()` values — Sun/Tue/Thu/Sat. |
| `gymHour` | `17` | Spine block, `gymPrayerRule()`. |
| `partner` | `'Shahzaib'` | Display only. |
| `proteinTarget` | `150` | Food rule label. |
| `sleepTarget` | `7` | `badanScore()`. |

`load()` merges defaults over stored settings, so adding a setting is safe for
existing users — **as long as you add it to `defaults()`**. A setting read
directly from `S.settings` without a default will be `undefined` for everyone
with existing storage.

## Day record

Created lazily by `day(k)`. `blankDay()` defines the shape; `day()` re-
normalises nested objects on every read, which is what makes old records
forward-compatible. **Any new nested object must be normalised in `day()`,
not only in `blankDay()`** — otherwise it is `undefined` for every stored day
written before your change, and the failure surfaces as a `TypeError` in a
render function rather than at the point of the mistake.

| Field | Type | Written by | Read by |
|---|---|---|---|
| `date` | string | `blankDay` | — |
| `forecast` | number\|null | morning input | calibration chart |
| `prayers` | `{fajr,dhuhr,asr,maghrib,isha: 'in'\|'late'\|'miss'\|null}` | prayer grid | `salahScore()`, `collisions()` |
| `dhikrMin` | number | — | reserved |
| `sprints` | number | sprint timer completion | `amalScore()` |
| `oneThing` / `oneThingDone` | string / bool | Today card | `amalScore()` |
| `scores` | object | manual 0–3 segs | `scoreOf()` for non-computed measures |
| `weed` | `{sessions:[], clean:bool, fog:0–3}` | ledger | `ledger()`, `guardrails()`, `collisions()` |
| `friction` | bool[5] | attention card | display only |
| `hyper` | string | hyperfocus field | hyperfocus log |
| `muhasaba` | `{shukr,khata,kal}` | nightly close | display only |
| `closed` | bool | Close-the-day button | ladder gates, calibration, trend |
| `synthetic` | bool | `makeSample()` | **exclusion filter** — see below |
| `gym` | `{status,rpe,note}` | Badan | `badanScore()`, adherence, package |
| `food` | `{protein,window,thirds,late}` | Badan | `badanScore()`, coach's read |
| `weight` | number\|null | Badan | reserved for daily-weight trend |
| `sleepHrs` | number\|null | Badan | `badanScore()`, sleep-effect panel |
| `moved` | bool | Badan (non-gym days) | `badanScore()` |
| `rhr` | number\|null | Health import | reserved — recovery trend |

`weed.sessions[]` entries: `{time:'HH:MM', trigger, setting, displaced}`.
Trigger and displaced values come from the `TRIGGERS` / `DISPLACED` tables —
add there, never inline, or the distribution charts drop the new value
silently.

`gym.status` is one of `'done' | 'missed-me' | 'missed-partner' | null`. The
two miss values are deliberately distinct: a package burned by the trainer's
cancellation is a different fact from one the owner slept through, and
collapsing them destroys that.

`gym.src` is `'health'` when the entry came from a watch import rather than
the owner. It exists so the import can tell its own previous writes (safe to
replace) from a human judgment (never replace). A watch can see that movement
happened; it cannot see *why* a session did not, which is exactly the
distinction `missed-me` / `missed-partner` carries.

## Health import

`measures[].src` and `gym.src` both carry `'health'` for imported rows. The
import is governed by one rule: **fill gaps, never overwrite a human entry.**
`planHealthMerge()` builds a staged plan and counts what it is leaving alone;
nothing reaches state until the owner presses Apply.

| Apple Health type | Lands in | Guard |
|---|---|---|
| `BodyMass` | `days[k].weight`, thinned into `measures[]` | median per day; measurement-index rows thinned to one a fortnight and skipped within ±3 days of a manual entry |
| `SleepAnalysis` | `days[k].sleepHrs` | **`Asleep*` only — never `InBed`**, which overstates badly. Attributed to the day sleep *ends*. A single stretch over `SLEEP_MAX_BLOCK` (16h) is discarded as a broken record and reported; a day total is capped at `SLEEP_MAX_DAY` (18h). |
| `Workout` | `days[k].gym` | strength/HIIT and mobility count as a session; everything else counts only as movement. One headline session per day, strength outranking mobility. |
| `StepCount` | `days[k].moved` | `≥ STEP_MOVED` (6000) and only on a day with no logged session |
| `RestingHeartRate` | `days[k].rhr` | mean of the day's readings |

The file is streamed in 4 MB slices and scanned with regexes rather than
parsed into a DOM: a real `export.xml` runs to hundreds of megabytes and
`DOMParser` on it takes the tab down. `tail` carries the trailing partial
record across each slice boundary. Slicing at byte offsets can split a
multi-byte UTF-8 character, which is acceptable only because every field read
is ASCII — if you ever read a free-text field here, that stops being true.

## `measures[]` (body measurement index)

`{date, weight, neck, chest, uwaist, lwaist, wrist, hips, thighs, biceps,
forearms, calves, shoulders}` — all optional except `date`. Sparse by design;
the historical sheet has gaps of years, and the chart is time-scaled rather
than index-scaled so those gaps stay visible. Do not interpolate them away.

`lwaist` and `shoulders` drive the shoulder-to-waist ratio. If either is
missing from the latest entry the ratio walks backwards to the most recent
entry that has both.

## The `synthetic` exclusion rule

| Statistic | Synthetic included? |
|---|---|
| Trend charts, heatmap, ladder, deviation | yes |
| Clean streaks, best streak | no |
| Calibration scatter, MAE, bias | no |
| "Entries on record", package counter, gym effect | no |

The rule: if the number is a **claim about the owner**, exclude synthetic; if
it is a **demonstration of the display**, include it. Any new statistic must
pick a side, and the choice should be obvious from the code.

## Migrations

`v` is `1` and nothing has needed a migration yet, because `load()` merges
defaults and `day()` re-normalises. Prefer that pattern — it is why six months
of stored history survives a schema addition with no code.

A real migration is only needed when the *meaning* of an existing field
changes. In that case: bump `v`, write a migration in `load()` keyed on the
old value, and never mutate stored records in place without bumping. The
import path (`load2()`) must apply the same normalisation as `load()`; they
have drifted before and that is the single most likely place for a bug to hide.
