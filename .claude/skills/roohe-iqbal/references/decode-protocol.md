# Decode record

Fill this in after reading the frames. Save to `content/decodes/<date>-<slug>.md`
if the record is being kept, or return it inline if it is a one-off.

The three sections are separated on purpose. Collapsing "what is on screen"
into "what it means" is how content notes become confident fiction about a
video nobody re-watched.

```markdown
# <slug> — decoded <date>

## 1. Inventory — what is actually there
Duration · aspect · cuts · text-frames vs face-frames
On-screen text, verbatim, in order, with timecodes:
  0.0  …
  1.8  …
Typography: script, weight, size relative to frame, colour
Motion: static / slow push / cut-on-beat / kinetic type
Audio: <transcript if supplied, otherwise "not transcribed — no speech model">
Caption as posted: <verbatim>

## 2. Reading — what the reel is doing
Beat map against the five beats (hook / line / plain reading / turn / source):
  which are present, which are missing, which are out of order
The argument, in one sentence. If none can be written, that is the finding.
Hook: what is put at risk in the first 1.5s? If nothing, say so.
Provenance shown on screen? Y/N — and is it correct?
Series: which of the five, or none.

## 3. Changes — ranked, most valuable first
1. …
2. …
Each with the reason, not just the instruction.

## 4. Provenance check
Couplet: <Urdu>
Claimed source: <as shown>
Register tier: A / B / C
Action: safe to publish / verify first / do not publish

## 5. Merch signal
Does the line clear the three gates? Which gate does it fail?
```

## How to read frames well

- **Read `scene/` in order first.** The cuts *are* the argument's paragraph
  breaks. A reel with three cuts and four ideas has a structural problem that
  no caption fixes.
- **Then scan `grid/`.** Text that fades in without a hard cut is invisible to
  the scene detector and is often the turn — the most important line in the
  post.
- **Transcribe before interpreting.** Every word. Including the small text,
  the handle, the source line if there is one.
- **Notice what is missing.** No source line, no hook, a couplet with no
  reading — absences are the highest-value findings and they are easy to skim
  past because nothing is there to catch the eye.
- **Count the seconds before the first idea lands.** In this genre, more than
  about 1.5 seconds of logo, ambience or throat-clearing is the whole problem,
  and it is almost always invisible to the person who made it.
