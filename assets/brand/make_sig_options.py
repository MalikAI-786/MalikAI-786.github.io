#!/usr/bin/env python3
"""
Signature-mark options, rendered at the size they will actually be used.

A mark chosen at 400px is not the mark you end up with. In a signature it is
56px next to 19px type, so the decision has to be made at 56px — everything
here is shown at true size first, with a 4x enlargement beside it only to
explain *why* the small version reads the way it does.

Five candidates, all cut from the same constants in make_marks.py. They differ
in how much detail survives the reduction, which is the only question that
matters at this size.
"""
import os, sys, io

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import EMBER, INK, PAPER
import cairosvg
from PIL import Image

OUT = os.path.join(HERE, "signature-options")
os.makedirs(OUT, exist_ok=True)

TRUE = 56          # the size in a signature
ZOOM = 4

HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" '
        'width="64" height="64" fill="none">')


def _ring(col=EMBER, w=None):
    return (f'<path d="{M.ring_path()}" stroke="{col}" '
            f'stroke-width="{M.f(w or M.SW)}" stroke-linecap="round"/>')


def _node(col=EMBER, r=3.9):
    nx, ny = M.pt(M.GAP_MID)
    return f'<circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="{r}" fill="{col}"/>'


def _letter(col=INK, w=None, bar_end=None):
    w = M.f(w or M.AW)
    bar = M.bar_path(bar_end) if bar_end else M.bar_path()
    return (f'<path d="{M.letter_path()}" stroke="{col}" stroke-width="{w}" '
            f'stroke-linejoin="miter" stroke-linecap="butt"/>'
            f'<path d="{bar}" stroke="{col}" stroke-width="{w}" '
            f'stroke-linecap="butt"/>')


# (key, label, what it trades, svg builder taking the ink colour)
OPTIONS = [
    ("a-full", "The Reference Mark",
     "Everything: ring, gap, node, overshooting crossbar. The most information "
     "and the most to lose at 56px.",
     lambda ink: HEAD + _ring() + _node() + _letter(ink) + "</svg>"),

    ("b-micro", "Micro cut",
     "Same geometry, thicker strokes and a wider gap. Built specifically so the "
     "counters do not fill in when reduced.",
     lambda ink: HEAD + _ring(w=M.SW * 1.55) + _node(r=4.9)
                 + _letter(ink, w=M.AW * 1.4) + "</svg>"),

    ("c-no-node", "Ring and letter, no node",
     "Drops the node dot. One less element competing for the same few pixels; "
     "loses the detail that makes the mark distinctive up close.",
     lambda ink: HEAD + _ring() + _letter(ink) + "</svg>"),

    ("d-letter", "Letter alone",
     "No ring at all. The calmest option next to type, and the crossbar "
     "overshoot still carries the signature. Least like a logo.",
     lambda ink: HEAD + _letter(ink, w=M.AW * 1.15) + "</svg>"),

    ("e-badge", "Solid badge",
     "Filled ember disc, letter reversed out. Highest contrast and the most "
     "visible at a glance; also the loudest thing in the signature.",
     lambda ink: HEAD + f'<circle cx="32" cy="32" r="30" fill="{EMBER}"/>'
                 + _letter("#FFFFFF", w=M.AW * 1.25) + "</svg>"),
]


def render(svg, px):
    """Rasterise at 3x the target and downsample, so the true-size cut is a
    fair test of the drawing rather than a test of the rasteriser."""
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=px * 3)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    return im.resize((px, px), Image.LANCZOS)


def sheet(theme):
    """One comparison sheet: true size and 4x, on the real ground."""
    on_dark = theme == "dark"
    bg = "#0E1114" if on_dark else PAPER
    ink = "#EDEFF1" if on_dark else INK

    pad, gap, row_h = 40, 34, TRUE * ZOOM + 34
    W = pad * 2 + TRUE * ZOOM + gap + TRUE + 60
    H = pad * 2 + row_h * len(OPTIONS)

    canvas = Image.new("RGBA", (W, H), bg)
    for i, (key, label, _note, build) in enumerate(OPTIONS):
        svg = build(ink)
        y = pad + i * row_h

        canvas.alpha_composite(render(svg, TRUE * ZOOM), (pad, y))

        # True size, vertically centred against the enlargement.
        x = pad + TRUE * ZOOM + gap
        canvas.alpha_composite(
            render(svg, TRUE), (x, y + (TRUE * ZOOM - TRUE) // 2))

        # And the individual file, which is what he would actually install.
        for th, col in (("light", INK), ("dark", "#EDEFF1")):
            one = build(col)
            cairosvg.svg2png(
                bytestring=one.encode(), output_width=TRUE * 3,
                write_to=os.path.join(OUT, f"{key}-{th}.png"))
            with open(os.path.join(OUT, f"{key}-{th}.svg"), "w") as fh:
                fh.write(one)

    return canvas.convert("RGB")


if __name__ == "__main__":
    for theme in ("light", "dark"):
        p = os.path.join(OUT, f"compare-{theme}.png")
        sheet(theme).save(p, optimize=True)
        print(f"  signature-options/compare-{theme}.png")

    n = len([f for f in os.listdir(OUT) if not f.startswith("compare")])
    print(f"\n  {len(OPTIONS)} options, {n} files")
    print("  Each shown at 4x and at true 56px. Judge it at 56.")
