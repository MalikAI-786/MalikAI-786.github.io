# Handing a coach a view

How a coach gets read-only sight of the training record without an account,
a server, or a copy of anything clinical. Read this before minting a link,
writing a coach email, or changing `mizan/coach/index.html`.

## The one rule

**Base64 is encoding, not encryption.** A snapshot link is readable by anyone
who holds the URL — it survives in chat logs, browser history, autocomplete
and forwarded messages long after the conversation ends. The fragment never
reaching a server is a true fact that protects nothing here, because *the link
itself is the payload*.

Two controls follow from that, and both are mandatory:

1. **Scope.** Mint the narrowest payload that answers the coach's question.
2. **Expire.** Every payload carries `ttl` (days) and `generated`. The page
   computes age at open and refuses to render past it.

## Scopes

| Scope | Sessions/splits | Upper-only splits | Skill levels | Body measurements | Clinical |
|---|---|---|---|---|---|
| `training` | yes, all | no | no | no | **never** |
| `upper` | no | yes — push/pull/shoulder/arms only | no | no | **never** |
| `skills` | no | no | yes — split, planche line, pull-up | no | **never** |
| `body` | yes, all | no | no | yes | **never** |

Each scope has a *default* view (set in the payload's `view` field so the
page opens on the right tab), but the menu still offers every tab the payload
has data for — an empty tab renders its honest empty state rather than
disappearing, so a coach who clicks around never mistakes "not sent" for
"not asked."

`upper` and `skills` exist because Shahzaib and Tanveer coach different
things: Shahzaib owns spine and upper-body programming (push, pull, shoulder,
arms), Tanveer owns flexibility and the skill line (front split, the planche
progression, the pull-up standard). Sending either coach the full session log
or the full skill ladder would show them a brief that isn't theirs — scope
the link to the actual handoff, not to "everything, why not."

**`skills` levels are minted at 0 (not started) by design**, not by mistake:
the minter script has no access to the owner's local `mizan.v1` state, where
the real Best-50 levels live only in the owner's browser. A `skills` link is
honest about carrying no current-level data until the owner tests and reports
levels for a re-mint — the payload's `standfirst` says so on the page itself,
so a coach reading level 0 does not mistake it for a tested result.

Verify every scope by opening the minted link and switching to its default
tab, not by reading the minter. Both halves have to agree, and only the
render proves it — this is how the "clinical never travels" and "body-scope
link had no measures panel" gaps were both caught in this repo's history.

Names never travel either. The `asks` role table and the change-request `From`
dropdown carry roles — *training coach*, *nutrition / clinical*, *me* — not
people. A coach's name attached to a training record is a personal record
about a third party, and both this file and the page are public.

There is no scope that encodes clinical data. Diagnoses, medication, blood
work and anything a clinician would recognise as a record stay out of the
payload at every scope, and out of this repo entirely — they live only in the
owner's local `mizan.v1` storage. If a coach needs a clinical constraint, it
goes in the covering email as a sentence, not in the data.

The minter lives in the session scratchpad, not here: it reads the owner's
private session export, so committing it would commit the data. Rebuild it
from this table when you need it. Its whole job is: build the dict, drop
`measures` unless scope is `body`/`full`, never add a clinical key at all,
base64url the JSON, prefix `https://…/mizan/coach/#d=`.

## Expiry, in the page

```js
var TTL = +(D.ttl || 7);
var age = Math.floor((Date.now() - made) / 864e5);
D._age = age;
D._left = Math.max(0, Math.min(TTL, TTL - age));   // clamp both ends:
                                                   // clock skew must not read
                                                   // as a longer life
if (age > TTL) { /* show #expired, D = null */ }
```

Seven days is the default. It is short on purpose — a coach who still needs
the view asks for a fresh link, and that request is the audit trail.

## The coach page is standalone

`mizan/coach/index.html` carries its own CSS and JS and does **not** load
`core.js`. That is deliberate: it renders a payload handed to it, never the
owner's local state, so it must not be able to reach that state at all. The
smoke test knows this and skips the nav and engine checks for `coach/`.

Its categorical palette is validated (Ember 500 `#E0662E` + Verdigris 300
`#4FC0B2`, all six checks pass). If you add a series, revalidate — do not
eyeball a third colour in.

One trap, already paid for: in a split bar, both the track and the fill must
be `display:block`. A bare `<span>` is inline, `width`/`height` are silently
ignored, and the bar renders as a zero-size box on a full-width track. It
looks like missing data, not like a CSS bug.

