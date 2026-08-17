#!/usr/bin/env python3
"""
Portrait cuts, for every surface that wants a face rather than a mark.

The source frame is a studio headshot on a navy backdrop. Navy is the one
colour this identity does not contain — set beside warm graphite it reads as a
different brand entirely, and a profile photo sits next to the banner
everywhere it appears.

Rather than matte the background out, which leaves halos in hair, the fix is a
colour-selective grade: pixels where blue dominates red get rotated toward a
warm neutral of the same luminance, weighted by how blue they are. The backdrop
converts fully, the suit mostly, and skin and shirt are untouched because
neither is blue-dominant. Edges blend because nothing is cut.

Four cuts:

  square    the profile photo. LinkedIn, GitHub, Substack, Gmail.
  circle    same crop, circular, with the ember hairline. For surfaces that
            crop to a circle anyway and clip anything near the edge.
  duotone   mapped fully into the palette. Editorial use beside the mark.
  speaker   photo, mark and name in one frame. Conference bios, talk slides,
            press.
"""
import os, sys, io

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import EMBER
import cairosvg
import numpy as np
from PIL import Image, ImageDraw

SRC = os.path.join(HERE, "..", "img", "yasir-headshot.jpg")
OUT = os.path.join(HERE, "portrait")
os.makedirs(OUT, exist_ok=True)

SIZE = 1000

# Head-and-shoulders crop from the 900x1349 source. Sized so the head fills
# about 62% of the frame and the eyeline lands on the upper third — the
# proportions a portrait is read at, rather than whatever the camera framed.
CROP = (81, 52, 839, 810)
SPEAKER_CROP = (0, 30, 900, 900)

# Blue-dominance below this many levels counts as fully backdrop.
BLUE_SPAN = 20.0
WARM = np.array([1.06, 1.00, 0.94])     # a warm neutral, R > G > B


def base():
    return Image.open(SRC).convert("RGB").crop(CROP).resize(
        (SIZE, SIZE), Image.LANCZOS)


def warm_grade(img, strength=1.0):
    """Rotate blue-dominant pixels to a warm neutral of the same luminance."""
    a = np.asarray(img, dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]

    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    target = np.clip(lum[..., None] * WARM, 0, 255)

    # Weight by blueness. Skin sits far negative here and is never touched.
    w = np.clip((b - r) / BLUE_SPAN, 0.0, 1.0)[..., None] * strength
    return Image.fromarray(
        np.clip(a * (1 - w) + target * w, 0, 255).astype(np.uint8), "RGB")


def duotone(img, shadow=(14, 16, 19), highlight=(238, 228, 218)):
    lum = np.asarray(img.convert("L"), dtype=np.float32) / 255.0
    lum = np.clip(lum * 1.06 - 0.03, 0, 1)
    lum = lum * lum * (3.0 - 2.0 * lum)
    lo, hi = np.array(shadow, np.float32), np.array(highlight, np.float32)
    out = lo + (hi - lo) * lum[..., None]
    e = np.array([224.0, 102.0, 46.0])
    w = (4.0 * lum * (1.0 - lum))[..., None] * 0.15
    return Image.fromarray(
        np.clip(out * (1 - w) + e * w, 0, 255).astype(np.uint8), "RGB")


def circle(img, ring=14):
    """Circular cut with the ember hairline, on transparency."""
    out = img.convert("RGBA")
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, SIZE - 1, SIZE - 1), fill=255)
    out.putalpha(mask)

    d = ImageDraw.Draw(out)
    inset = ring / 2
    d.ellipse((inset, inset, SIZE - 1 - inset, SIZE - 1 - inset),
              outline=EMBER, width=ring)
    return out


def speaker(theme="dark"):
    """Photo, mark and name in one frame. 1600x900."""
    W, H = 1600, 900
    t = dict(
        dark=dict(bg="#0E1114", name="#EDEFF1", sub="#A6B0BA", letter="#EDEFF1"),
        light=dict(bg="#F6F3F0", name="#171A1D", sub="#5A646E", letter="#171A1D"),
    )[theme]

    panel_w = 620

    # A wider crop than the square cut. The portrait crop is framed for a
    # square; poured into a 620x900 panel it fills the height with head and
    # loses the shoulders, so the card gets its own framing.
    src = warm_grade(Image.open(SRC).convert("RGB").crop(SPEAKER_CROP))
    scale = max(panel_w / src.width, H / src.height)
    src = src.resize((round(src.width * scale), round(src.height * scale)),
                     Image.LANCZOS)
    left = (src.width - panel_w) // 2
    src = src.crop((left, 0, left + panel_w, H))

    a = np.full((H, panel_w), 255.0, np.float32)
    fade = 240
    a[:, :fade] *= np.linspace(0, 1, fade, dtype=np.float32)[None, :] ** 1.6
    src = src.convert("RGBA")
    src.putalpha(Image.fromarray(a.astype(np.uint8), "L"))

    canvas = Image.new("RGBA", (W, H), t["bg"])
    canvas.alpha_composite(src, (W - panel_w, 0))

    nx, ny = M.pt(M.GAP_MID)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect x="0" y="0" width="{W}" height="7" fill="{EMBER}"/>
  <g transform="translate(96 300) scale(1.6)">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>
  <text x="96" y="500" font-family="{M.SERIF}" font-size="76" fill="{t['name']}">Yasir A. Malik</text>
  <path d="M98 540 H330" stroke="{EMBER}" stroke-width="3"/>
  <text x="96" y="584" font-family="{M.MONO}" font-size="19" letter-spacing="7" fill="{t['sub']}">AUDIT · RISK · GOVERNANCE</text>
  <text x="96" y="646" font-family="{M.SERIF}" font-size="27" fill="{t['sub']}">Judgment that holds when the machine agrees with you.</text>
</svg>"""
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=W)
    canvas.alpha_composite(Image.open(io.BytesIO(png)).convert("RGBA"))
    return canvas.convert("RGB")


if __name__ == "__main__":
    made = []

    def save(img, name):
        p = os.path.join(OUT, name)
        img.save(p, optimize=True)
        made.append((name, os.path.getsize(p)))

    graded = warm_grade(base())
    save(graded, "portrait-square.png")
    save(circle(graded), "portrait-circle.png")
    save(duotone(base()), "portrait-duotone.png")
    for theme in ("dark", "light"):
        save(speaker(theme), f"speaker-{theme}.png")

    for name, size in made:
        print(f"  portrait/{name:26s} {size // 1024:>4} KB")
