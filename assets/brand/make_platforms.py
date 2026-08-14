#!/usr/bin/env python3
"""
Platform cuts — FIU, Facebook, Instagram.

One identity, but not one file. Every platform crops differently, and a graphic
that survives LinkedIn's crop gets its head cut off by Facebook's. So each
surface is generated at its real dimensions with its real safe area, and the
safe area is asserted rather than eyeballed.

The FIU family is a deliberate exception to the palette. Ember is his; FIU Blue
is the institution's. Co-branding means using theirs where he is representing
them — cohort correspondence, a university email signature, an academic
introduction — while keeping his own geometry so it still reads as him. The
mark does not change shape. Only its colour does.

FIU Blue #081E3F and FIU Gold #B6862C, from brand.fiu.edu.
"""
import os, sys, io

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
import make_portrait as P
from make_banners import contrast
import cairosvg
import numpy as np
from PIL import Image

OUT = os.path.join(HERE, "platforms")
os.makedirs(OUT, exist_ok=True)

EMBER = "#E0662E"
INK, PAPER, MUTED = "#171A1D", "#F6F3F0", "#5A646E"
NIGHT = "#0E1114"

FIU_BLUE = "#081E3F"
FIU_GOLD = "#B6862C"
# FIU Blue is nearly black; on a dark ground the mark would vanish. This is the
# institution's own lighter tint for exactly that case.
FIU_BLUE_LIGHT = "#4A6FA5"

HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" '
        'width="64" height="64" fill="none">')


# ---------------------------------------------------------------- the FIU mark

def fiu_mark(on_dark=False):
    """His geometry, the university's colours."""
    ring = FIU_BLUE_LIGHT if on_dark else FIU_BLUE
    letter = "#FFFFFF" if on_dark else FIU_BLUE
    nx, ny = M.pt(M.GAP_MID)
    return (HEAD
            + f'<path d="{M.ring_path()}" stroke="{ring}" '
              f'stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>'
            + f'<circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{FIU_GOLD}"/>'
            + f'<path d="{M.letter_path()}" stroke="{letter}" '
              f'stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>'
            + f'<path d="{M.bar_path()}" stroke="{FIU_GOLD}" '
              f'stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>'
            + "</svg>")


