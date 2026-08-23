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
  ffmpeg decode pipeline, the provenance rule, the format grammar, the five
  series, and the three gates a line must clear before it can be printed.
---

# Roohe Iqbal — decoding reels, and building on them

## Positioning
The account is a **reading** account rather than a quote account. Every post makes one argument and names where the line comes from. Misattribution is therefore a first-order failure.

## Decoding a shared reel
Run:

```bash
bash .claude/skills/roohe-iqbal/scripts/decode.sh <video> [outdir]
```

Read every frame in `scene/`, then scan `grid/`. Transcribe every on-screen word before interpretation. Do not infer inaudible or inaccessible audio.

If only a blocked link is available, say the content was not observed and request/capture an accessible file or screen recording. Do not guess from the URL.

Use `references/decode-protocol.md` for the decode record.

## Content system
Use `references/content-system.md` for the five-beat reel grammar, series architecture, captions, cadence and metrics. Saves/reach and shares/reach matter more than raw likes.

## Provenance
Before any couplet enters a caption, graphic or garment:
- Name the collection or label attribution unverified.
- Treat prose from *The Reconstruction* as paraphrase unless exact wording is verified.
- Distinguish Persian and Urdu corpora.
- Treat widely circulated lines as needing more scrutiny, not less.

Use `references/iqbal-corpus.md` as the working register, not as the ultimate authority.

## Merch
Use `references/merch.md`. A line reaches print only after provenance, feed-performance and out-of-context legibility gates are cleared.

## Reference files
- `references/decode-protocol.md`
- `references/content-system.md`
- `references/iqbal-corpus.md`
- `references/merch.md`
