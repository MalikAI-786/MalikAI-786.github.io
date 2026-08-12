#!/usr/bin/env python3
"""
The Reference Mark — generator for the Yasir A. Malik identity.

Geometry is computed, not eyeballed, so every clearance in the mark is
exact and the whole family can be re-cut from one set of constants.

Construction
------------
  ring      an open circle: the recurring engagement, deliberately not closed
  node      a dot floating IN the break: the anchor, not part of the loop
  A         a geometric letterform whose crossbar overshoots the right leg —
            a reference line extended past the figure, reaching for the ring
            without closing on it
"""
import math, os

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- constants
CX = CY = 32.0
R = 25.0            # ring radius (centreline)
SW = 4.4            # ring stroke
AW = 5.2            # letter stroke

GAP_MID, GAP_W = 140.0, 42.0          # break centred upper-left, 42 degrees
ARC_A = GAP_MID - GAP_W / 2           # 119 deg
ARC_B = GAP_MID + GAP_W / 2           # 161 deg

APEX = (32.0, 19.5)
FOOT_L, FOOT_R = 20.0, 44.0
FOOT_Y = 47.0
BAR_Y = 38.0
BAR_END = 51.5                        # crossbar overshoot terminus


def pt(theta, r=R):
    """Polar to SVG coords (y grows downward, so sin is negated)."""
    a = math.radians(theta)
    return (CX + r * math.cos(a), CY - r * math.sin(a))


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def ring_path():
    """Open arc: starts at ARC_A, sweeps clockwise the long way round to ARC_B."""
    x1, y1 = pt(ARC_A)
    x2, y2 = pt(ARC_B)
    return f"M{f(x1)} {f(y1)} A{f(R)} {f(R)} 0 1 1 {f(x2)} {f(y2)}"


def letter_path():
    ax, ay = APEX
    return f"M{f(FOOT_L)} {f(FOOT_Y)} L{f(ax)} {f(ay)} L{f(FOOT_R)} {f(FOOT_Y)}"


def bar_path(end=BAR_END):
    """Crossbar starts flush with the left leg's outer edge."""
    dx, dy = APEX[0] - FOOT_L, FOOT_Y - APEX[1]
    lean = math.atan2(dx, dy)                       # leg angle off vertical
    t = (BAR_Y - APEX[1]) / dy
    x_centre = APEX[0] - dx * t
    x_outer = x_centre - (AW / 2) / math.cos(lean)
    return f"M{f(x_outer)} {f(BAR_Y)} H{f(end)}"


# ------------------------------------------------------------- verification
def report():
    dx, dy = APEX[0] - FOOT_L, FOOT_Y - APEX[1]
    lean = math.atan2(dx, dy)
    inner = R - SW / 2

    apex_tip = APEX[1] - (AW / 2) / math.sin(lean)
    print(f"  apex tip y={apex_tip:.2f}  ring inner top y={CY - inner:.2f}"
          f"  -> clearance {apex_tip - (CY - inner):.2f}px")

    foot_outer = FOOT_R + (AW / 2) / math.cos(lean)
    ring_at_foot = CX + math.sqrt(inner**2 - (FOOT_Y - CY) ** 2)
    print(f"  foot outer x={foot_outer:.2f}  ring inner x={ring_at_foot:.2f}"
          f"  -> clearance {ring_at_foot - foot_outer:.2f}px")

    ring_at_bar = CX + math.sqrt(inner**2 - (BAR_Y - CY) ** 2)
    print(f"  bar end x={BAR_END:.2f}   ring inner x={ring_at_bar:.2f}"
          f"  -> clearance {ring_at_bar - BAR_END:.2f}px")

    node_r = 3.9
    sep = math.radians(GAP_W / 2) * R
    print(f"  node-to-arc gap {sep - node_r - SW / 2:.2f}px "
          f"(node r={node_r}, arc half-stroke {SW/2})")


# ------------------------------------------------------------------ writers
HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" '
        'fill="none" role="img" aria-label="{label}">')