## The return path

A change request that must be copied, pasted into another app and sent by hand
is a change request that does not get made. The feedback box therefore offers
**Send it to me**, which builds a `mailto:` and hands off to the OS mail
client. That is not a network call — nothing is fetched — so it does not
breach the no-network invariant.

The destination address rides in the payload as `feedbackTo`, **never in
`mizan/coach/index.html`**. That file is served from a public Pages site, and
an address committed there is an address that gets scraped. The smoke test
asserts no address is hard-coded. If `feedbackTo` is absent the button stays
hidden and the copy-to-clipboard path remains, so an older link still works.

## Installing it (what the PDF explains)

The page ships a `manifest.webmanifest` with `display: standalone`, so it
installs to a home screen or dock and opens without browser chrome.

Two things had to be fixed before that actually worked, and both fail
silently:

1. **Chrome will not offer installation without a 192px and a 512px icon.**
   The manifest originally listed neither, so the install path simply never
   appeared on Android or desktop. The smoke test now asserts both sizes are
   declared *and* present on disk.
2. **A `start_url` cannot carry a fragment.** iOS keeps the current URL when
   you Add to Home Screen, but an Android or desktop install launches
   `start_url` — with no `#d=`, and therefore no data. The page now stores the
   decoded snapshot under `mizan.coachsnap` on first open and restores it when
   launched without a fragment, saying on screen that it has done so. Expiry
   is applied to the restored copy exactly as to a fresh one, and an expired
   snapshot is **removed** from storage rather than left to resurrect itself.

The install bar itself branches three ways, because only one of them can be a
button: Chrome and Edge fire `beforeinstallprompt` and hand over a real prompt;
iOS Safari fires nothing and exposes no API, so it gets the Share → Add to
Home Screen instruction; and an in-app browser (WhatsApp, Instagram, Facebook)
gets told to reopen in a real browser first, because that is the single most
common reason a coach reports the save option "missing".

| Platform | Path |
|---|---|
| iPhone / iPad | Safari → Share → Add to Home Screen |
| Android | Chrome → ⋮ → Install app |
| Mac / Windows | Chrome or Edge → install icon in the address bar |

Safari on iOS will not install from an in-app browser. A coach who taps the
link inside WhatsApp gets a working page but no install prompt — the email
and the PDF both have to say "open in Safari first", because otherwise they
will assume it is broken.

The onboarding PDF is generated from a scratchpad HTML file through Chromium
`page.pdf({format:'A4', printBackground:true})`. It is not committed: it
carries the owner's name and, depending on the recipient, a clinical
constraint sentence. Regenerate it per handoff.

## Email templates

Fill the placeholders at send time. Never commit a filled copy — a coach's
name plus a training record is a personal record about a third party, and this
repo is public.

### Template A — the training coach

> Subject: `Your read-only view of my training record`
>
> `{{COACH}}` — before we start, here is the whole record of the last block
> in one screen. It is read-only, it is yours, and it needs no account.
>
> **Link:** `{{TRAINING_LINK}}`
> **Guide:** attached PDF — three steps, plus how to save it to your phone.
>
> Open it in `{{Safari / Chrome}}` rather than inside WhatsApp, or the
> save-to-home-screen option will not appear.
>
> What you are looking at: `{{N}}` logged sessions across `{{SPAN}}`,
> normalised into nine split categories, with attendance and frequency
> computed rather than remembered. The number I would start on is
> `{{THE ONE FINDING}}`.
>
> The link expires in `{{TTL}}` days. Ask me and I will send a fresh one —
> that is the design, not a fault.
>
> `{{CLINICAL CONSTRAINT, one sentence, if relevant to this coach}}`
>
> There is a change-request box at the bottom of the page. Anything you want
> added, cut or measured differently goes there and comes to me as text.

### Template B — the second coach (standards / body)

Same shape, with `{{BODY_LINK}}`, and centred on the standards rather than the
history: name the five, name which are already close, name the one the record
says is starving. Add the measurement caveat — the body index is sparse by
design and has multi-year gaps that are real, not missing data.

### Both emails must carry

- the scope, named ("this is the training view; it has no body measurements")
- the expiry, in days
- the fact that nothing is stored server-side, so there is no account, no
  password, and nothing for them to lose
- one concrete finding, so the link opens with a question already attached
