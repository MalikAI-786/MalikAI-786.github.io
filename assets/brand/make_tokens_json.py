#!/usr/bin/env python3
"""
tokens.json — the portable export of palette.py.

CSS variables and Python constants both require reading this repository to
use. A W3C Design Tokens Community Group file does not: it is the format
Figma's Tokens Studio, Style Dictionary, and most brand-import tooling
already read, so anyone who wants this palette in their own project — human
or an agent working on their behalf — can point a tool at this one file
instead of scraping tokens.css by hand.

https://design-tokens.github.io/community-group/format/

Generated from palette.py, which is generated from nothing — it is hand-kept
in sync with tokens.css and checked against it by tools/audit/invariants.py.
This file is the third rung: tokens.css for the website, palette.py for the
generators, tokens.json for everyone else. All three name the same colours;
only the shape differs.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import palette as P

OUT = os.path.join(HERE, "tokens.json")

# $type: "color" is the DTCG token type. Each group becomes a nested object;
# each leaf a {"$value": ...} token, which is the part any DTCG-aware tool
# reads without needing to know anything about this project.
RAMP = {
    "ember": {
        "50": P.EMBER_50, "100": P.EMBER_100, "200": P.EMBER_200,
        "300": P.EMBER_300, "400": P.EMBER_400, "500": P.EMBER_500,
        "600": P.EMBER_600, "650": P.EMBER_650, "700": P.EMBER_700,
        "800": P.EMBER_800, "900": P.EMBER_900, "tint": P.EMBER_TINT,
    },
    "ink": {
        "50": P.INK_50, "100": P.INK_100, "200": P.INK_200, "300": P.INK_300,
        "500": P.INK_500, "600": P.INK_600, "700": P.INK_700,
        "800": P.INK_800, "900": P.INK_900, "950": P.INK_950,
        "text-light": P.INK_TEXT_LIGHT, "text-dark": P.INK_TEXT_DARK,
    },
    "verdigris": {"300": P.VERD_300, "500": P.VERD_500, "600": P.VERD_600},
    "neutral": {"paper": P.PAPER, "white": P.WHITE},
}

DESCRIPTIONS = {
    "ember.500": "THE BRAND. Sampled from a physical badge holder, "
                 "white-balanced. 3.11:1 on paper — marks, rules, fills and "
                 "large type only, never body text on a light ground.",
    "ember.650": "Text-safe ember on every light surface.",
    "ember.tint": "Text-safe ember on every dark surface.",
    "ink.100": "Warm hairline. Picks up the leather the ember was sampled "
               "from — never a cold grey.",
    "verdigris.600": "Evidence confirmed. Deliberately quiet — never "
                     "interchanged with ember, which means priority.",
}

SEMANTIC = {
    "accent":      {"light": "{ember.500}", "dark": "{ember.500}"},
    "accent-ink":  {"light": "{ember.650}", "dark": "{ember.tint}"},
    "ground":      {"light": "{neutral.paper}", "dark": "{ink.950}"},
    "surface":     {"light": "{neutral.white}", "dark": "{ink.900}"},
    "ink":         {"light": "{ink.text-light}", "dark": "{ink.text-dark}"},
    "muted":       {"light": "{ink.500}", "dark": "{ink.300}"},
    "line":        {"light": "{ink.100}", "dark": "{ink.700}"},
    "evidence":    {"light": "{verdigris.600}", "dark": "{verdigris.300}"},
}


def build():
    doc = {
        "$description": (
            "The Reference Mark — Yasir A. Malik, Audit / Risk / Governance. "
            "Generated from assets/brand/palette.py in "
            "github.com/MalikAI-786/MalikAI-786.github.io. Full system: "
            "https://malikai-786.github.io/brand.html"
        ),
    }

    for group, leaves in RAMP.items():
        doc[group] = {}
        for name, value in leaves.items():
            token = {"$type": "color", "$value": value}
            desc = DESCRIPTIONS.get(f"{group}.{name}")
            if desc:
                token["$description"] = desc
            doc[group][name] = token

    # Semantic roles are aliases (DTCG reference syntax) onto the ramp above,
    # split by theme rather than resolved to a literal — so a consumer keeps
    # the light/dark relationship instead of baking in one mode.
    doc["semantic"] = {}
    for role, modes in SEMANTIC.items():
        doc["semantic"][role] = {
            mode: {"$type": "color", "$value": ref}
            for mode, ref in modes.items()
        }

    doc["rule"] = {
        "$description": (
            "Ember 500 measures 3.11:1 on paper — WCAG AA requires 4.5:1 for "
            "body text. It carries marks, rules, fills and large display "
            "type, and can never carry body text on a light ground. Use "
            "semantic.accent-ink instead."
        )
    }
    return doc


if __name__ == "__main__":
    doc = build()
    text = json.dumps(doc, indent=2, ensure_ascii=False) + "\n"
    with open(OUT, "w") as fh:
        fh.write(text)

    leaves = sum(len(v) for k, v in doc.items()
                if isinstance(v, dict) and k not in ("rule",))
    print(f"  tokens.json   {leaves} tokens, {len(text)} bytes")
