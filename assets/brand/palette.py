#!/usr/bin/env python3
"""
The palette — one canonical source, in Python.

Before this file existed, `#E0662E` was typed by hand into thirteen separate
generators. That is how `make_marks.py` ended up shipping a dead constant,
`EMBER_TEXT = "#C4511F"` — ember-600, not the ember-650 that `tokens.css`
documents as the shade actually safe for text. Nothing rendered with it, so
nothing caught it. A second, live instance of the same failure mode was
`make_signatures.py`'s `FAINT = "#8A929B"`: the same grey that failed WCAG on
the repository banners before that was fixed, reused here without anyone
re-checking it landed on a different (also failing) background. See
`FAINT_ON_LIGHT` below for the correction.

Two sections:

  MIRRORS TOKENS.CSS   Every value here is copied verbatim from the `:root`
  block in tokens.css. `tools/audit/invariants.py` parses both files and
  fails the build if they disagree — so this module cannot drift from the
  CSS the way the old per-file literals did from each other.

  DERIVED               Values generators need that tokens.css has no reason
  to carry (nothing on the live site currently uses them). Each is documented
  with why it exists and, where relevant, its measured contrast.

Every generator in this directory should import its colours from here. If a
generator still defines `EMBER = "#E0662E"` locally, that is the bug this
file exists to close — replace it with `from palette import EMBER`.
"""

# ============================================================ mirrors tokens.css

EMBER_50   = "#FDF4EF"
EMBER_100  = "#FAE3D6"
EMBER_200  = "#F4C5AC"
EMBER_300  = "#EDA37D"   # fills and tints only — never text on light
EMBER_400  = "#E8834F"
EMBER_500  = "#E0662E"   # THE BRAND. The badge orange.
EMBER_600  = "#C4511F"
EMBER_650  = "#AD4317"   # text-safe on every light surface
EMBER_700  = "#A63E14"
EMBER_800  = "#7C2E10"
EMBER_900  = "#47190A"
EMBER_TINT = "#F58E5C"   # text-safe on every dark surface

INK_950 = "#0E1114"
INK_900 = "#14181C"
INK_800 = "#1A2027"
INK_700 = "#263039"
INK_600 = "#3E464E"
INK_500 = "#5A646E"
INK_300 = "#A6B0BA"
INK_200 = "#CBD3DA"
INK_100 = "#E2DAD3"      # warm hairline
INK_50  = "#EFE9E3"
PAPER   = "#F6F3F0"
WHITE   = "#FFFFFF"

# Literal --ink values inside tokens.css's light/dark role blocks — not part
# of the numbered ramp, but used directly and just as canonical.
INK_TEXT_LIGHT = "#171A1D"   # --ink in :root (light)
INK_TEXT_DARK  = "#EDEFF1"   # --ink under prefers-color-scheme: dark

VERD_600 = "#0F5F5A"   # text-safe on light
VERD_500 = "#127A70"
VERD_300 = "#4FC0B2"   # text-safe on dark

ON_ACCENT      = "#1A1109"   # label on an ember-500 fill, light mode
ON_ACCENT_DARK = INK_950     # label on an ember-500 fill, dark mode

# ------------------------------------------------------- short names in use
# The names most generators already call these by. Kept so a generator can
# switch to `from palette import *` (or the specific names below) without
# renaming every reference in its own body.
EMBER      = EMBER_500
EMBER_TEXT = EMBER_650        # the correct one — see the module docstring
NIGHT      = INK_950
INK        = INK_TEXT_LIGHT
LIGHT      = INK_TEXT_DARK
MUTED      = INK_500
DIM        = INK_300
LINE       = INK_100
RULE_L     = INK_100
VERDIGRIS  = VERD_600

# ================================================================== derived

# make_signatures.py's tertiary "de-emphasised" tone, one step lighter than
# MUTED. The original value, #8A929B, measured 3.15:1 on the signature's
# white background — failing AA (needs 4.5:1 at 11-13px) exactly the way the
# banner `meta` role failed before that was fixed. This is the first step up
# the same neutral ramp that clears it: 5.06:1 on #FFFFFF.
FAINT_ON_LIGHT = "#657079"

# The FIU family (FIU Blue #081E3F, FIU Gold #B6862C) is deliberately NOT
# here. It is the university's palette, not this identity's, used only where
# he represents the program — see the exception documented at the top of
# make_platforms.py. Mirroring it here would blur exactly the line that
# co-branding is supposed to keep sharp.


def _all_hex():
    """name -> value, for every ALL_CAPS hex constant in this module."""
    return {k: v for k, v in globals().items()
            if k.isupper() and isinstance(v, str) and v.startswith("#")}


if __name__ == "__main__":
    swatches = _all_hex()
    print(f"  {len(swatches)} named colours\n")
    for name, value in sorted(swatches.items()):
        print(f"  {name:16s} {value}")
