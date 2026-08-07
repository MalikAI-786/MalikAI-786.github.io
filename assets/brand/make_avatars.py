#!/usr/bin/env python3
"""
Stream avatars, The Reference Mark.

One house, several streams. The DNA is constant: an open ring, an anchor
node floating in the break, and a geometric letterform inside it. What
changes per stream is the letter and the accent.

  Yasir A. Malik      A   ember       the person, the anchor
  Malik LLC           M   verdigris   property, the tangible and verified
  Malik Marketplace   M   ember       commerce, reversed out of a solid tile

Only the parent mark carries the overshooting crossbar. That detail belongs
to the research it came from, so the child marks are one idea simpler. A
family should not repeat the founder's signature on every member.

Avatars are square but every platform crops them to a circle, so nothing
sits outside the inscribed circle and the mark keeps a generous margin.
"""
import os, sys, math

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
import cairosvg

OUT = os.path.join(HERE, "avatars")
os.makedirs(OUT, exist_ok=True)

SIZE = 1000
EMBER = "#E0662E"
VERDIGRIS = "#0F5F5A"
INK = "#171A1D"
PAPER = "#F6F3F0"
NIGHT = "#0E1114"
LIGHT = "#EDEFF1"
ON_ACCENT = "#1A1109"

# ---------------------------------------------------------------- letters
# The A is the parent mark and keeps its overshooting crossbar.
# The M is cut to the same stroke weight and sits inside the same ring,
# with every corner checked against the ring's inner edge.
M_FOOT_L, M_FOOT_R = 21.5, 42.5
M_TOP, M_BOTTOM, M_VALLEY_Y = 20.5, 45.5, 37.0


def letter_paths(letter):
    """Return (stroke paths, stroke width) for a letter in mark geometry."""
    if letter == "A":
        return [M.letter_path(), M.bar_path()], M.AW
    if letter == "M":
        return ([f"M{M_FOOT_L} {M_BOTTOM} L{M_FOOT_L} {M_TOP} "
                 f"L32 {M_VALLEY_Y} L{M_FOOT_R} {M_TOP} L{M_FOOT_R} {M_BOTTOM}"], M.AW)
    raise ValueError(f"no cut defined for {letter!r}")


def _cap_corners(p_from, p_to, half):
    """
    Corners of a butt-capped stroke end.

    Butt caps stop exactly at the endpoint, so the corners sit at the
    endpoint plus and minus the half-width along the perpendicular. An
    earlier version of this check added the half-width along y instead,
    which reported a phantom collision on the A.
    """
    dx, dy = p_to[0] - p_from[0], p_to[1] - p_from[1]
    ln = math.hypot(dx, dy)
    px, py = -dy / ln * half, dx / ln * half
    return [(p_to[0] + px, p_to[1] + py), (p_to[0] - px, p_to[1] - py)]


def check_clearances(letter):
    """Worst-case gap between any letter corner and the ring's inner edge."""
    inner = M.R - M.SW / 2
    half = M.AW / 2
    if letter == "M":
        corners = (_cap_corners((M_FOOT_L, M_TOP), (M_FOOT_L, M_BOTTOM), half)
                   + _cap_corners((M_FOOT_R, M_TOP), (M_FOOT_R, M_BOTTOM), half)
                   + _cap_corners((M_FOOT_L, M_BOTTOM), (M_FOOT_L, M_TOP), half)
                   + _cap_corners((M_FOOT_R, M_BOTTOM), (M_FOOT_R, M_TOP), half))
    else:
        corners = (_cap_corners(M.APEX, (M.FOOT_L, M.FOOT_Y), half)
                   + _cap_corners(M.APEX, (M.FOOT_R, M.FOOT_Y), half))
        # crossbar overshoot terminus
        corners += _cap_corners((0, M.BAR_Y), (M.BAR_END, M.BAR_Y), half)
    return min(inner - math.dist((M.CX, M.CY), c) for c in corners)


def avatar(letter, accent, cut="light"):
    """cut: light (paper ground) | dark (night ground) | solid (accent tile)"""
    paths, aw = letter_paths(letter)
    nx, ny = M.pt(M.GAP_MID)

    if cut == "solid":
        bg, ring, ink = accent, ON_ACCENT, ON_ACCENT
    elif cut == "dark":
        bg, ring, ink = NIGHT, accent, LIGHT
    else:
        bg, ring, ink = PAPER, accent, INK

    # Ring outer diameter is 85% of the viewBox, so at this scale the mark
    # spans about 61% of the frame: comfortably inside the circular crop
    # every platform applies, and still legible at 32px in a comments list.
    scale = 0.72
    off = (1 - scale) * 32 / scale

    strokes = "\n".join(
        f'    <path d="{p}" stroke="{ink}" stroke-width="{M.f(aw)}" '
        f'stroke-linejoin="miter" stroke-linecap="butt"/>' for p in paths)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" fill="{bg}"/>
  <g transform="scale({scale}) translate({M.f(off)} {M.f(off)})">
    <path d="{M.ring_path()}" stroke="{ring}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{ring}"/>
{strokes}
  </g>
</svg>
"""


STREAMS = [
    ("yasir-a-malik",     "A", EMBER,     "Yasir A. Malik"),
    ("malik-llc",         "M", VERDIGRIS, "Malik LLC"),
    ("malik-marketplace", "M", EMBER,     "Malik Marketplace"),
]

if __name__ == "__main__":
    print("Letter clearances inside the ring (64px units):")
    for l in ("A", "M"):
        print(f"  {l}: worst corner clearance {check_clearances(l):.2f}px")
    print()

    for slug, letter, accent, label in STREAMS:
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        for cut in ("light", "dark", "solid"):
            svg = avatar(letter, accent, cut)
            open(os.path.join(d, f"avatar-{cut}.svg"), "w").write(svg)
            cairosvg.svg2png(bytestring=svg.encode(),
                             write_to=os.path.join(d, f"avatar-{cut}.png"),
                             output_width=SIZE)
        print(f"  {slug:20s} {letter}  {label}")

    print(f"\nWrote {len(STREAMS) * 3} avatars at {SIZE}x{SIZE} to {OUT}")
