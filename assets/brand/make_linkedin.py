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
it directly underneath. It carries the motto and the vision instead.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import EMBER
import cairosvg

OUT = os.path.join(HERE, "linkedin")
os.makedirs(OUT, exist_ok=True)

W, H = 1584, 396
SAFE_W, SAFE_H = 1350, 220           # centred band that survives desktop crop
SAFE_X, SAFE_Y = (W - SAFE_W) // 2, (H - SAFE_H) // 2
PHOTO_CX, PHOTO_CY, PHOTO_R = 200, H - 150, 96   # profile photo footprint

THEMES = {
    "dark":  dict(bg="#0E1114", ink="#EDEFF1", sub="#A6B0BA",
                  rule="#263039", meta="#5A646E"),
    "light": dict(bg="#F6F3F0", ink="#171A1D", sub="#5A646E",
                  rule="#E2DAD3", meta="#8A929B"),
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

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" fill="{t['bg']}"/>
  <rect x="0" y="0" width="{W}" height="6" fill="{EMBER}"/>

  <g transform="translate({W - 250} -110) scale(8.6)" opacity="{'.06' if theme == 'dark' else '.05'}">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['ink']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['ink']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <g transform="translate({x} 96) scale(1.15)">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['ink']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['ink']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <path d="M{x + 100} 100 V174" stroke="{t['rule']}" stroke-width="1.5"/>

  <text x="{x + 128}" y="140" font-family="{M.SERIF}" font-size="40" fill="{t['ink']}">{esc(MOTTO)}</text>
  <text x="{x + 130}" y="176" font-family="{M.MONO}" font-size="15" letter-spacing="5.5" fill="{EMBER}">{esc(DESCRIPTOR)}</text>

  <path d="M{x} 232 H{x + 90}" stroke="{EMBER}" stroke-width="3"/>
  <text x="{x}" y="284" font-family="{M.SERIF}" font-size="29" fill="{t['sub']}">{esc(VISION)}</text>
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


if __name__ == "__main__":
    for theme in ("dark", "light"):
        svg = cover(theme)
        open(os.path.join(OUT, f"cover-{theme}.svg"), "w").write(svg)
        cairosvg.svg2png(bytestring=svg.encode(),
                         write_to=os.path.join(OUT, f"cover-{theme}.png"),
                         output_width=W)
        print(f"  cover-{theme}.png  {W}x{H}")

    cairosvg.svg2png(bytestring=guides(cover("dark")).encode(),
                     write_to=os.path.join(OUT, "cover-guides.png"),
                     output_width=W)
    print("  cover-guides.png (blue = desktop safe band, red = mobile crop + photo)")
