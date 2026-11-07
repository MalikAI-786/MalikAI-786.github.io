#!/usr/bin/env python3
"""Bazm-e-Iqbal card — same print geometry and mark as the personal card.
Front: name, the reading line, contacts. Back: QR to /iqbal/."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); BRAND = HERE
sys.path.insert(0, BRAND)
import make_marks as M
from make_card import DPI, BLEED_W, BLEED_H, TRIM, SAFE, guides, mark
from palette import EMBER, EMBER_TINT, INK, PAPER, NIGHT, MUTED, LIGHT, DIM, RULE_L
import cairosvg, qrcode, qrcode.image.svg

OUT = os.path.join(HERE, "business-cards", "bazm-e-iqbal"); os.makedirs(OUT, exist_ok=True)
URL = "https://malikai-786.github.io/iqbal/?s=card"

def qr_paths(size_px):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0, box_size=1)
    q.add_data(URL); q.make(fit=True)
    m = q.get_matrix(); n = len(m); cell = size_px / n
    rects = []
    for y, row in enumerate(m):
        for x, v in enumerate(row):
            if v: rects.append(f'<rect x="{x*cell:.2f}" y="{y*cell:.2f}" width="{cell+0.3:.2f}" height="{cell+0.3:.2f}"/>')
    return "\n".join(rects), n

def front():
    x = SAFE + 16
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BLEED_W} {BLEED_H}" fill="none">
  <rect width="{BLEED_W}" height="{BLEED_H}" fill="{PAPER}"/>
  <rect x="0" y="0" width="{BLEED_W}" height="14" fill="{EMBER}"/>
{mark(x, 118, 1.75)}
  <text x="{x+2}" y="330" font-family="{M.SERIF}" font-size="64" font-weight="600" letter-spacing="-1" fill="{INK}">Yasir A. Malik</text>
  <path d="M{x+3} 364 H{x+75}" stroke="{EMBER}" stroke-width="4"/>
  <text x="{x+2}" y="410" font-family="{M.MONO}" font-size="25" letter-spacing="6.5" fill="{MUTED}">IQBAL, READ — NOT QUOTED</text>
  <path d="M{x} 448 H{BLEED_W - SAFE - 16}" stroke="{RULE_L}" stroke-width="2"/>
  <text x="{x}" y="508" font-family="{M.MONO}" font-size="25" letter-spacing="1.2" fill="{MUTED}">+1 (786) 704-8536 · YasirAMalik@gmail.com</text>
  <text x="{x}" y="556" font-family="{M.MONO}" font-size="25" letter-spacing="1.2" fill="{MUTED}">malikai-786.github.io/iqbal</text>
</svg>
'''

def back():
    size = 330; rects, n = qr_paths(size)
    qx = BLEED_W - SAFE - 40 - size; qy = (BLEED_H - size) / 2
    cx_text = SAFE + 24
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BLEED_W} {BLEED_H}" fill="none">
  <rect width="{BLEED_W}" height="{BLEED_H}" fill="{NIGHT}"/>
{mark(-60, -90, 7.0, ring=EMBER, letter=LIGHT, opacity=".07")}
  <rect x="{qx-26}" y="{qy-26}" width="{size+52}" height="{size+52}" rx="18" fill="{PAPER}"/>
  <g transform="translate({qx} {qy})" fill="{NIGHT}">
{rects}
  </g>
  <text x="{cx_text}" y="{qy+58}" font-family="{M.SERIF}" font-size="50" font-weight="600" fill="{LIGHT}">Scan the card.</text>
  <text x="{cx_text}" y="{qy+128}" font-family="{M.SANS}" font-size="27" fill="{DIM}">The set from tonight, the source</text>
  <text x="{cx_text}" y="{qy+166}" font-family="{M.SANS}" font-size="27" fill="{DIM}">behind every line, and a direct</text>
  <text x="{cx_text}" y="{qy+204}" font-family="{M.SANS}" font-size="27" fill="{DIM}">line to me.</text>
  <path d="M{cx_text} {qy+244} H{cx_text+72}" stroke="{EMBER}" stroke-width="4"/>
  <text x="{cx_text}" y="{qy+300}" font-family="{M.MONO}" font-size="23" letter-spacing="4" fill="{EMBER_TINT}">MALIKAI-786.GITHUB.IO/IQBAL</text>
</svg>
'''

if __name__ == "__main__":
    for name, svg in {"iqbal-card-front": front(), "iqbal-card-back": back()}.items():
        open(os.path.join(OUT, name + ".svg"), "w").write(svg)
        cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(OUT, name + ".png"), output_width=BLEED_W)
        cairosvg.svg2pdf(bytestring=svg.encode(), write_to=os.path.join(OUT, name + ".pdf"))
        cairosvg.svg2png(bytestring=guides(svg).encode(), write_to=os.path.join(OUT, name + "-guides.png"), output_width=BLEED_W)
        print(name, "ok")