def mark(ring_col="currentColor", letter_col="currentColor",
         node_col=None, label="The Reference Mark"):
    node_col = node_col or ring_col
    nx, ny = pt(GAP_MID)
    return f"""{HEAD.format(label=label)}
  <title>{label}</title>
  <path d="{ring_path()}" stroke="{ring_col}" stroke-width="{f(SW)}" stroke-linecap="round"/>
  <circle cx="{f(nx)}" cy="{f(ny)}" r="3.9" fill="{node_col}"/>
  <path d="{letter_path()}" stroke="{letter_col}" stroke-width="{f(AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
  <path d="{bar_path()}" stroke="{letter_col}" stroke-width="{f(AW)}" stroke-linecap="butt"/>
</svg>
"""


def mark_on_disc(disc, ink, label="The Reference Mark on ember"):
    """Badge cut — the mark reversed out of a filled disc, as on the leather."""
    nx, ny = pt(GAP_MID)
    return f"""{HEAD.format(label=label)}
  <title>{label}</title>
  <rect width="64" height="64" rx="14" fill="{disc}"/>
  <g transform="translate(32 32) scale(.8) translate(-32 -32)">
    <path d="{ring_path()}" stroke="{ink}" stroke-width="{f(SW)}" stroke-linecap="round"/>
    <circle cx="{f(nx)}" cy="{f(ny)}" r="3.9" fill="{ink}"/>
    <path d="{letter_path()}" stroke="{ink}" stroke-width="{f(AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{bar_path()}" stroke="{ink}" stroke-width="{f(AW)}" stroke-linecap="butt"/>
  </g>
</svg>
"""


def micro(ring_col="currentColor", letter_col="currentColor"):
    """
    Micro cut, for 16-24px. The overshoot and the tight interior clearances
    collapse below ~28px, so this cut drops the overshoot, fattens both
    strokes and opens the break. Same mark, different lens.
    """
    return f"""{HEAD.format(label="The Reference Mark, micro cut")}
  <title>The Reference Mark, micro cut</title>
{micro_body(ring_col, letter_col)}
</svg>
"""


# Micro-cut constants, chosen by rendering candidates down to 16px and
# picking the last one where ring, node and counter all still survive.
M_SW, M_AW, M_GAP, M_R = 7.0, 8.0, 50.0, 23.0


def micro_body(ring_col, letter_col, indent="  "):
    a, b = GAP_MID - M_GAP / 2, GAP_MID + M_GAP / 2
    x1, y1 = pt(a, M_R); x2, y2 = pt(b, M_R); nx, ny = pt(GAP_MID, M_R)
    i = indent
    return (
        f'{i}<path d="M{f(x1)} {f(y1)} A{f(M_R)} {f(M_R)} 0 1 1 {f(x2)} {f(y2)}" '
        f'stroke="{ring_col}" stroke-width="{f(M_SW)}" stroke-linecap="round"/>\n'
        f'{i}<circle cx="{f(nx)}" cy="{f(ny)}" r="{f(M_SW * 0.78)}" fill="{ring_col}"/>\n'
        f'{i}<path d="M19.5 46.5 L32 19 L44.5 46.5" stroke="{letter_col}" '
        f'stroke-width="{f(M_AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>\n'
        f'{i}<path d="M21.6 38.4 H42.4" stroke="{letter_col}" '
        f'stroke-width="{f(M_AW)}" stroke-linecap="butt"/>'
    )


def favicon(disc, ink):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="13" fill="{disc}"/>
  <g transform="translate(32 32) scale(.86) translate(-32 -32)">
{micro_body(ink, ink, indent="    ")}
  </g>
