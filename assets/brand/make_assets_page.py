#!/usr/bin/env python3
"""
The asset index — every finished file, grouped by where it goes.

Organised by destination rather than by file type on purpose. Nobody opens an
asset page wanting "the PNG directory"; they open it holding a form that wants
a profile photo, or a slide that wants a logo. So the question the page answers
is "what do I put here", and the file is the answer.

Dimensions are read off the files themselves rather than typed in, because a
stated size that has drifted from the real one is worse than no size at all.
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "brand-assets.html")

# (section title, blurb, [(path relative to assets/brand, label, where it goes)])
SECTIONS = [

("Profile photo", "The same face everywhere. One upload, five places.", [
 ("portrait/portrait-square.png", "Square portrait",
  "<b>Start here.</b> LinkedIn, GitHub, Substack, Gmail, Notion, Zoom. The navy "
  "studio backdrop is graded to warm graphite so it sits in the palette; skin and "
  "shirt are untouched."),
 ("portrait/portrait-circle.png", "Circular cut",
  "Transparent outside the circle, with the ember hairline. For slides and decks "
  "where the portrait sits on a coloured ground."),
 ("portrait/portrait-duotone.png", "Duotone",
  "Mapped fully into the palette. Editorial use beside the mark — article headers, "
  "anywhere the photograph should read as brand rather than as a photograph."),
]),

("Covers and headers", "The wide ones. Each is cut for a specific crop.", [
 ("linkedin/cover-dark.png", "LinkedIn cover — dark",
  "1584×396. Motto and vision sit upper-centre, clear of the mobile crop and the "
  "profile-photo circle. Matches the GitHub profile."),
 ("linkedin/cover-light.png", "LinkedIn cover — light",
  "Same geometry, warm ground. Matches the site. Pick one and keep it."),
 ("profile-readme/profile-hero-dark.png", "GitHub profile hero — dark",
  "Live at the top of github.com/MalikAI-786."),
 ("profile-readme/profile-hero-light.png", "GitHub profile hero — light",
  "The same hero for readers on a light GitHub theme."),
]),

("Speaker and press", "For a bio slide, a panel intro, or a conference form.", [
 ("portrait/speaker-dark.png", "Speaker card — dark",
  "1600×900. Photo, mark, name and the vision line in one frame. Drops straight "
  "into a deck at 16:9."),
 ("portrait/speaker-light.png", "Speaker card — light",
  "Same card on warm paper, for printed programmes and light decks."),
]),

("The mark", "Vector. Scales to a billboard or a favicon without redrawing.", [
 ("mark.svg", "The Reference Mark", "The primary mark. Ember ring, warm black letter."),
 ("mark-ember.svg", "Ember cut", "For light grounds."),
 ("mark-ember-dark.svg", "Reversed", "For dark grounds."),
 ("mark-micro.svg", "Micro cut",
  "Below 32px. Thicker strokes and a wider gap, because the full mark fills in at "
  "small sizes."),
 ("mark-badge.svg", "Badge", "Solid ground, for placement over photography."),
]),

("Wordmark and lockups", "Name and mark set together, with the spacing fixed.", [
 ("lockup-horizontal.svg", "Horizontal lockup", "Email signatures, letterheads, footers."),
 ("lockup-horizontal-dark.svg", "Horizontal, reversed", "The same on a dark ground."),
 ("lockup-stacked.svg", "Stacked lockup", "Where width is tight — cards, avatars, stamps."),
 ("wordmark.svg", "Wordmark", "Name alone, when the mark already appears nearby."),
 ("wordmark-dark.svg", "Wordmark, reversed", ""),
 ("signature-mark.svg", "Signature mark", "Sized for the bottom of an email."),
]),

("Account avatars", "One letter per stream, so the accounts read as a family.", [
 ("avatars/yasir-a-malik/avatar-dark.png", "A — Yasir A. Malik", "Ember. The personal account."),
 ("avatars/malik-llc/avatar-dark.png", "M — Malik LLC", "Verdigris, because the company verifies."),
 ("avatars/malik-marketplace/avatar-dark.png", "M — Malik Marketplace", "Ember, to separate it from the LLC."),
 ("avatars/proof-over-promise/avatar-dark.png", "P — Proof Over Promise", "Verdigris. The newsletter."),
]),

("Business card", "Print-ready, with bleed and safe area verified.", [
 ("card/card-front.png", "Front", "Also available as PDF, which is what a printer wants."),
 ("card/card-back.png", "Back", ""),
]),

("Social and favicons", "The small ones that get forgotten.", [
 ("og-card.png", "Open Graph card", "The preview image when the site is shared."),
 ("icon-512.png", "App icon", "512px. Also at 192 and 32."),
 ("apple-touch-icon.png", "Apple touch icon", "Home-screen icon on iOS."),
]),
]


def dims(path):
    if path.endswith(".svg"):
        return "SVG · vector"
    try:
        with Image.open(path) as im:
            return f"{im.width}×{im.height}"
    except Exception:
        return ""


def card(rel, label, note):
    full = os.path.join(HERE, rel)
    if not os.path.exists(full):
        return None, rel
    size = os.path.getsize(full)
    kb = f"{size // 1024} KB" if size >= 1024 else f"{size} B"
    src = f"assets/brand/{rel}"
    dark = "dark" in rel or "duotone" in rel
    return (f'''    <figure class="asset{' on-dark' if dark else ''}">
      <a class="thumb" href="{src}" target="_blank" rel="noopener">
        <img src="{src}" alt="{label}" loading="lazy">
      </a>
      <figcaption>
        <h3>{label}</h3>
        {f"<p>{note}</p>" if note else ""}
        <div class="meta"><span>{dims(full)}</span><span>{kb}</span></div>
        <a class="dl" href="{src}" download>Download</a>
      </figcaption>
    </figure>''', None)


def build():
    body, missing = [], []
    for title, blurb, items in SECTIONS:
        cards = []
        for rel, label, note in items:
            html, miss = card(rel, label, note)
            if miss:
                missing.append(miss)
            else:
                cards.append(html)
        if not cards:
            continue
        body.append(f'''<section>
  <div class="wrap">
    <h2>{title}</h2>
    <p class="sub">{blurb}</p>
    <div class="grid">
{chr(10).join(cards)}
    </div>
  </div>
</section>''')
    return "\n\n".join(body), missing


HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Brand assets — Yasir A. Malik</title>
<meta name="description" content="Every finished brand asset, grouped by where it goes: profile photo, covers, the mark, lockups, avatars, business card." />
<link rel="stylesheet" href="assets/brand/tokens.css" />
<link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml" />
<meta name="theme-color" content="#E0662E" />
<meta name="robots" content="noindex" />
</head>
<body>
<style>
  *{box-sizing:border-box;}
  body{margin:0;background:var(--ground);color:var(--ink);
    font-family:var(--statement);line-height:1.6;-webkit-font-smoothing:antialiased;}
  a{color:var(--accent-ink);text-underline-offset:3px;}
  :focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
  .wrap{max-width:1120px;margin:0 auto;padding:0 24px;}

  nav.top{position:sticky;top:0;z-index:60;
    background:color-mix(in srgb, var(--ground) 92%, transparent);
    backdrop-filter:saturate(150%) blur(9px);
    border-bottom:1px solid var(--line);border-top:3px solid var(--accent);}
  .nav-inner{display:flex;align-items:center;justify-content:space-between;
    height:56px;max-width:1120px;margin:0 auto;padding:0 24px;}
  .brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);}
  .brand .name{font-family:var(--record);font-size:1rem;font-weight:700;
    letter-spacing:var(--track-record);}
  .back{font-family:var(--instrument);font-size:.7rem;letter-spacing:.09em;
    text-transform:uppercase;color:var(--muted);text-decoration:none;}
  .back:hover{color:var(--ink);}
  .logo .ring,.logo .node{stroke:var(--accent);fill:none;}
  .logo .node{fill:var(--accent);stroke:none;}
  .logo .letter{stroke:currentColor;}

  header.hero{padding:56px 0 34px;}
  .eyebrow{font-family:var(--instrument);font-size:.68rem;
    letter-spacing:var(--track-instrument);text-transform:uppercase;
    color:var(--accent-ink);margin:0 0 14px;}
  h1{font-family:var(--record);font-size:clamp(2.1rem,5vw,3rem);
    letter-spacing:var(--track-record);margin:0 0 16px;line-height:1.1;font-weight:700;}
  .lede{font-family:var(--record);font-size:1.1rem;line-height:1.68;
    color:var(--muted);max-width:62ch;margin:0;}

  section{padding:40px 0;border-top:1px solid var(--line);}
  h2{font-family:var(--record);font-size:1.4rem;letter-spacing:var(--track-record);margin:0 0 6px;}
  .sub{color:var(--muted);margin:0 0 22px;max-width:64ch;font-size:.95rem;}

  .grid{display:grid;gap:16px;
    grid-template-columns:repeat(auto-fill,minmax(280px,1fr));}
  .asset{margin:0;border:1px solid var(--line);border-radius:var(--radius);
    background:var(--surface);overflow:hidden;display:flex;flex-direction:column;}
  .thumb{display:flex;align-items:center;justify-content:center;
    padding:18px;min-height:150px;background:var(--ground);
    border-bottom:1px solid var(--line);}
  .asset.on-dark .thumb{background:#0E1114;}
  .thumb img{max-width:100%;max-height:190px;height:auto;display:block;}
  figcaption{padding:15px 17px 17px;display:flex;flex-direction:column;flex:1;}
  figcaption h3{font-family:var(--record);font-size:1rem;margin:0 0 6px;
    letter-spacing:var(--track-record);}
  figcaption p{margin:0 0 11px;font-size:.87rem;line-height:1.55;color:var(--muted);}
  .meta{display:flex;gap:14px;font-family:var(--instrument);font-size:.63rem;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-top:auto;padding-top:4px;}
  .dl{display:inline-block;margin-top:11px;font-family:var(--instrument);
    font-size:.72rem;letter-spacing:.03em;font-weight:600;text-decoration:none;
    padding:8px 15px;border:1px solid var(--line);border-radius:var(--radius);
    color:var(--ink);align-self:flex-start;}
  .dl:hover{border-color:var(--accent);color:var(--accent-ink);}

  .note{background:var(--surface);border:1px solid var(--line);
    border-left:3px solid var(--accent);border-radius:0 var(--radius) var(--radius) 0;
    padding:16px 19px;font-size:.9rem;line-height:1.62;color:var(--muted);max-width:70ch;}
  .note b{color:var(--ink);}

  footer.foot{padding:26px 0 46px;color:var(--muted);font-size:.75rem;
    font-family:var(--instrument);border-top:1px solid var(--line);}
  .foot-in{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;}
</style>

<nav class="top">
  <div class="nav-inner">
    <a class="brand" href="index.html">
      <svg class="logo" width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M22.28 11.15 A23 23 0 1 1 9.78 26.05" class="ring" stroke-width="7" stroke-linecap="round"/>
        <circle cx="14.38" cy="17.22" r="5.46" class="node"/>
        <path d="M19.5 46.5 L32 19 L44.5 46.5" class="letter" stroke-width="8" stroke-linejoin="miter" stroke-linecap="butt"/>
        <path d="M21.6 38.4 H42.4" class="letter" stroke-width="8" stroke-linecap="butt"/>
      </svg>
      <span class="name">Yasir A. Malik</span>
    </a>
    <a class="back" href="brand.html">The brand system →</a>
  </div>
</nav>

<header class="hero">
  <div class="wrap">
    <div class="eyebrow">Assets</div>
    <h1>Everything, ready to use.</h1>
    <p class="lede">Grouped by where it goes rather than by file type. Tap any
    image to open it full size, or Download to save it. Every file here is
    generated from the constants in <code>make_marks.py</code>, so they are all
    provably the same mark rather than nine drawings that resemble each other.</p>
  </div>
</header>
'''

FOOT = '''
<section style="border-bottom:0;">
  <div class="wrap">
    <h2>Before you upload</h2>
    <div class="note">
      <b>Use the square portrait for every profile.</b> The same face in every
      place is most of what people mean by a consistent brand, and it costs one
      upload. <b>Pick dark or light for the LinkedIn cover and do not revisit
      it.</b> Dark matches the GitHub profile; light matches the site. Either is
      right; switching between them is the only wrong answer.
      <br><br>
      <b>These files are outputs, not sources.</b> Do not retouch a PNG or edit
      an SVG by hand — the change will be lost the next time a generator runs.
      Change the generator in <code>assets/brand/</code> and re-run it.
    </div>
  </div>
</section>

<footer class="foot">
  <div class="wrap foot-in">
    <span>Brand assets · Yasir A. Malik</span>
    <span><a href="brand.html">The brand system</a> · <a href="index.html">malikai-786.github.io</a></span>
  </div>
</footer>
</body>
</html>
'''

if __name__ == "__main__":
    body, missing = build()
    with open(OUT, "w") as fh:
        fh.write(HEAD + "\n" + body + FOOT)

    n = body.count('<figure class="asset')
    print(f"  brand-assets.html   {n} assets, {os.path.getsize(OUT) // 1024} KB")
    for m in missing:
        print(f"  SKIPPED (not on disk): {m}")
