#!/usr/bin/env python3
"""
Repository banners for The Reference Mark identity.

One banner per surface, cut from the same constants as the mark itself.
Light and dark variants so GitHub's <picture> element can switch with the
reader's theme. PNG rather than SVG on purpose: a banner's type must not
re-flow into whatever serif the viewer happens to have installed.
"""
import os, sys, io

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
from palette import EMBER, EMBER_TEXT, EMBER_TINT, NIGHT, LIGHT, PAPER, INK
import cairosvg
from PIL import Image

OUT = os.path.join(HERE, "banners")
os.makedirs(OUT, exist_ok=True)

W, H = 1280, 300

# The margin. It was 72px, which is what you use when there are six things in
# the frame and they have to fit. There are three now.
PAD = 120

# Three roles, because there are three elements: the mark, the kicker above
# the title, and the title. `sub`, `rule` and `meta` went with the byline
# strip, the divider and the repeated URL.
#
# `kick` is a role rather than a constant for the reason the whole system is
# built around: it is 12px, so on the light cut it cannot be ember-500
# (3.11:1 on paper). Ember-650 on light, ember-tint on dark.
THEMES = {
    "dark":  dict(bg=NIGHT, name=LIGHT, kick=EMBER_TINT, letter=LIGHT),
    "light": dict(bg=PAPER, name=INK,   kick=EMBER_TEXT, letter=INK),
}


def _lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _lum(h):
    h = h.lstrip("#")
    return sum(k * _lin(int(h[i:i + 2], 16))
               for k, i in ((0.2126, 0), (0.7152, 2), (0.0722, 4)))


def contrast(a, b):
    x, y = sorted((_lum(a), _lum(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


def assert_legible():
    """Every text role has to clear AA against its own ground.

    His name sits on these banners. It is not decoration, and a ratio nobody
    measured is how it ended up as the faintest thing in the frame.
    """
    # role -> minimum ratio. 3.0 is the large-text allowance; the title is 48px
    # or more, everything else is small text and gets the full 4.5.
    NEED = {"name": 3.0, "kick": 4.5, "letter": 3.0}
    bad = []
    for theme, t in THEMES.items():
        for role, need in NEED.items():
            r = contrast(t[role], t["bg"])
            if r < need:
                bad.append(f"{theme}.{role} {t[role]} on {t['bg']}: "
                           f"{r:.2f}:1, needs {need}:1")
        if contrast(EMBER, t["bg"]) < 3.0:
            bad.append(f"{theme}: ember rule on {t['bg']} below 3:1")
    if bad:
        raise SystemExit("Contrast failures:\n  " + "\n  ".join(bad))
    return min(contrast(t[r], t["bg"])
               for t in THEMES.values() for r in NEED)


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def banner(title, descriptor, theme="dark"):
    """Three elements: the mark, a kicker, a title. Nothing else gets in.

    What used to be here and is not any more: an ember stripe across the top,
    a ghost mark bleeding off the right edge, a vertical divider, a hairline
    above a byline strip, his name, and the site URL. Six pieces of furniture
    around one piece of information. The banner's job is to name the surface
    and tie it to the system; the name is in the account, and the URL is in
    the address bar.
    """
    t = THEMES[theme]
    nx, ny = M.pt(M.GAP_MID)

    # Only a genuinely long title steps down; at PAD=120 the measure is 1040px,
    # which 60px Charter fills at roughly thirty characters.
    size = 60 if len(title) <= 30 else 48

    # Set from the bottom up, the way the frame reads. Baselines are the line
    # box top plus half-leading plus the ascent (~0.75em for Charter).
    baseline = H - 48
    title_lh = round(size * 1.05)
    title_top = baseline - title_lh
    title_y = round(title_top + (title_lh - size) / 2 + size * 0.75)
    kick_top = title_top - 14 - 15
    kick_y = round(kick_top + 1.5 + 9)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" fill="{t['bg']}"/>

  <g transform="translate({PAD} 44) scale(.66)">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <text x="{PAD}" y="{kick_y}" font-family="{M.MONO}" font-size="12" letter-spacing="3.12" fill="{t['kick']}">{esc(descriptor)}</text>
  <text x="{PAD}" y="{title_y}" font-family="{M.SERIF}" font-size="{size}" letter-spacing="{-size * 0.022:.2f}" fill="{t['name']}">{esc(title)}</text>
</svg>
"""


# (directory slug, banner title, descriptor line)
#
# The profile entry used to carry a fourth field, "Regulator · Operator ·
# Researcher", which the byline strip printed. There is no byline strip now,
# so the field is gone rather than left here to be silently dropped. That
# line still appears, in the profile README, where it can be read.
SURFACES = [
    ("profile",             "Yasir A. Malik",       "AUDIT · RISK · GOVERNANCE"),
    ("site",                "The Site",             "PRACTICE · RESEARCH · IDENTITY"),
    ("portfolio-website",   "Portfolio",            "SELECTED WORK"),
    ("yasira-malik",        "Yasir A. Malik",       "PERSONAL SITE"),
    ("malikai-786-spx",     "Research Instrument",  "APPLIED AI · GOVERNANCE TESTBED"),
    ("interview-prep-jpm",  "Interview Preparation","FINANCIAL SERVICES"),
    ("claudebot-onboarding","ClaudeBot Onboarding", "PRACTICAL AI ADOPTION"),
    ("yasir-malik-biolink", "Links",                "DIRECTORY"),
    ("index007",            "SPX 0DTE Dashboard",   "RESEARCH INSTRUMENT · NOT ADVICE"),
    ("research",            "Research",             "AI & PROFESSIONAL JUDGMENT"),
    ("proof-over-promise",  "Proof Over Promise",   "EVIDENCE BEFORE CLAIMS"),
]

if __name__ == "__main__":
    worst = assert_legible()
    print(f"  contrast: every text role clears AA "
          f"(worst {worst:.2f}:1)\n")

    for slug, title, descriptor in SURFACES:
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        for theme in ("dark", "light"):
            svg = banner(title, descriptor, theme)
            # 2x then averaged down: cairo antialiases glyphs with subpixel
            # coverage, which is invisible on a 17px label and shows as green
            # and yellow fringes along the stems of a 60px title.
            png = cairosvg.svg2png(bytestring=svg.encode(), output_width=W * 2)
            (Image.open(io.BytesIO(png)).convert("RGB")
                  .resize((W, H), Image.LANCZOS)
                  .save(os.path.join(d, f"banner-{theme}.png"), optimize=True))
        print(f"  {slug:22s} {title}")
    print(f"\nWrote {len(SURFACES)*2} banners to {OUT}")
