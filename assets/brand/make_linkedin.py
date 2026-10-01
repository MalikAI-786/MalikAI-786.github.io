#!/usr/bin/env python3
"""
LinkedIn cover, The Reference Mark.

1584 x 396 (4:1). Two constraints drive the whole layout:

  1. LinkedIn crops roughly 117px from each side on desktop and about 15%
     each side on mobile, so the usable band is ~1350 x 220 centred.
  2. The circular profile photo sits on the bottom-left, roughly 200px in
     and 150px up, and is proportionally larger on mobile.

So the bottom-left quadrant is dead space and everything meaningful sits
upper-centre. The cover does not repeat his name: LinkedIn already prints
it directly underneath.

Refit to the same frame as the profile hero and the repository banners: the
mark, a kicker, a title, a sub. The ember stripe, the ghost mark bleeding off
the right edge and the vertical divider are gone — they were furniture around
the statement, and on a surface LinkedIn already fills with a photo, a name and
a headline, furniture is the first thing to go. The hero carries the same four
elements plus a face; this cover is the hero with the face supplied by the
profile circle instead.
"""
import io, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import (EMBER, EMBER_TEXT, EMBER_TINT, NIGHT, LIGHT, DIM,
                     PAPER, INK, MUTED)
import cairosvg
from PIL import Image

OUT = os.path.join(HERE, "linkedin")
os.makedirs(OUT, exist_ok=True)

W, H = 1584, 396
SAFE_W, SAFE_H = 1350, 220           # centred band that survives desktop crop
SAFE_X, SAFE_Y = (W - SAFE_W) // 2, (H - SAFE_H) // 2
PHOTO_CX, PHOTO_CY, PHOTO_R = 200, H - 150, 96   # profile photo footprint

# Four roles for four elements. `kick` is a role, not a constant: at 15px it
# cannot be ember-500 on paper (3.11:1), so ember-650 on light, ember-tint on
# dark — the same rule the banners and the hero follow.
THEMES = {
    "dark":  dict(bg=NIGHT, name=LIGHT, sub=DIM,   kick=EMBER_TINT, letter=LIGHT),
    "light": dict(bg=PAPER, name=INK,   sub=MUTED, kick=EMBER_TEXT, letter=INK),
}

MOTTO = "Khudi: the discipline of not dissolving."
VISION = "Judgment that holds when the machine agrees with you."
DESCRIPTOR = "AUDIT · RISK · GOVERNANCE"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def cover(theme="dark"):
    t = THEMES[theme]
    nx, ny = M.pt(M.GAP_MID)

    # Content starts clear of BOTH the profile photo and the mobile crop.
    # Photo right edge is PHOTO_CX + PHOTO_R (296); mobile crop bites 15%
    # off the left (238). The later of the two, plus breathing room, wins.
    x = max(PHOTO_CX + PHOTO_R, int(W * 0.15)) + 44

    # Everything sits inside the safe band (y 88–308). Same stacking rhythm as
    # the hero: mark, then kicker fourteen px above the title's cap height,
    # then the sub. Baselines are placed so the lowest descender clears 308.
    mark_y = 96
    kick_y = 196
    title_y = 242
    sub_y = 288

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" fill="{t['bg']}"/>

  <g transform="translate({x} {mark_y}) scale(.9)">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <text x="{x}" y="{kick_y}" font-family="{M.MONO}" font-size="15" letter-spacing="5.5" fill="{t['kick']}">{esc(DESCRIPTOR)}</text>
  <text x="{x}" y="{title_y}" font-family="{M.SERIF}" font-size="44" letter-spacing="-0.97" fill="{t['name']}">{esc(MOTTO)}</text>
  <text x="{x}" y="{sub_y}" font-family="{M.SERIF}" font-size="27" fill="{t['sub']}">{esc(VISION)}</text>
</svg>
"""


def guides(svg):
    """Proof overlay: safe band, mobile crop, and the profile-photo circle."""
    mobile = int(W * 0.15)
    return svg.replace("</svg>", f"""
  <rect x="{SAFE_X}" y="{SAFE_Y}" width="{SAFE_W}" height="{SAFE_H}"
        fill="none" stroke="#2E7FD4" stroke-width="2" stroke-dasharray="12 8"/>
  <rect x="{mobile}" y="0" width="{W - 2 * mobile}" height="{H}"
        fill="none" stroke="#D03030" stroke-width="2" stroke-dasharray="12 8"/>
  <circle cx="{PHOTO_CX}" cy="{PHOTO_CY}" r="{PHOTO_R}"
          fill="rgba(208,48,48,.20)" stroke="#D03030" stroke-width="2"/>
</svg>""")


def render(svg, path):
    # 2x then averaged down: cairo antialiases glyphs with subpixel coverage,
    # and at 44px the serif picks up colour fringes along every stem.
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=W * 2)
    Image.open(io.BytesIO(png)).convert("RGB").resize((W, H), Image.LANCZOS).save(path, optimize=True)


if __name__ == "__main__":
    for theme in ("dark", "light"):
        svg = cover(theme)
        open(os.path.join(OUT, f"cover-{theme}.svg"), "w").write(svg)
        render(svg, os.path.join(OUT, f"cover-{theme}.png"))
        print(f"  cover-{theme}.png  {W}x{H}")

    render(guides(cover("dark")), os.path.join(OUT, "cover-guides.png"))
    print("  cover-guides.png (blue = desktop safe band, red = mobile crop + photo)")
