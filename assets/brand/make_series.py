#!/usr/bin/env python3
"""
The Ones Who Stayed Back — series identity.

A planned interview series. The visual move is one deliberate variation on
the Reference Mark's grammar: the crossbar, which everywhere else overshoots
forward past the figure, here extends *back* — reaching left, toward where
the figure came from. Same geometry, same stroke, opposite direction. That
is the entire concept, and it is why this file exists instead of reusing
make_banners.py: the bar flip is the series.

Everything else — palette, serif, mono, tick — is the house system untouched.

No episode content is generated here. Guest names, titles and dates are
per-episode facts that get filled in when they are real; the card() function
takes them as arguments and the specimen uses an em-dash slot, never an
invented name.
"""
import math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import EMBER
import cairosvg

OUT = os.path.join(HERE, "series", "ones-who-stayed-back")
os.makedirs(OUT, exist_ok=True)

TITLE = "The Ones Who Stayed Back."
EYEBROW = "A SERIES BY YASIR A. MALIK"

THEMES = {
    "dark":  dict(bg="#0E1114", name="#EDEFF1", sub="#A6B0BA",
                  rule="#263039", meta="#7C8590", letter="#EDEFF1"),
    "light": dict(bg="#F6F3F0", name="#171A1D", sub="#5A646E",
                  rule="#E2DAD3", meta="#5A646E", letter="#171A1D"),
}


def back_bar_path():
    """The series bar: same overshoot as the house mark, mirrored.

    The house bar starts flush with the left leg's outer edge and overshoots
    right to BAR_END. Mirroring about the letter's axis (x = CX): it starts
    flush with the *right* leg's outer edge and reaches back left.
    """
    dx, dy = M.APEX[0] - M.FOOT_L, M.FOOT_Y - M.APEX[1]
    lean = math.atan2(dx, dy)
    t = (M.BAR_Y - M.APEX[1]) / dy
    x_centre_r = M.APEX[0] + dx * t
    x_outer_r = x_centre_r + (M.AW / 2) / math.cos(lean)
    back_end = 2 * M.CX - M.BAR_END          # BAR_END mirrored about centre
    return f"M{M.f(back_end)} {M.f(M.BAR_Y)} H{M.f(x_outer_r)}"


def mark_group(letter_col, scale=1.0, tx=0, ty=0):
    nx, ny = M.pt(M.GAP_MID)
    return f"""<g transform="translate({tx} {ty}) scale({scale})">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{letter_col}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{back_bar_path()}" stroke="{letter_col}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>"""


def mark_svg(theme):
    t = THEMES[theme]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" role="img" aria-label="The Ones Who Stayed Back — series mark">
  <title>The Ones Who Stayed Back — series mark</title>
  {mark_group(t['letter'])}
</svg>
"""


def banner(theme):
    """1280x300, same skeleton as the repo banners so it reads as family."""
    t = THEMES[theme]
    W, H = 1280, 300
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" fill="{t['bg']}"/>
  <rect x="0" y="0" width="{W}" height="5" fill="{EMBER}"/>

  <g opacity="{'.06' if theme == 'dark' else '.05'}">
    {mark_group(t['letter'], scale=7.2, tx=W - 300, ty=-80)}
  </g>

  {mark_group(t['letter'], scale=1.45, tx=72, ty=62)}

  <path d="M186 70 V162" stroke="{t['rule']}" stroke-width="1.5"/>

  <text x="222" y="110" font-family="{M.SERIF}" font-size="52" font-style="italic" fill="{t['name']}">{TITLE}</text>
  <path d="M224 138 H274" stroke="{EMBER}" stroke-width="2.5"/>
  <text x="226" y="170" font-family="{M.MONO}" font-size="17" letter-spacing="5" fill="{t['sub']}">{EYEBROW}</text>

  <path d="M72 224 H{W - 72}" stroke="{t['rule']}" stroke-width="1.5"/>

  <rect x="72" y="245" width="3.5" height="23" fill="{EMBER}"/>
  <text x="89" y="264" font-family="{M.SERIF}" font-size="27" fill="{t['name']}">Yasir A. Malik</text>
  <text x="{W - 72}" y="263" text-anchor="end" font-family="{M.MONO}" font-size="14" letter-spacing="3" fill="{t['meta']}">MALIKAI-786.GITHUB.IO</text>
</svg>
"""


def card(w, h, episode="EPISODE —", guest_line="", theme="dark"):
    """Episode card. Portrait 1080x1350 for feed, square 1080x1080.

    guest_line stays empty until a guest is real. The slot renders as a rule,
    not as a fake name.
    """
    t = THEMES[theme]
    pad = 96
    title_size = 88 if w >= h else 92
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="none">
  <rect width="{w}" height="{h}" fill="{t['bg']}"/>
  <rect x="0" y="0" width="{w}" height="8" fill="{EMBER}"/>

  <g opacity=".07">
    {mark_group(t['letter'], scale=13, tx=w - 560, ty=h - 620)}
  </g>

  {mark_group(t['letter'], scale=1.9, tx=pad, ty=pad)}

  <text x="{pad + 4}" y="{pad + 240}" font-family="{M.MONO}" font-size="26" letter-spacing="8" fill="{EMBER}">{episode}</text>

  <text x="{pad}" y="{pad + 360}" font-family="{M.SERIF}" font-size="{title_size}" font-style="italic" fill="{t['name']}">The Ones</text>
  <text x="{pad}" y="{pad + 360 + title_size + 18}" font-family="{M.SERIF}" font-size="{title_size}" font-style="italic" fill="{t['name']}">Who Stayed</text>
  <text x="{pad}" y="{pad + 360 + 2 * (title_size + 18)}" font-family="{M.SERIF}" font-size="{title_size}" font-style="italic" fill="{t['name']}">Back.</text>

  {'<text x="' + str(pad) + '" y="' + str(h - pad - 110) + '" font-family="' + M.SERIF + '" font-size="40" fill="' + t['sub'] + '">' + guest_line + '</text>' if guest_line else ''}

  <path d="M{pad} {h - pad - 64} H{w - pad}" stroke="{t['rule']}" stroke-width="1.5"/>
  <text x="{pad}" y="{h - pad - 18}" font-family="{M.MONO}" font-size="22" letter-spacing="6" fill="{t['meta']}">{EYEBROW}</text>
</svg>
"""


if __name__ == "__main__":
    jobs = []
    for theme in ("dark", "light"):
        svg = mark_svg(theme)
        p = os.path.join(OUT, f"mark-{theme}.svg")
        open(p, "w").write(svg)
        cairosvg.svg2png(bytestring=svg.encode(),
                         write_to=os.path.join(OUT, f"mark-{theme}.png"),
                         output_width=640, output_height=640)
        jobs.append(f"mark-{theme}")

        cairosvg.svg2png(bytestring=banner(theme).encode(),
                         write_to=os.path.join(OUT, f"banner-{theme}.png"),
                         output_width=1280)
        jobs.append(f"banner-{theme}")

    cairosvg.svg2png(bytestring=card(1080, 1350).encode(),
                     write_to=os.path.join(OUT, "card-portrait.png"),
                     output_width=1080)
    cairosvg.svg2png(bytestring=card(1080, 1080).encode(),
                     write_to=os.path.join(OUT, "card-square.png"),
                     output_width=1080)
    jobs += ["card-portrait", "card-square"]

    print("  " + "\n  ".join(jobs))
    print(f"\nWrote {len(jobs) + 2} files to {OUT}")
