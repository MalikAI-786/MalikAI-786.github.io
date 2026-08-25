#!/usr/bin/env python3
"""
Business cards for the other streams — The Reference Mark family.

make_card.py owns the one personal card (Yasir A. Malik, Audit · Risk ·
Governance) and is left untouched: it is already tested, already in
brand-kit.zip, already linked from sent email. This file adds the cards for
everything else "the various brands I have created" actually names —
identities that already exist as avatars in make_avatars.py but never had a
print piece.

Same print geometry as the personal card (US 3.5x2in, 300dpi, 0.125in bleed
and safe margin) — imported from make_card.py rather than re-derived, and the
same letter/ring geometry — imported from make_avatars.py's letter_paths(),
which is where the M and P cuts were designed and clearance-checked against
the ring. Nothing here draws a letterform twice.

What is NOT here, on purpose: nothing about any legal matter, active or
otherwise. AGENTS.md safeguard 2/3 covers why — see the file itself.

Every descriptor line below is sourced from somewhere already public rather
than invented:
  Consulting     the five offers on index.html's #advisory table
  Malik LLC      "residential real estate" — from the approved LinkedIn kit
                 experience bullet, not a new claim
  Marketplace    no service description exists publicly yet, so the card
                 carries the name alone rather than a guessed one
  Proof Over Promise   the newsletter's own meta description
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from make_avatars import letter_paths
from make_card import DPI, BLEED_W, BLEED_H, TRIM, SAFE, guides
from palette import EMBER, VERDIGRIS, INK, PAPER, NIGHT, LIGHT, DIM, RULE_L, MUTED
import cairosvg

OUT = os.path.join(HERE, "business-cards")
os.makedirs(OUT, exist_ok=True)

SITE = "malikai-786.github.io"


def stream_mark(x, y, scale, letter, ring, letter_col, opacity=None):
    """The ring, node and a chosen letterform — reuses the exact geometry
    make_avatars.py already validated for M and P, and make_marks.py's own
    letter for A."""
    nx, ny = M.pt(M.GAP_MID)
    paths, weight = letter_paths(letter)
    op = f' opacity="{opacity}"' if opacity else ""
    strokes = "\n    ".join(
        f'<path d="{p}" stroke="{letter_col}" stroke-width="{M.f(weight)}" '
        f'stroke-linejoin="miter" stroke-linecap="butt"/>' for p in paths)
    return f'''<g transform="translate({x} {y}) scale({scale})"{op}>
    <path d="{M.ring_path()}" stroke="{ring}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{ring}"/>
    {strokes}
  </g>'''


def front(name, descriptor, contacts, letter, ring, tick):
    """contacts: list of (text, y) mono lines, right-aligned to the same x
    the name and descriptor use."""
    x = SAFE + 16
    lines = "\n".join(
        f'  <text x="{x}" y="{y}" font-family="{M.MONO}" font-size="25" '
        f'letter-spacing="1.2" fill="{MUTED}">{c}</text>' for c, y in contacts)
    desc_line = (
        f'  <text x="{x+2}" y="410" font-family="{M.MONO}" font-size="25" '
        f'letter-spacing="5" fill="{MUTED}">{descriptor}</text>'
        if descriptor else "")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BLEED_W} {BLEED_H}" fill="none">
  <rect width="{BLEED_W}" height="{BLEED_H}" fill="{PAPER}"/>
  <rect x="0" y="0" width="{BLEED_W}" height="14" fill="{tick}"/>
{stream_mark(x, 118, 1.75, letter, tick, INK)}
  <text x="{x}" y="330" font-family="{M.SERIF}" font-size="{62 if len(name) > 16 else 74}" fill="{INK}">{name}</text>
  <path d="M{x+3} 364 H{x+75}" stroke="{tick}" stroke-width="4"/>
{desc_line}
  <path d="M{x} 448 H{BLEED_W - SAFE - 16}" stroke="{RULE_L}" stroke-width="2"/>
{lines}
</svg>
'''


CAPTION_SAFE_W = BLEED_W - 2 * SAFE - 32   # usable width for the caption line


def back(caption, letter, tick):
    """The caption is one centred mono line — the same treatment as the
    personal card's back. Font size steps down for a longer caption rather
    than trusting every caller to hand-fit one; the first version of this
    generator did not, and a three-offer caption ran clean off both edges
    of the card."""
    cx = BLEED_W / 2
    size, spacing = 24, 5
    # Rough advance for this mono face: ~0.6em per glyph plus letter-spacing.
    while size > 13 and len(caption) * (size * 0.6 + spacing) > CAPTION_SAFE_W:
        size -= 1
    if len(caption) * (size * 0.6 + spacing) > CAPTION_SAFE_W:
        raise SystemExit(
            f"back() caption still overflows at the smallest step: "
            f"{caption!r} ({len(caption)} chars). Shorten it — this is a "
            "print piece, not a paragraph.")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BLEED_W} {BLEED_H}" fill="none">
  <rect width="{BLEED_W}" height="{BLEED_H}" fill="{NIGHT}"/>
{stream_mark(BLEED_W - 300, -70, 8.2, letter, tick, LIGHT, opacity=".07")}
{stream_mark(cx - 96, 150, 3.0, letter, tick, LIGHT)}
  <path d="M{cx - 60} 430 H{cx + 60}" stroke="{tick}" stroke-width="4"/>
  <text x="{cx}" y="490" text-anchor="middle" font-family="{M.MONO}" font-size="{size}" letter-spacing="{spacing}" fill="{DIM}">{caption}</text>
</svg>
'''


# (slug, front svg, back svg) — every card the family currently has beyond
# the personal one in make_card.py.
CARDS = {}

CARDS["consulting"] = (
    front("Yasir A. Malik", "GOVERNANCE-FIRST AI ADVISORY",
          [("YasirAMalik@gmail.com", 496), ("+1 (786) 704-8536", 540),
           (f"{SITE}/#advisory", 584)],
          "A", EMBER, EMBER),
    back("GOVERNANCE-FIRST AI ADVISORY", "A", EMBER),
)

CARDS["malik-llc"] = (
    front("Malik LLC", "RESIDENTIAL REAL ESTATE",
          [("YasirAMalik@gmail.com", 496), ("+1 (786) 704-8536", 540),
           (SITE, 584)],
          "M", VERDIGRIS, VERDIGRIS),
    back(f"{SITE.upper()}", "M", VERDIGRIS),
)

CARDS["malik-marketplace"] = (
    front("Malik Marketplace", "",
          [("YasirAMalik@gmail.com", 496), (SITE, 540)],
          "M", EMBER, EMBER),
    back(f"{SITE.upper()}", "M", EMBER),
)

CARDS["proof-over-promise"] = (
    front("Proof Over Promise", "AI GOVERNANCE · MODEL RISK · JUDGMENT",
          [("proofoverpromise.substack.com/subscribe", 496),
           ("Yasir A. Malik, author", 540)],
          "P", VERDIGRIS, VERDIGRIS),
    back("PROOFOVERPROMISE.SUBSTACK.COM", "P", VERDIGRIS),
)


if __name__ == "__main__":
    for slug, (front_svg, back_svg) in CARDS.items():
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        for name, svg in (("card-front", front_svg), ("card-back", back_svg)):
            open(os.path.join(d, name + ".svg"), "w").write(svg)
            cairosvg.svg2png(bytestring=svg.encode(),
                             write_to=os.path.join(d, name + ".png"),
                             output_width=BLEED_W)
            cairosvg.svg2pdf(bytestring=svg.encode(),
                             write_to=os.path.join(d, name + ".pdf"))
            cairosvg.svg2png(bytestring=guides(svg).encode(),
                             write_to=os.path.join(d, name + "-guides.png"),
                             output_width=BLEED_W)
        print(f"  {slug:20s} front + back, png + pdf + guides")

    print(f"\n{len(CARDS)} cards, 3.5x2in @ {DPI}dpi, in {os.path.relpath(OUT, HERE)}/")