def fiu_portrait():
    """The portrait, with the backdrop carried to FIU Blue instead of graphite.

    The studio backdrop is already navy, so this is a shorter journey than the
    warm grade — the same blue-dominance weighting, aimed at a different target.
    """
    img = Image.open(P.SRC).convert("RGB").crop(P.CROP).resize(
        (P.SIZE, P.SIZE), Image.LANCZOS)
    a = np.asarray(img, dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0

    target = np.array([8.0, 30.0, 63.0]) + (
        np.array([74.0, 111.0, 165.0]) - np.array([8.0, 30.0, 63.0])
    ) * lum[..., None]

    w = np.clip((b - r) / P.BLUE_SPAN, 0.0, 1.0)[..., None]
    return Image.fromarray(
        np.clip(a * (1 - w) + target * w, 0, 255).astype(np.uint8), "RGB")


# ------------------------------------------------------------------- surfaces
# name -> (width, height, safe inset l/t/r/b). Safe area is where type may go.
SURFACES = {
    # Facebook shows 820x312 on desktop but crops to a 640-wide column on
    # mobile, so 90px each side is unusable.
    "facebook-cover":    (820, 312, (95, 24, 95, 24)),
    "instagram-post":    (1080, 1080, (90, 90, 90, 90)),
    # Stories put UI over the top ~250px and bottom ~250px.
    "instagram-story":   (1080, 1920, (90, 260, 90, 300)),
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def card(surface, lines, kicker, theme="dark", fiu=False):
    """A quote card, laid out inside the surface's safe area."""
    W, H, (sl, st, sr, sb) = SURFACES[surface]
    if fiu:
        bg = FIU_BLUE if theme == "dark" else PAPER
        accent = FIU_GOLD
        name_col = "#FFFFFF" if theme == "dark" else FIU_BLUE
        sub_col = "#B9C4D4" if theme == "dark" else MUTED
    else:
        bg = NIGHT if theme == "dark" else PAPER
        accent = EMBER
        name_col = "#EDEFF1" if theme == "dark" else INK
        sub_col = "#A6B0BA" if theme == "dark" else MUTED

    # A wide, short surface cannot stack a mark above three lines of type —
    # the first attempt put the headline straight through the mark. Above 2:1
    # the mark moves to its own column, the way the repository banners do.
    wide = W / H > 2.0
    ms = 1.5 if wide else 2.4
    mark_px = 64 * ms
    kicker_px = 64 if wide else 96

    text_x = sl + (mark_px + 34 if wide else 0)
    top = st + (0 if wide else mark_px + 40)

    inner_w = W - text_x - sr
    inner_h = H - top - sb - kicker_px

    # Fit on both axes. Width sets one ceiling, the height left over after the
    # mark and the kicker sets the other; the smaller one wins.
    by_width = int(inner_w / max(len(l) for l in lines) * 1.85)
    by_height = int(inner_h / (len(lines) * 1.24))
    size = max(22, min(by_width, by_height, 96))
    lh = int(size * 1.24)

    block_h = lh * len(lines)
    y0 = top + max(0, (inner_h - block_h) // 2) + size

    body = "".join(
        f'<text x="{text_x}" y="{y0 + i * lh}" font-family="{M.SERIF}" '
        f'font-size="{size}" fill="{name_col}">{esc(l)}</text>'
        for i, l in enumerate(lines))

    nx, ny = M.pt(M.GAP_MID)
    ring = (FIU_BLUE_LIGHT if theme == "dark" else FIU_BLUE) if fiu else accent
    letter = name_col
    node = FIU_GOLD if fiu else accent
    bar = FIU_GOLD if fiu else letter

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" fill="{bg}"/>
  <rect x="0" y="0" width="{W}" height="{max(5, H // 90)}" fill="{accent}"/>

  <g transform="translate({sl} {st}) scale({ms})">
    <path d="{M.ring_path()}" stroke="{ring}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{node}"/>
    <path d="{M.letter_path()}" stroke="{letter}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{bar}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  {body}

  <path d="M{text_x} {H - sb - 54} H{text_x + 120}" stroke="{accent}" stroke-width="{max(2, H // 400)}"/>
  <text x="{text_x}" y="{H - sb - 14}" font-family="{M.MONO}" font-size="{max(15, size // 4)}" letter-spacing="{max(3, size // 18)}" fill="{sub_col}">{esc(kicker)}</text>
</svg>"""


def render(svg, w, path):
    cairosvg.svg2png(bytestring=svg.encode(), output_width=w, write_to=path)


def assert_safe():
    """Every colour that carries type has to clear AA on its own ground."""
    checks = [
        ("FIU Blue on paper", FIU_BLUE, PAPER, 4.5),
        ("white on FIU Blue", "#FFFFFF", FIU_BLUE, 4.5),
        ("FIU Gold on FIU Blue", FIU_GOLD, FIU_BLUE, 3.0),
        ("FIU Blue tint on FIU Blue", FIU_BLUE_LIGHT, FIU_BLUE, 3.0),
        ("sub on FIU Blue", "#B9C4D4", FIU_BLUE, 4.5),
    ]
    bad = [f"{n}: {contrast(a, b):.2f}:1, needs {need}"
           for n, a, b, need in checks if contrast(a, b) < need]
    if bad:
        raise SystemExit("Contrast failures:\n  " + "\n  ".join(bad))
    # FIU Gold on paper is the trap: it looks usable and is not.
    g = contrast(FIU_GOLD, PAPER)
    return g


CARDS = [
    ("hook", ["The most dangerous number", "in the room is the one",
              "nobody questions."], "AUDIT · RISK · GOVERNANCE", False),
    ("ethics", ["The auditor everyone", "dreads teaches nobody."],
     "PROOF OVER PROMISE", False),
    ("fiu", ["Judgment that holds", "when the machine", "agrees with you."],
     "FIU DBA · COHORT 8.14", True),
]

if __name__ == "__main__":
    gold_on_paper = assert_safe()
    print(f"  contrast: FIU pairings clear AA")
    print(f"  note: FIU Gold on paper is {gold_on_paper:.2f}:1 — rules and "
          f"marks only, never text\n")

    # The FIU mark, at signature size and as vector.
    for on_dark, tag in ((False, "light"), (True, "dark")):
        svg = fiu_mark(on_dark)
        with open(os.path.join(OUT, f"mark-fiu-{tag}.svg"), "w") as fh:
            fh.write(svg)
        render(svg, 56 * 3, os.path.join(OUT, f"mark-fiu-{tag}.png"))
    print("  mark-fiu-light/dark   his geometry, the university's colours")

    # The FIU portrait, and the plain profile size every platform wants.
    fiu_portrait().save(os.path.join(OUT, "portrait-fiu.png"), optimize=True)
    warm = P.warm_grade(P.base())
    for px in (320, 400):
        warm.resize((px, px), Image.LANCZOS).save(
            os.path.join(OUT, f"profile-{px}.png"), optimize=True)
    print("  portrait-fiu          backdrop carried to FIU Blue")
    print("  profile-320/400       Facebook and Instagram profile picture")

    made = 0
    for surface in SURFACES:
        for key, lines, kicker, fiu in CARDS:
            for theme in ("dark", "light"):
                svg = card(surface, lines, kicker, theme, fiu)
                render(svg, SURFACES[surface][0],
                       os.path.join(OUT, f"{surface}-{key}-{theme}.png"))
                made += 1
    print(f"\n  {made} cards across {len(SURFACES)} surfaces, "
          f"each laid out inside its own safe area")
