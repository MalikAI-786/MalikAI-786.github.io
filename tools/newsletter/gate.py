#!/usr/bin/env python3
"""
The deterministic half of the gate — the checks a model must not be trusted
to run on its own draft. review.md is the editorial gate; this is the part of
it that can be executed.

    python3 tools/newsletter/gate.py insights/some-note.html [...]

Exit 0 if every file passes. Each failure names the check, the way review.md
asks a verdict to.
"""
import html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MIN_WORDS, MAX_WORDS = 1100, 1900
DISCLOSURE = "Drafting assistance was used and is disclosed; the judgment is mine."

# Strings that must not appear in a published note. Each is a known failure.
FORBIDDEN = [
    ("proofoverpromise", "the retired Substack domain belongs to another author"),
    ("Proof Over Promise", "retired name — it is another author's publication"),
    ("Comptroller of the Currency", "he never worked for the OCC; the site corrected this"),
    (" OCC ", "he never worked for the OCC; the site corrected this"),
    ("peer-reviewed", "nothing of his is peer-reviewed; A3"),
    ("replicated", "A3"),
    ("IRB-25-0462 participant", "no participant data; A6"),
    ("embarrassing", "the Hassabis quote could not be verified"),
    ("studies show", "B2 — cite the thing or cut the sentence"),
    ("experts agree", "B2"),
    ("game-changing", "voice.md"),
    ("leverage ", "voice.md — not as a verb"),
    ("— ", "voice.md — no em-dash as a connector; use a full stop"),
]
REQUIRED_META = ("thread", "heuristic")
THREADS = {"Governance", "Judgment", "Evidence", "Ethics", "Practice"}


def body_text(s):
    art = s.split("<article>", 1)[1].split("</article>", 1)[0] if "<article>" in s else s
    return html.unescape(re.sub(r"<[^>]+>", " ", art))


def check(path):
    s = open(path, encoding="utf-8").read()
    fails = []
    text = body_text(s)
    n = len(text.split())
    if not (MIN_WORDS <= n <= MAX_WORDS):
        fails.append(f"B5 length — {n} words, want {MIN_WORDS}–{MAX_WORDS}")
    if DISCLOSURE not in s:
        fails.append("A8 disclosure — drafting-assistance line missing or altered")
    for needle, why in FORBIDDEN:
        # A quoted mention ("studies show" named as the thing to avoid) is fine;
        # the bare phrase doing work in a sentence is not.
        if re.search(r"(?<![\u201c\"'])" + re.escape(needle), text):
            fails.append(f"forbidden string {needle.strip()!r} — {why}")
    # "validated" is fine about SR 26-2 or a proof. About his study it is A3.
    if re.search(r"\b(study|research|instrument|model)\b[^.]{0,80}\b(was|is|were|has been|have been) validated\b", text, re.I):
        fails.append("A3 — the study reached feasibility, not validation")
    for m in REQUIRED_META:
        if not re.search(rf'<meta name="{m}" content="[^"]+"', s):
            fails.append(f"meta — <meta name=\"{m}\"> missing (make_archive.py needs it)")
    t = re.search(r'<meta name="thread" content="([^"]+)"', s)
    if t and t.group(1) not in THREADS:
        fails.append(f"meta — thread {t.group(1)!r} is not one of {sorted(THREADS)}")
    if not re.search(r'<p class="eyebrow">Field note · \d{1,2} \w+ \d{4}</p>', s):
        fails.append("template — eyebrow is not 'Field note · DD Month YYYY'")
    if "<h2>" not in s or "On Monday." not in s:
        fails.append("format — needs <h2> question headers and an 'On Monday.' takeaway")
    if "mailto:YasirAMalik@gmail.com" not in s:
        fails.append("format — the correction invite (mailto) is missing")
    unverified = len(re.findall(r"\[UNVERIFIED", s))
    here = os.path.dirname(path)
    for href in re.findall(r'href="([^"#?]+)', s):
        if href.startswith(("http", "mailto:")):
            continue
        if not os.path.exists(os.path.normpath(os.path.join(here, href))):
            fails.append(f"link — {href} does not resolve from insights/")
    return n, unverified, fails


if __name__ == "__main__":
    paths = sys.argv[1:] or [os.path.join(ROOT, "insights", f)
                             for f in sorted(os.listdir(os.path.join(ROOT, "insights"))) if f.endswith(".html")]
    bad = 0
    for p in paths:
        name = os.path.relpath(p, ROOT)
        if '<meta name="heuristic"' not in open(p, encoding="utf-8").read():
            print(f"GATE: SKIP · {name} (predates the field-note format; not gated)")
            continue
        n, u, fails = check(p)
        if fails:
            bad += 1
            print(f"GATE: FAIL · {name} ({n} words, {u} unverified)")
            for f in fails:
                print(f"    {f}")
        else:
            print(f"GATE: PASS · {name} ({n} words, {u} unverified)")
    sys.exit(1 if bad else 0)
