#!/usr/bin/env python3
"""
Repository banners for The Reference Mark identity.

One banner per surface, cut from the same constants as the mark itself.
Light and dark variants so GitHub's <picture> element can switch with the
reader's theme. PNG rather than SVG on purpose: a banner's type must not
re-flow into whatever serif the viewer happens to have installed.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_marks as M
import cairosvg

OUT = os.path.join(HERE, "banners")
os.makedirs(OUT, exist_ok=True)

W, H = 1280, 300
EMBER = "#E0662E"

THEMES = {
    "dark":  dict(bg="#0E1114", name="#EDEFF1", sub="#A6B0BA",
                  rule="#263039", meta="#5A646E", letter="#EDEFF1"),
    "light": dict(bg="#F6F3F0", name="#171A1D", sub="#5A646E",
                  rule="#E2DAD3", meta="#8A929B", letter="#171A1D"),
}


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def banner(title, descriptor, theme="dark", byline="Yasir A. Malik",
           meta="MALIKAI-786.GITHUB.IO"):
    t = THEMES[theme]
    nx, ny = M.pt(M.GAP_MID)

    # Long titles step down a size rather than overrun the mark's clear space.
    size = 72 if len(title) <= 22 else (58 if len(title) <= 32 else 46)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <rect width="{W}" height="{H}" fill="{t['bg']}"/>
  <rect x="0" y="0" width="{W}" height="5" fill="{EMBER}"/>

  <g transform="translate({W-300} -80) scale(7.2)" opacity="{'.06' if theme=='dark' else '.05'}">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <g transform="translate(72 62) scale(1.45)">
    <path d="{M.ring_path()}" stroke="{EMBER}" stroke-width="{M.f(M.SW)}" stroke-linecap="round"/>
    <circle cx="{M.f(nx)}" cy="{M.f(ny)}" r="3.9" fill="{EMBER}"/>
    <path d="{M.letter_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linejoin="miter" stroke-linecap="butt"/>
    <path d="{M.bar_path()}" stroke="{t['letter']}" stroke-width="{M.f(M.AW)}" stroke-linecap="butt"/>
  </g>

  <path d="M186 70 V162" stroke="{t['rule']}" stroke-width="1.5"/>

  <text x="222" y="{110 if size >= 58 else 104}" font-family="{M.SERIF}" font-size="{size}" fill="{t['name']}">{esc(title)}</text>
  <path d="M224 {138 if size >= 58 else 130} H274" stroke="{EMBER}" stroke-width="2.5"/>
  <text x="226" y="{170 if size >= 58 else 162}" font-family="{M.MONO}" font-size="17" letter-spacing="5" fill="{t['sub']}">{esc(descriptor)}</text>

  <path d="M72 224 H{W-72}" stroke="{t['rule']}" stroke-width="1.5"/>
  <text x="72" y="262" font-family="{M.SERIF}" font-size="22" fill="{t['sub']}">{esc(byline)}</text>
  <text x="{W-72}" y="262" text-anchor="end" font-family="{M.MONO}" font-size="14" letter-spacing="3" fill="{t['meta']}">{esc(meta)}</text>
</svg>
"""


# (directory slug, banner title, descriptor line)
SURFACES = [
    ("profile",             "Yasir A. Malik",       "AUDIT · RISK · GOVERNANCE",
     "Regulator · Operator · Researcher"),
    ("site",                "The Site",             "PRACTICE · RESEARCH · IDENTITY"),
    ("portfolio-website",   "Portfolio",            "SELECTED WORK"),
    ("yasira-malik",        "Yasir A. Malik",       "PERSONAL SITE"),
    ("malikai-786-spx",     "Research Instrument",  "APPLIED AI · GOVERNANCE TESTBED"),
    ("interview-prep-jpm",  "Interview Preparation","FINANCIAL SERVICES"),
    ("claudebot-onboarding","ClaudeBot Onboarding", "PRACTICAL AI ADOPTION"),
    ("yasir-malik-biolink", "Links",                "DIRECTORY"),
    ("index007",            "SPX 0DTE Dashboard",   "RESEARCH INSTRUMENT · NOT ADVICE"),
    ("research",            "Research",             "AI &amp; PROFESSIONAL JUDGMENT"),
    ("proof-over-promise",  "Proof Over Promise",   "EVIDENCE BEFORE CLAIMS"),
]

if __name__ == "__main__":
    for slug, title, descriptor, *rest in SURFACES:
        byline = rest[0] if rest else "Yasir A. Malik"
        d = os.path.join(OUT, slug)
        os.makedirs(d, exist_ok=True)
        for theme in ("dark", "light"):
            svg = banner(title, descriptor, theme, byline)
            cairosvg.svg2png(bytestring=svg.encode(),
                             write_to=os.path.join(d, f"banner-{theme}.png"),
                             output_width=W)
        print(f"  {slug:22s} {title}")
    print(f"\nWrote {len(SURFACES)*2} banners to {OUT}")
