---
name: roohe-iqbal
description: >-
  Decode and develop content for @rooheiqbal — the Iqbal / khudī Instagram
  account, its reels, captions, series architecture and the merch line growing
  out of it. Use this skill whenever a video, reel, screen recording, screenshot
  or Instagram link is shared and the subject is Iqbal, khudī, an Urdu or
  Persian couplet, or the account itself; whenever the ask is to "decode this",
  "what's this reel doing", "make this better", "write the caption", "what
  should I post", "what series does this belong to"; and whenever the work
  touches the hoodie, a print, a slogan or anything that puts a line of Iqbal on
  a physical object. Also use it when planning a posting week, reviewing what
  performed, or deciding whether a couplet is safe to publish. It carries the
  ffmpeg decode pipeline (a reel becomes readable frames), the provenance rule
  that protects the account's whole positioning, the format grammar, the five
  series, and the three gates a line must clear before it can be printed.
---

# Roohe Iqbal — decoding reels, and building on them

## The positioning this protects

The Iqbal-quote niche is enormous and almost entirely undifferentiated: a
couplet, a gradient, a nasheed, no argument and frequently no correct source.
A large share of what circulates is misattributed — lines assigned to Iqbal
that he did not write, and lines of his read as the opposite of what they say.

The account's only durable edge is that it is a **reading** account rather than
a quote account. Every post makes one argument and names where the line comes
from. That is also the only edge its owner can uniquely hold: he is a bank
examiner and a doctoral researcher on how professional judgment degrades when
an assistant makes an answer feel more certain than the evidence supports.
**An account about epistemic care, run by someone who does that for a living,
cannot afford a single misattribution.** Everything below follows from that.

## Decoding a shared reel

Run the pipeline, then read what it produces:

```bash
bash .claude/skills/roohe-iqbal/scripts/decode.sh <video> [outdir]
```

It writes `scene/` (one frame per cut — this is the edit, and the edit is the
argument), `grid/` (one per second, catching text that fades in without a cut),
`probe.txt`, and an extracted `audio.m4a`.

**Then Read every frame in `scene/`, then scan `grid/`.** Transcribe every
on-screen word *before* interpreting anything. The most common failure here is
summarising a reel from its first frame and its vibe, which produces confident
notes about a video you did not actually watch.

**Known limit, state it rather than working around it:** there is no speech-to-
text in this environment — model downloads are refused by the egress proxy. The
decode is visual plus whatever caption or voiceover text is supplied. If the
audio carries something the frames do not, ask for the caption, the script, or
a screen recording with captions burned in. Never infer a voiceover from
imagery and present it as transcribed.

If only a link is shared: Instagram is blocked at the network layer, so nothing
can be fetched. Ask for the file or a screen recording. Say that plainly; do
not guess at content from the URL slug.

Fill in the decode record from `references/decode-protocol.md`. It separates
**what is on the screen** from **what the reel is doing** from **what to change**,
because collapsing those three is how content notes become useless.

## Then: is it any good?

Judge against `references/content-system.md`, which holds the format grammar
(the five beats of a reel that works in this genre), the five named series, the
caption structure, and — importantly — **which metrics to read.** Likes are
noise here. Saves and shares against reach are the signal, because they measure
whether a line was worth keeping, which is the same question the merch line
later asks with money.

The most valuable output is usually not praise or a rewrite. It is **naming
which series the reel belongs to**, because a page compounds through series and
dissolves through one-offs. A good reel with no series is a worse asset than an
average reel that is episode four of something.

## Provenance — the rule that outranks the content

Before any couplet goes into a caption, a graphic, or a garment:

- **Collection named, or attribution declared unverified.** `Bāl-e-Jibrīl`,
  `Bāng-e-Darā`, `Zarb-e-Kalīm`, `Asrār-i-Khudī`, `Rumūz-i-Bekhudī`,
  `Javīd Nāma`, `Payām-e-Mashriq`, `Armaghān-e-Ḥijāz`. If it cannot be placed,
  either say so on the post or do not use it.
- **Prose from *The Reconstruction* is paraphrase**, never quotation marks.
- **Persian and Urdu are different corpora.** *Asrār* and *Rumūz* are Persian;
  quoting them in Urdu transliteration without saying so is an error people in
  this audience will catch, and being caught is the one thing the positioning
  does not survive.
- Widely circulated lines are the *most* suspect, not the least — virality
  selects for shareability, not accuracy.

`references/iqbal-corpus.md` is the running register: what has been verified,
what is provisional, what has been checked and rejected. Add to it every time.
It is the same discipline as the `mizan` skill's citation register, and for the
same reason — that page and this account make claims about the same texts and
must not contradict each other.

## Merch

A line reaching a hoodie is a one-way door: cotton cannot be edited, and a
misattribution on a garment is permanent and photographed. `references/merch.md`
holds the three gates a line must clear, the brand tokens it must use (the
identity system already lives in this repo — merch inherits it rather than
inventing), and the current candidates ranked.

## Working rhythm

Batch, do not drip. One filming session produces a week; scheduling seven
separate acts of starting is the expensive part, and the account is being run
alongside a job and a doctorate. Four posts a week from one Sunday session
beats an intention to post daily, every time.

## Reference files

- `references/decode-protocol.md` — the decode record format.
- `references/content-system.md` — format grammar, the five series, captions,
  metrics, cadence.
- `references/iqbal-corpus.md` — verified / provisional / rejected couplets.
- `references/merch.md` — the three gates, brand tokens, current candidates.
