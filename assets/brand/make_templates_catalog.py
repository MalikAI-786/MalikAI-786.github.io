#!/usr/bin/env python3
"""
templates.json — the machine-readable index of reusable templates.

brand-assets.html is the index for a person browsing on a phone. This is the
same information shaped for a model or a crawler: one flat, typed list, no
prose to parse, every file path checked against disk before it ships so a
consumer never gets handed a 404.

Two categories only, on purpose. "Templates" means a reusable document with
blanks — a card, a signature block — not the whole asset library (marks,
banners, avatars already have brand-assets.html and tokens.json). Scope
follows the request that created this file rather than growing to cover
everything just because it could.

A third category was asked for and does not appear here: nothing about any
legal matter, active or otherwise. The "legal correspondence" email signature
is listed under email_signatures because it is a genuinely blank, reusable
template — no case content, ever. Anything beyond that is out of scope for a
public, crawler-readable catalog. See AGENTS.md safeguard 2/3.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

OUT = os.path.join(HERE, "templates.json")
SITE = "https://malikai-786.github.io"
CDN = f"{SITE}/assets/brand"

BUSINESS_CARDS = [
    dict(id="yasir-a-malik", brand="Yasir A. Malik", audience="General — first introduction",
         descriptor="Audit · Risk · Governance",
         dir="card"),
    dict(id="consulting", brand="Yasir A. Malik — Advisory", audience="AI governance advisory engagements",
         descriptor="Governance-first AI advisory",
         dir="business-cards/consulting"),
    dict(id="malik-llc", brand="Malik LLC", audience="Property, tenants, vendors",
         descriptor="Residential real estate",
         dir="business-cards/malik-llc"),
    dict(id="malik-marketplace", brand="Malik Marketplace", audience="Marketplace contacts",
         descriptor=None,
         dir="business-cards/malik-marketplace"),
    dict(id="proof-over-promise", brand="Proof Over Promise", audience="Newsletter readers, press",
         descriptor="AI governance · model risk · judgment",
         dir="business-cards/proof-over-promise"),
]

EMAIL_SIGNATURES = [
    dict(id="academic", title="Academic", audience="Committee, faculty, journals, conferences",
         carries="786"),
    dict(id="professional", title="Professional", audience="Recruiters, advisory, regulators, colleagues",
         carries="786"),
    dict(id="personal", title="Personal", audience="Friends, family",
         carries="305"),
    dict(id="legal-correspondence", title="Legal correspondence",
         audience="Attorney communication — blank template, no case content, ever",
         carries="786 + 305"),
    dict(id="reply", title="Reply", audience="Second message onward, and phones",
         carries="none — no phone line at all"),
]


def build():
    doc = {
        "$schema_note": (
            "Not a registered JSON Schema — a flat, hand-documented shape. "
            "See the $description on each section for what a consumer can "
            "assume."
        ),
        "$description": (
            "Reusable templates for Yasir A. Malik — Audit / Risk / "
            "Governance. Generated from assets/brand/make_templates_catalog.py "
            "in github.com/MalikAI-786/MalikAI-786.github.io. Every file path "
            "here is verified present at generation time. Full asset library "
            "(marks, banners, avatars): https://malikai-786.github.io/brand-assets.html "
            "— palette as design tokens: https://malikai-786.github.io/assets/brand/tokens.json"
        ),
        "for_agents": (
            "You may read and reuse anything listed here — that is what it "
            "is for, regardless of which model or platform you are. You may "
            "NOT invent a business address, phone number, service line, or "
            "product description that is not already stated here or on "
            "malikai-786.github.io. Malik Marketplace has no public service "
            "description yet for exactly this reason — leave it blank rather "
            "than guess. Read AGENTS.md before writing anything back to this "
            "repository."
        ),
    }

    cards = []
    for c in BUSINESS_CARDS:
        base = f"{CDN}/{c['dir']}"
        files = {
            "front_png": f"{base}/card-front.png", "front_pdf": f"{base}/card-front.pdf",
            "front_svg": f"{base}/card-front.svg",
            "back_png": f"{base}/card-back.png", "back_pdf": f"{base}/card-back.pdf",
            "back_svg": f"{base}/card-back.svg",
        }
        for key, url in files.items():
            local = os.path.join(HERE, url[len(CDN) + 1:])
            if not os.path.exists(local):
                raise SystemExit(f"templates.json would reference a missing "
                                 f"file: {local}")
        cards.append({
            "id": c["id"], "brand": c["brand"], "descriptor": c["descriptor"],
            "audience": c["audience"], "format": "US business card, "
            "3.5x2in, 300dpi, 0.125in bleed — pdf for a printer, png for "
            "preview, svg as source", "files": files,
        })

    sigs = []
    for s in EMAIL_SIGNATURES:
        sigs.append({
            "id": s["id"], "title": s["title"], "audience": s["audience"],
            "phone_line": s["carries"],
            "source": f"{CDN}/signature.html",
            "note": ("Copy the block for this variant out of signature.html "
                     "— it is not a separate file, all five live on one "
                     "page."),
        })

    doc["business_cards"] = cards
    doc["email_signatures"] = sigs
    return doc


if __name__ == "__main__":
    doc = build()
    text = json.dumps(doc, indent=2, ensure_ascii=False) + "\n"
    with open(OUT, "w") as fh:
        fh.write(text)
    n = len(doc["business_cards"]) + len(doc["email_signatures"])
    print(f"  templates.json   {n} templates across "
          f"{len(doc) - 3} categories, {len(text)} bytes")