</svg>
"""


SANS = ("-apple-system,BlinkMacSystemFont,&#39;Segoe UI&#39;,Roboto,"
        "&#39;Helvetica Neue&#39;,Arial,sans-serif")
MONO = ("ui-monospace,&#39;SF Mono&#39;,Menlo,&#39;Cascadia Mono&#39;,"
        "&#39;Roboto Mono&#39;,monospace")
# The name is set in the Record voice, not the Statement voice. A serif
# wordmark against a geometric mark is the whole tonal argument: the mark
# is the instrument, the name is the person signing the work.
# Charter leads the stack deliberately: it is the face this identity is
# drawn for, it ships on macOS/iOS, and naming the exact fontconfig family
# first is also what lets the build rasterise these files correctly.
SERIF = ("&#39;Bitstream Charter&#39;,Charter,&#39;Iowan Old Style&#39;,"
         "&#39;Palatino Linotype&#39;,Palatino,&#39;Book Antiqua&#39;,Georgia,serif")

DESCRIPTOR = "AUDIT · RISK · GOVERNANCE"


def glyph(ring_col, letter_col, tx, ty, scale):
    nx, ny = pt(GAP_MID)
    return f"""  <g transform="translate({tx} {ty}) scale({scale})">
    <path d="{ring_path()}" stroke="{ring_col}" stroke-width="{f(SW)}" stroke-linecap="round"/>
    <circle cx="{f(nx)}" cy="{f(ny)}" r="3.9" fill="{ring_col}"/>
    <path d="{letter_path()}" stroke="{letter_col}" stroke-width="{f(AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{bar_path()}" stroke="{letter_col}" stroke-width="{f(AW)}" stroke-linecap="butt"/>
  </g>"""


def lockup_h(ring_col, letter_col, name_col, sub_col):
    """Horizontal lockup. Clear space = one ring radius on every side."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372 72" fill="none" role="img" aria-label="Yasir A. Malik — Audit, Risk, Governance">
  <title>Yasir A. Malik — Audit, Risk, Governance</title>
{glyph(ring_col, letter_col, 4, 4, 1.0)}
  <path d="M84 18 V54" stroke="{sub_col}" stroke-width="1" opacity=".34"/>
  <text x="104" y="35" font-family="{SERIF}" font-size="24" letter-spacing=".2" fill="{name_col}">Yasir A. Malik</text>
  <text x="105" y="53" font-family="{MONO}" font-size="9.5" letter-spacing="2.9" fill="{sub_col}">{DESCRIPTOR}</text>
</svg>
"""


def lockup_v(ring_col, letter_col, name_col, sub_col):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 152" fill="none" role="img" aria-label="Yasir A. Malik — Audit, Risk, Governance">
  <title>Yasir A. Malik — Audit, Risk, Governance</title>
{glyph(ring_col, letter_col, 98, 4, 1.0)}
  <text x="130" y="108" text-anchor="middle" font-family="{SERIF}" font-size="25" letter-spacing=".2" fill="{name_col}">Yasir A. Malik</text>
  <path d="M100 122 H160" stroke="{sub_col}" stroke-width="1" opacity=".34"/>
  <text x="130" y="142" text-anchor="middle" font-family="{MONO}" font-size="9.5" letter-spacing="2.9" fill="{sub_col}">{DESCRIPTOR}</text>
</svg>
"""


def wordmark(name_col, sub_col, accent):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 52" fill="none" role="img" aria-label="Yasir A. Malik">
  <title>Yasir A. Malik</title>
  <text x="0" y="28" font-family="{SERIF}" font-size="31" letter-spacing=".2" fill="{name_col}">Yasir A. Malik</text>
  <path d="M1 40 H26" stroke="{accent}" stroke-width="1.6"/>
  <text x="1" y="50" font-family="{MONO}" font-size="9.5" letter-spacing="2.9" fill="{sub_col}">{DESCRIPTOR}</text>
