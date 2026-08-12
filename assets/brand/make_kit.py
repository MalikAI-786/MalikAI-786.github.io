#!/usr/bin/env python3
"""
The brand kit — one zip, so a whole identity travels as a single link.

Written because the alternative failed. Attaching these files to an email
means transcoding megabytes of binary into base64 by hand, and a base64 string
that is truncated anywhere produces a file that looks attached and will not
open. A link to a zip cannot be silently corrupted: it either downloads or it
does not.

The zip is laid out by destination, matching brand-assets.html, so the folder
names answer "what do I put here" rather than "what type of file is this".

Every entry is verified present before the archive is written and the manifest
is generated from what actually went in, never from this list — a README that
promises a file the zip does not contain is worse than no README.
"""
import os, zipfile, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "brand-kit.zip")

# (source relative to assets/brand, destination inside the zip)
CONTENTS = [
    ("portrait/portrait-square.png",        "01 Profile photo/profile-photo-square.png"),
    ("portrait/portrait-circle.png",        "01 Profile photo/profile-photo-circle.png"),
    ("portrait/portrait-duotone.png",       "01 Profile photo/portrait-duotone.png"),

    ("linkedin/cover-dark.png",             "02 Covers/linkedin-cover-dark.png"),
    ("linkedin/cover-light.png",            "02 Covers/linkedin-cover-light.png"),
    ("profile-readme/profile-hero-dark.png","02 Covers/github-hero-dark.png"),
    ("profile-readme/profile-hero-light.png","02 Covers/github-hero-light.png"),

    ("portrait/speaker-dark.png",           "03 Speaker and press/speaker-card-dark.png"),
    ("portrait/speaker-light.png",          "03 Speaker and press/speaker-card-light.png"),

    ("mark.svg",                            "04 Logo/mark.svg"),
    ("mark-ember.svg",                      "04 Logo/mark-ember-on-light.svg"),
    ("mark-ember-dark.svg",                 "04 Logo/mark-reversed-on-dark.svg"),
    ("mark-micro.svg",                      "04 Logo/mark-micro-under-32px.svg"),
    ("mark-badge.svg",                      "04 Logo/mark-badge.svg"),
    ("lockup-horizontal.svg",               "04 Logo/lockup-horizontal.svg"),
    ("lockup-horizontal-dark.svg",          "04 Logo/lockup-horizontal-reversed.svg"),
    ("lockup-stacked.svg",                  "04 Logo/lockup-stacked.svg"),
    ("wordmark.svg",                        "04 Logo/wordmark.svg"),
    ("wordmark-dark.svg",                   "04 Logo/wordmark-reversed.svg"),

    ("signature.html",                      "05 Email signature/signature.html"),
    ("signature-mark.png",                  "05 Email signature/signature-mark.png"),

    ("avatars/yasir-a-malik/avatar-dark.png",     "06 Account avatars/A-yasir-a-malik.png"),
    ("avatars/malik-llc/avatar-dark.png",         "06 Account avatars/M-malik-llc.png"),
    ("avatars/malik-marketplace/avatar-dark.png", "06 Account avatars/M-malik-marketplace.png"),
    ("avatars/proof-over-promise/avatar-dark.png","06 Account avatars/P-proof-over-promise.png"),

    ("card/card-front.pdf",                 "07 Business card/card-front-print.pdf"),
    ("card/card-back.pdf",                  "07 Business card/card-back-print.pdf"),
    ("card/card-front.png",                 "07 Business card/card-front-preview.png"),
    ("card/card-back.png",                  "07 Business card/card-back-preview.png"),

    ("og-card.png",                         "08 Social and icons/open-graph-card.png"),
    ("icon-512.png",                        "08 Social and icons/icon-512.png"),
    ("icon-192.png",                        "08 Social and icons/icon-192.png"),
    ("icon-32.png",                         "08 Social and icons/icon-32.png"),
    ("apple-touch-icon.png",                "08 Social and icons/apple-touch-icon.png"),
    ("favicon.svg",                         "08 Social and icons/favicon.svg"),

    ("tokens.css",                          "09 For a designer/tokens.css"),
]

