#!/usr/bin/env python3
"""
Business card — The Reference Mark.

US standard 3.5 x 2in. Built at 300dpi with a 0.125in bleed on every edge
and a 0.125in safe margin inside the trim, which is what commercial
printers expect. Emits PNG for proofing and PDF for the printer — the PDF
stays vector, so the mark and type stay sharp at any output resolution.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
import cairosvg

OUT = os.path.join(HERE, "card")
os.makedirs(OUT, exist_ok=True)

DPI = 300
BLEED_W, BLEED_H = int(3.75 * DPI), int(2.25 * DPI)   # 1125 x 675
TRIM = int(0.125 * DPI)                                # 37.5 -> 37
SAFE = TRIM * 2                                        # content inset from bleed edge

EMBER = "#E0662E"
INK = "#171A1D"
PAPER = "#F6F3F0"
NIGHT = "#0E1114"
MUTED = "#5A646E"
LIGHT = "#EDEFF1"
DIM = "#A6B0BA"
RULE_L = "#E2DAD3"


def mark(x, y, scale, ring=EMBER, letter=INK, opacity=None):
    nx, ny = M.pt(M.GAP_MID)
    op = f' opacity="{opacity}"' if opacity else ""
    return f'''<g transform="translate({x} {y}) scale({scale})"{op}>
    <path d="{M.ring_path()}" stroke="{ring}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{ring}"/>
    <path d="{M.letter_path()}" stroke="{letter}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{letter}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>'''


def front(phone=True):
    x = SAFE + 16
    contacts = [
        ("YasirAMalik@gmail.com", 508),
        ("malikai-786.github.io", 556),
    ]
    if phone:
        contacts = [
            ("YasirAMalik@gmail.com", 496),
            ("+1 (786) 704-8536", 540),
            ("malikai-786.github.io", 584),
        ]
    lines = "\n".join(
        f'  <text x="{x}" y="{y}" font-family="{M.MONO}" font-size="25" '
        f'letter-spacing="1.2" fill="{MUTED}">{c}</text>'
        for c, y in contacts)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BLEED_W} {BLEED_H}" fill="none">
  <rect width="{BLEED_W}" height="{BLEED_H}" fill="{PAPER}"/>
  <rect x="0" y="0" width="{BLEED_W}" height="14" fill="{EMBER}"/>
{mark(x, 118, 1.75)}
  <text x="{x}" y="330" font-family="{M.SERIF}" font-size="74" fill="{INK}">Yasir A. Malik</text>
  <path d="M{x+3} 364 H{x+75}" stroke="{EMBER}" stroke-width="4"/>
  <text x="{x+2}" y="410" font-family="{M.MONO}" font-size="25" letter-spacing="6.5" fill="{MUTED}">AUDIT · RISK · GOVERNANCE</text>
  <path d="M{x} 448 H{BLEED_W - SAFE - 16}" stroke="{RULE_L}" stroke-width="2"/>
{lines}
</svg>
'''


def back():
    cx = BLEED_W / 2
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BLEED_W} {BLEED_H}" fill="none">
  <rect width="{BLEED_W}" height="{BLEED_H}" fill="{NIGHT}"/>
{mark(BLEED_W - 300, -70, 8.2, ring=EMBER, letter=LIGHT, opacity=".07")}
{mark(cx - 96, 150, 3.0, ring=EMBER, letter=LIGHT)}
  <path d="M{cx - 60} 430 H{cx + 60}" stroke="{EMBER}" stroke-width="4"/>
  <text x="{cx}" y="490" text-anchor="middle" font-family="{M.MONO}" font-size="24" letter-spacing="5" fill="{DIM}">MALIKAI-786.GITHUB.IO</text>
</svg>
'''


def guides(svg_body):
    """Proof overlay: trim line and safe area, for checking margins only."""
    return svg_body.replace("</svg>", f'''
  <rect x="{TRIM}" y="{TRIM}" width="{BLEED_W-2*TRIM}" height="{BLEED_H-2*TRIM}"
        fill="none" stroke="#D03030" stroke-width="2" stroke-dasharray="10 8"/>
  <rect x="{SAFE}" y="{SAFE}" width="{BLEED_W-2*SAFE}" height="{BLEED_H-2*SAFE}"
        fill="none" stroke="#2E7FD4" stroke-width="2" stroke-dasharray="10 8"/>
</svg>''')


if __name__ == "__main__":
    with_phone = "--no-phone" not in sys.argv
    faces = {"card-front": front(phone=with_phone), "card-back": back()}

    for name, svg in faces.items():
        open(os.path.join(OUT, name + ".svg"), "w").write(svg)
        cairosvg.svg2png(bytestring=svg.encode(),
                         write_to=os.path.join(OUT, name + ".png"),
                         output_width=BLEED_W)
        cairosvg.svg2pdf(bytestring=svg.encode(),
                         write_to=os.path.join(OUT, name + ".pdf"))
        cairosvg.svg2png(bytestring=guides(svg).encode(),
                         write_to=os.path.join(OUT, name + "-guides.png"),
                         output_width=BLEED_W)
        print(f"  {name}: png + pdf + guide proof")

    print(f"\n3.5x2in @ {DPI}dpi · bleed {BLEED_W}x{BLEED_H}px · "
          f"trim {BLEED_W-2*TRIM}x{BLEED_H-2*TRIM}px")
    print(f"Phone on card: {with_phone}")