</svg>
"""


EMBER = "#E0662E"
INK = "#171A1D"
PAPER = "#F6F3F0"
MUTED = "#5A646E"
EMBER_TEXT = "#C4511F"

FILES = {
    "mark.svg":            mark(),
    "mark-ember.svg":      mark(ring_col=EMBER, letter_col=INK, node_col=EMBER,
                                label="The Reference Mark, two-tone"),
    "mark-ember-dark.svg": mark(ring_col=EMBER, letter_col="#EDEFF1", node_col=EMBER,
                                label="The Reference Mark, two-tone on dark"),
    "mark-badge.svg":      mark_on_disc(EMBER, "#1A1109"),
    "mark-micro.svg":      micro(),
    "favicon.svg":         favicon(EMBER, "#1A1109"),
    "lockup-horizontal.svg": lockup_h(EMBER, INK, INK, MUTED),
    "lockup-horizontal-dark.svg": lockup_h(EMBER, "#EDEFF1", "#EDEFF1", "#A6B0BA"),
    "lockup-stacked.svg":  lockup_v(EMBER, INK, INK, MUTED),
    "wordmark.svg":        wordmark(INK, MUTED, EMBER),
    "wordmark-dark.svg":   wordmark("#EDEFF1", "#A6B0BA", EMBER),
}

def social_card():
    """1200x630 Open Graph card, dark cut."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#0E1114"/>
  <rect x="0" y="0" width="1200" height="6" fill="{EMBER}"/>
  <g transform="translate(830 -60) scale(11)" opacity=".07">
    <path d="{ring_path()}" stroke="{EMBER}" stroke-width="{f(SW)}" stroke-linecap="round"/>
    <circle cx="{f(pt(GAP_MID)[0])}" cy="{f(pt(GAP_MID)[1])}" r="3.9" fill="{EMBER}"/>
    <path d="{letter_path()}" stroke="#EDEFF1" stroke-width="{f(AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{bar_path()}" stroke="#EDEFF1" stroke-width="{f(AW)}" stroke-linecap="butt"/>
  </g>
  <g transform="translate(88 96) scale(2.05)">
    <path d="{ring_path()}" stroke="{EMBER}" stroke-width="{f(SW)}" stroke-linecap="round"/>
    <circle cx="{f(pt(GAP_MID)[0])}" cy="{f(pt(GAP_MID)[1])}" r="3.9" fill="{EMBER}"/>
    <path d="{letter_path()}" stroke="#EDEFF1" stroke-width="{f(AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{bar_path()}" stroke="#EDEFF1" stroke-width="{f(AW)}" stroke-linecap="butt"/>
  </g>
  <text x="88" y="336" font-family="{SERIF}" font-size="76" letter-spacing="0" fill="#EDEFF1">Yasir A. Malik</text>
  <path d="M90 372 H150" stroke="{EMBER}" stroke-width="2.5"/>
  <text x="92" y="404" font-family="{MONO}" font-size="19" letter-spacing="6.5" fill="#A6B0BA">{DESCRIPTOR}</text>
  <text x="88" y="486" font-family="{SERIF}" font-size="28" fill="#A6B0BA">Regulator, operator, and researcher — on how</text>
  <text x="88" y="524" font-family="{SERIF}" font-size="28" fill="#A6B0BA">professional judgment holds under scrutiny.</text>
  <text x="88" y="580" font-family="{MONO}" font-size="16" letter-spacing="3" fill="#5A646E">MALIKAI-786.GITHUB.IO</text>
</svg>
"""


RASTERS = [
    ("favicon.svg", "icon-32.png", 32),
    ("favicon.svg", "icon-192.png", 192),
    ("favicon.svg", "icon-512.png", 512),
    ("favicon.svg", "apple-touch-icon.png", 180),
    ("og-card.svg", "og-card.png", 1200),
]

if __name__ == "__main__":
    print("Geometry verification (64px viewBox units):")
    report()

    FILES["og-card.svg"] = social_card()
    for name, body in FILES.items():
        with open(os.path.join(OUT, name), "w") as fh:
            fh.write(body)
    print(f"\nWrote {len(FILES)} SVGs to {OUT}")

    import cairosvg
    for src, dst, w in RASTERS:
        cairosvg.svg2png(url=os.path.join(OUT, src),
                         write_to=os.path.join(OUT, dst), output_width=w)
        print(f"  rasterised {dst} @ {w}px")
