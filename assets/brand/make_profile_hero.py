#!/usr/bin/env python3
"""
Profile hero for the master README.

The banner in make_banners.py is the repository furniture: it names a surface.
This is different. The profile README sits on top of the whole account, so it
gets the one image with a face in it.

The headshot arrives on a navy studio background, which fights warm graphite.
Rather than crop around the problem, the photograph is re-lit into the brand:
mapped to a duotone that runs from ink to warm paper, so it belongs to the same
palette as everything else rather than sitting on top of it. The left edge then
dissolves into the ground so there is no photographic rectangle, only a person
emerging from the same surface the type is set on.
"""
import os, sys, io

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import EMBER
import cairosvg
import numpy as np
from PIL import Image

OUT = os.path.join(HERE, "profile-readme")
os.makedirs(OUT, exist_ok=True)

SRC = os.path.join(os.path.dirname(os.path.dirname(HERE)),
                   "MalikAI-786.github.io", "assets", "img", "yasir-headshot.jpg")
if not os.path.exists(SRC):
    SRC = os.path.join(HERE, "..", "img", "yasir-headshot.jpg")

W, H = 1280, 440

# Photograph column. Sits hard against the right edge, bleeds top and bottom.
PHOTO_W = 470
PHOTO_X = W - PHOTO_W
FADE = 210          # px of left-edge dissolve into the ground

# Crop from the source frame (900x1349): head and shoulders. The aspect is
# matched to the panel deliberately, so the cover-fit below has nothing left to
# trim — an automatic centre-crop was taking the top of his head off.
CROP = (30, 60, 870, 847)

THEMES = {
    "dark": dict(bg="#0E1114", name="#EDEFF1", sub="#A6B0BA", rule="#263039",
                 meta="#5A646E", letter="#EDEFF1", body="#C4CCD3",
                 shadow=(9, 12, 16), highlight=(232, 221, 211)),
    # On paper the shadow point is lifted well off black. A dark suit mapped
    # to true black becomes a slab against a warm ground and the dissolve
    # shows its own edge; a warm mid-dark lets the whole panel sit down.
    "light": dict(bg="#F6F3F0", name="#171A1D", sub="#5A646E", rule="#E2DAD3",
                  meta="#8A929B", letter="#171A1D", body="#3C444B",
                  shadow=(92, 83, 76), highlight=(248, 245, 241)),
}

RECORD = [
    ("REGULATOR",  "Safety-and-soundness examination — Florida OFR"),
    ("OPERATOR",   "Fifteen years in audit and risk — Citigroup, JPMorgan Chase"),
    ("BUILDER",    "Production AI shipped into a live audit function"),
    ("RESEARCHER", "DBA candidate, Florida International University"),
]


def duotone(img, shadow, highlight, ember_mix=0.16):
    """Map a photograph onto the brand's two-point tonal range.

    Straight luminance-to-duotone flattens skin, so a fraction of ember is
    folded into the midtones — the range where a face carries its modelling —
    which keeps the portrait warm rather than tinted.
    """
    lum = np.asarray(img.convert("L"), dtype=np.float32) / 255.0
    # Mild S-curve: the studio original is low-contrast against its backdrop.
    lum = np.clip(lum * 1.06 - 0.03, 0.0, 1.0)
    lum = lum * lum * (3.0 - 2.0 * lum)

    lo = np.array(shadow, dtype=np.float32)
    hi = np.array(highlight, dtype=np.float32)
    out = lo + (hi - lo) * lum[..., None]

    # Ember peaks in the midtones and vanishes at both ends.
    e = np.array([224.0, 102.0, 46.0])
    weight = (4.0 * lum * (1.0 - lum))[..., None] * ember_mix
    out = out * (1.0 - weight) + e * weight
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")


def photo_panel(theme):
    t = THEMES[theme]
    im = Image.open(SRC).convert("RGB").crop(CROP)

    # Cover-fit the panel without distorting the face.
    scale = max(PHOTO_W / im.width, H / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)),
                   Image.LANCZOS)
    left = (im.width - PHOTO_W) // 2
    top = (im.height - H) // 2
    im = im.crop((left, top, left + PHOTO_W, top + H))

    im = duotone(im, t["shadow"], t["highlight"],
                 ember_mix=0.16 if theme == "dark" else 0.11)

    # Dissolve the left edge, and take the top and bottom down a little so the
    # panel reads as light falling off rather than a photograph pasted on.
    a = np.full((H, PHOTO_W), 255.0, dtype=np.float32)
    ramp = np.linspace(0.0, 1.0, FADE, dtype=np.float32) ** 1.7
    a[:, :FADE] *= ramp[None, :]
    edge = 46
    a[:edge, :] *= np.linspace(0.35, 1.0, edge, dtype=np.float32)[:, None]
    a[-edge:, :] *= np.linspace(1.0, 0.35, edge, dtype=np.float32)[:, None]

    im.putalpha(Image.fromarray(a.astype(np.uint8), "L"))
    return im


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def overlay(theme):
    """Mark, name and record, rendered as one transparent layer."""
    t = THEMES[theme]
    nx, ny = M.pt(M.GAP_MID)

    rows = []
    y = 268
    for label, text in RECORD:
        rows.append(
            f'<text x="72" y="{y}" font-family="{M.MONO}" font-size="12.5" '
            f'letter-spacing="2.4" fill="{EMBER}">{esc(label)}</text>'
            f'<text x="196" y="{y}" font-family="{M.SERIF}" font-size="16.5" '
            f'fill="{t["body"]}">{esc(text)}</text>')
        y += 30

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect x="0" y="0" width="{W}" height="5" fill="{EMBER}"/>

  <g transform="translate(72 52) scale(1.05)">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <text x="152" y="98" font-family="{M.SERIF}" font-size="52" fill="{t['name']}">Yasir A. Malik</text>
  <text x="154" y="128" font-family="{M.MONO}" font-size="13.5" letter-spacing="5.2" fill="{t['sub']}">AUDIT · RISK · GOVERNANCE</text>

  <path d="M72 176 H286" stroke="{EMBER}" stroke-width="2.5"/>
  <text x="72" y="216" font-family="{M.SERIF}" font-size="20.5" fill="{t['sub']}">Judgment that holds when the machine agrees with you.</text>

  {''.join(rows)}

  <text x="72" y="{H-30}" font-family="{M.MONO}" font-size="12" letter-spacing="3" fill="{t['meta']}">MALIKAI-786.GITHUB.IO</text>
</svg>
"""


def build(theme):
    t = THEMES[theme]
    base = Image.new("RGBA", (W, H), t["bg"])
    base.alpha_composite(photo_panel(theme), (PHOTO_X, 0))

    png = cairosvg.svg2png(bytestring=overlay(theme).encode(), output_width=W)
    base.alpha_composite(Image.open(io.BytesIO(png)).convert("RGBA"))

    path = os.path.join(OUT, f"profile-hero-{theme}.png")
    base.convert("RGB").save(path, optimize=True)
    return path


if __name__ == "__main__":
    for theme in ("dark", "light"):
        p = build(theme)
        print(f"  {os.path.relpath(p, HERE)}  {os.path.getsize(p)//1024} KB")