README = """\
BRAND KIT — YASIR A. MALIK
Audit · Risk · Governance

Folders are named for where the file goes, not for what type it is.

01  PROFILE PHOTO
    Use profile-photo-square.png on every profile: LinkedIn, GitHub,
    Substack, Gmail, Notion, Zoom. The same face in every place is most of
    what people mean by a consistent brand, and it costs one upload.
    The circular cut is transparent outside the circle, for slides.

02  COVERS
    LinkedIn cover is 1584x396, laid out clear of the mobile crop and the
    profile-photo circle. Pick dark or light and keep it — switching between
    them is the only wrong answer.

03  SPEAKER AND PRESS
    1600x900. Send this when a conference asks for a bio slide.

04  LOGO
    SVG, so it scales to a billboard or a favicon without redrawing.
    Use the micro cut below 32px: the full mark fills in at small sizes.
    Clear space is one ring radius on every side, minimum.

05  EMAIL SIGNATURE
    Open signature.html in a browser, select the whole block, copy, and
    paste into Gmail Settings > Signature. Table layout with inline styles,
    so it survives Outlook.

06  ACCOUNT AVATARS
    One letter per stream. Ember is the personal and marketplace accounts,
    verdigris is Malik LLC and the newsletter.

07  BUSINESS CARD
    Send the PDFs to a printer. The PNGs are for looking at.

08  SOCIAL AND ICONS

09  FOR A DESIGNER
    tokens.css is the palette, in full, with the usage rules as comments.

THE ONE COLOUR RULE
    Ember #E0662E is the brand, and it measures 3.11:1 on paper. It carries
    marks, rules and large display type. It can never carry body text on a
    light ground — use #AD4317 on light and #F58E5C on dark.

These files are outputs. Do not retouch a PNG or hand-edit an SVG; the change
will be lost the next time a generator runs. Everything here is produced from
one set of constants at:
    github.com/MalikAI-786/MalikAI-786.github.io  ->  assets/brand/

Full index with previews:  https://malikai-786.github.io/brand-assets.html
The system, documented:    https://malikai-786.github.io/brand.html
"""


def build():
    missing = [s for s, _ in CONTENTS if not os.path.exists(os.path.join(HERE, s))]
    if missing:
        raise SystemExit("Refusing to build a kit that promises files it does "
                         "not have:\n  " + "\n  ".join(missing))

    written = []
    # Deterministic timestamps so an unchanged kit produces an unchanged zip
    # rather than a fresh binary in every commit.
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for src, dest in CONTENTS:
            full = os.path.join(HERE, src)
            info = zipfile.ZipInfo(f"Brand Kit/{dest}", date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            with open(full, "rb") as fh:
                data = fh.read()
            z.writestr(info, data)
            written.append((dest, len(data)))

        # The manifest is generated from what actually went in.
        lines = [README, "", "CONTENTS", ""]
        for dest, size in written:
            lines.append(f"  {dest:<52} {size // 1024:>5} KB")
        lines.append(f"\n  {len(written)} files")
        info = zipfile.ZipInfo("Brand Kit/README.txt", date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, "\n".join(lines))

    return written


def verify():
    """Open the archive back up and confirm every byte survived."""
    with zipfile.ZipFile(OUT) as z:
        bad = z.testzip()
        if bad is not None:
            raise SystemExit(f"Archive is corrupt at {bad}")
        names = set(z.namelist())
        for _, dest in CONTENTS:
            if f"Brand Kit/{dest}" not in names:
                raise SystemExit(f"Missing from archive: {dest}")
        for src, dest in CONTENTS:
            on_disk = open(os.path.join(HERE, src), "rb").read()
            in_zip = z.read(f"Brand Kit/{dest}")
            if hashlib.sha256(on_disk).digest() != hashlib.sha256(in_zip).digest():
                raise SystemExit(f"Content differs: {dest}")
        return len(names)


if __name__ == "__main__":
    written = build()
    n = verify()
    size = os.path.getsize(OUT)
    print(f"  brand-kit.zip   {len(written)} files + README, {size // 1024} KB")
    print(f"  verified: {n} entries, every byte matches the source on disk")
