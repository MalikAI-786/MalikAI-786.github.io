#!/usr/bin/env python3
"""
The archive on newsletter.html, generated from the field notes themselves.

Each insights/*.html carries its own date, title, thesis, thread and heuristic.
Typing those again into the newsletter page is how an archive drifts, so this
reads them off the notes and rewrites the block between the two markers. Run
it after adding a note; invariants.py checks the block matches.

Notes dated in the future are emitted with their date; the page hides them
client-side until the date arrives, so a batch of drafts can merge once and
surface one a week. Without JavaScript they simply all show.
"""
import html, os, re, sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NOTES = os.path.join(ROOT, "insights")
PAGE = os.path.join(ROOT, "newsletter.html")
START, END = "<!-- archive:start -->", "<!-- archive:end -->"

MONTHS = {m: i for i, m in enumerate(
    "January February March April May June July August September October November December".split(), 1)}


def read_note(path):
    s = open(path, encoding="utf-8").read()
    def grab(pat, flags=re.S):
        m = re.search(pat, s, flags)
        return html.unescape(re.sub(r"<[^>]+>", " ", m.group(1))).strip() if m else ""
    eyebrow = grab(r'<p class="eyebrow">(.*?)</p>')
    m = re.search(r"(\d{1,2}) (\w+) (\d{4})", eyebrow)
    if not m:
        sys.exit(f"{path}: eyebrow has no date: {eyebrow!r}")
    d = date(int(m.group(3)), MONTHS[m.group(2)], int(m.group(1)))
    return dict(
        file=os.path.basename(path),
        date=d,
        title=re.sub(r"\s+", " ", grab(r"<h1>(.*?)</h1>")),
        intro=grab(r'<p class="intro">(.*?)</p>'),
        thread=grab(r'<meta name="thread" content="([^"]*)"') or "Field note",
        heuristic=grab(r'<meta name="heuristic" content="([^"]*)"'),
    )


def card(n):
    tag = f'<span class="tag">{html.escape(n["thread"])}</span>'
    heur = f' <span class="tag heur">{html.escape(n["heuristic"])}</span>' if n["heuristic"] else ""
    return f'''      <a class="card" href="insights/{n["file"]}" data-thread="{html.escape(n["thread"])}">
        <time datetime="{n["date"].isoformat()}">{n["date"].day} {n["date"].strftime("%B %Y")}</time>
        <h3>{html.escape(n["title"])}</h3>
        <p>{html.escape(n["intro"])}</p>
        <div class="tags">{tag}{heur}</div>
      </a>'''


def build():
    notes = sorted((read_note(os.path.join(NOTES, f)) for f in os.listdir(NOTES) if f.endswith(".html")),
                   key=lambda n: n["date"], reverse=True)
    body = "\n".join(card(n) for n in notes)
    return f"{START}\n{body}\n      {END}", notes


def main(check=False):
    block, notes = build()
    page = open(PAGE, encoding="utf-8").read()
    a, b = page.find(START), page.find(END)
    if a < 0 or b < 0:
        sys.exit("newsletter.html is missing the archive markers")
    new = page[:a] + block + page[b + len(END):]
    if check:
        return new == page
    open(PAGE, "w", encoding="utf-8").write(new)
    today = date.today()
    live = sum(1 for n in notes if n["date"] <= today)
    print(f"  newsletter.html   {len(notes)} field notes in the archive, {live} dated on or before today")


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(0 if main(check=True) else 1)
    main()
