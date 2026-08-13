#!/usr/bin/env python3
"""
Draft a LinkedIn post from source material.

Drafts only. This script writes a markdown file to disk and does nothing else —
it does not post, schedule, publish, or touch LinkedIn. It holds no LinkedIn
credentials and never will. Publishing stays with you, one post at a time.

    pip install anthropic
    export ANTHROPIC_API_KEY=...

    ./draft_post.py notes.md
    ./draft_post.py notes.md --measure M2 --chars 1400

The rules live in files, not in this script: tools/newsletter/voice.md governs
the voice, and .claude/skills/linkedin/ carries the platform mechanics, the
register discipline, the series architecture and the checklist. All of them are
reloaded on every run, so editing a rule changes the next draft.
"""
import argparse
import re
import sys
from datetime import date
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("anthropic SDK not installed. Run: pip install anthropic")

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
VOICE_PATH = REPO / "tools" / "newsletter" / "voice.md"
SKILL_DIR = REPO / ".claude" / "skills" / "linkedin"

MODEL = "claude-opus-5"

# Claude Opus 5 safety classifiers can decline a request, returning a normal
# HTTP 200 with stop_reason "refusal". Opting in re-runs the declined request on
# Anthropic's recommended fallback inside the same call. Set to False if this
# beta is not enabled on your account (the request 400s if it is not).
USE_REFUSAL_FALLBACK = True
FALLBACK_BETA = "server-side-fallback-2026-07-01"

# The fold budget from references/platform.md. Deliberately conservative: a hook
# that works at 200 works on every layout.
FOLD = 200
CEILING = 3000


def load_rules() -> str:
    """Voice spec plus the whole linkedin skill, concatenated and labelled.

    Identical across runs, so it is cached as a system prompt prefix.
    """
    if not VOICE_PATH.exists():
        sys.exit(f"missing voice spec: {VOICE_PATH}")
    if not SKILL_DIR.exists():
        sys.exit(f"missing linkedin skill: {SKILL_DIR}")

    parts = [
        "You are drafting a LinkedIn post for Yasir A. Malik. The governing "
        "voice specification comes first, then the platform-specific skill. "
        "Where they disagree, the skill records a deliberate deviation and "
        "explains why; follow the skill on those points and the voice spec on "
        "everything else.",
        "",
        "=== VOICE SPECIFICATION (governs all published writing) ===",
        "",
        VOICE_PATH.read_text(encoding="utf-8"),
    ]

    files = [SKILL_DIR / "SKILL.md"]
    files += sorted((SKILL_DIR / "references").glob("*.md"))
    for path in files:
        rel = path.relative_to(REPO)
        parts += ["", f"=== {rel} ===", "", path.read_text(encoding="utf-8")]

    return "\n".join(parts)


def build_task(sources: list[tuple[str, str]], chars: int, measure: str | None) -> str:
    """The per-post turn. Everything stable lives in the cached system prompt."""
    parts = [
        "Draft one LinkedIn post from the source material below.",
        "",
        f"Target length: about {chars} characters of body text, and never more "
        f"than {CEILING}. Match the length to what the material actually "
        "supports. Do not pad, do not add a second argument to fill space, and "
        "do not append a summary.",
    ]
    if measure:
        parts += ["", f"This is Measures series item {measure}. Read its row in "
                      "references/series-measures.md and honour the register rule: "
                      "the tradition is where the idea came from, never the "
                      "authority for the claim. Delete-the-citation test before "
                      "you finish."]

    parts += [
        "",
        "Output format: markdown, in this exact structure and nothing else.",
        "",
        "```",
        "# <working title, for the file only — never posted>",
        "",
        "## Post",
        "",
        "<the body exactly as it would be pasted into the composer, including "
        "the hashtags on their own line at the end>",
        "",
        "## First comment",
        "",
        "<the comment carrying the link, drafted as carefully as the post>",
        "",
        "## Notes",
        "",
        "<what you were unsure about, in plain sentences>",
        "",
        "## Gaps",
        "",
        "<every [UNVERIFIED: ...] marker you used, plus anything left out under "
        "the privacy rule. Write 'None.' if there are none.>",
        "```",
        "",
        "No preamble, no note about what you are about to do, no closing offer "
        "of revisions.",
        "",
        f"The first {FOLD} characters of the post body are all that shows before "
        "the fold. The whole hook must land inside that budget, and the text "
        "before the first line break must stand alone as a complete thought — "
        "on some layouts that break is where the post truncates.",
        "",
        "Never invent a fact. Not a date, title, employer, credential, metric, "
        "client, citation or outcome. If the material does not supply something "
        "you need, write [UNVERIFIED: what is missing] inline and keep going. "
        "Do not approximate a number to make a sentence land.",
        "",
        "--- SOURCE MATERIAL ---",
    ]

    for name, text in sources:
        parts += ["", f"### Source: {name}", "", text]

    return "\n".join(parts)


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "post"


def report_length(body: str) -> None:
    """Measure the drafted post against the fold and the ceiling."""
    match = re.search(r"^## Post\s*\n(.*?)(?=^## )", body, re.S | re.M)
    if not match:
        print("warning: could not find the '## Post' section to measure.", file=sys.stderr)
        return

    post = match.group(1).strip()
    n = len(post)
    print(f"Post body: {n} characters (ceiling {CEILING}).", file=sys.stderr)
    if n > CEILING:
        print(f"  OVER the composer limit by {n - CEILING}.", file=sys.stderr)

    # A break inside the budget is fine, but it becomes the effective truncation
    # point on some layouts — so what matters is whether the text before it
    # stands alone. Report that, not the mere presence of a break.
    hook = post[:FOLD].split("\n", 1)[0].strip()
    print(f"  Effective hook ({len(hook)} chars, of a {FOLD}-char budget):", file=sys.stderr)
    print(f"    {hook}", file=sys.stderr)
    if not hook.endswith((".", "?", "!", '."', '.”')):
        print("  warning: the hook does not end on a full stop — check it reads "
              "as a complete thought where it truncates.", file=sys.stderr)


def main() -> int:
    ap = argparse.ArgumentParser(description="Draft a LinkedIn post.")
    ap.add_argument("sources", nargs="+", type=Path,
                    help="Files of source material: notes, findings, an idea line.")
    ap.add_argument("--chars", type=int, default=1300,
                    help="Target body length in characters (default 1300).")
    ap.add_argument("--measure", help="Measures series item, e.g. M2.")
    ap.add_argument("--out", type=Path, default=HERE / "drafts",
                    help="Output directory (default: ./drafts, which is gitignored).")
    ap.add_argument("--effort", default="high",
                    choices=["low", "medium", "high", "xhigh", "max"],
                    help="Reasoning effort (default high).")
    args = ap.parse_args()

    rules = load_rules()

    sources = []
    for path in args.sources:
        if not path.exists():
            sys.exit(f"no such file: {path}")
        sources.append((path.name, path.read_text(encoding="utf-8")))

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY, or an `ant auth login` profile

    request = dict(
        model=MODEL,
        max_tokens=16000,
        # The rules are identical across runs, so cache them: later posts read
        # the prefix instead of re-paying for it.
        system=[{"type": "text", "text": rules, "cache_control": {"type": "ephemeral"}}],
        thinking={"type": "adaptive"},
        output_config={"effort": args.effort},
        messages=[{"role": "user", "content": build_task(sources, args.chars, args.measure)}],
    )

    print(f"Drafting with {MODEL} (effort={args.effort})…\n", file=sys.stderr)

    if USE_REFUSAL_FALLBACK:
        stream_ctx = client.beta.messages.stream(
            **request, betas=[FALLBACK_BETA], fallbacks="default"
        )
    else:
        stream_ctx = client.messages.stream(**request)

    with stream_ctx as stream:
        for chunk in stream.text_stream:
            print(chunk, end="", flush=True, file=sys.stderr)
        message = stream.get_final_message()

    print("\n", file=sys.stderr)

    # Check why generation stopped before trusting the content.
    if message.stop_reason == "refusal":
        detail = getattr(message, "stop_details", None)
        category = getattr(detail, "category", None) if detail else None
        sys.exit(f"declined by safety classifiers (category: {category}). Nothing written.")
    if message.stop_reason == "max_tokens":
        print("warning: hit max_tokens — the draft is truncated.", file=sys.stderr)

    body = "".join(b.text for b in message.content if b.type == "text").strip()
    if not body:
        sys.exit("empty response. Nothing written.")

    args.out.mkdir(parents=True, exist_ok=True)
    stem = slugify(args.measure) if args.measure else "post"
    outfile = args.out / f"{date.today().isoformat()}-{stem}.md"
    outfile.write_text(body + "\n", encoding="utf-8")

    report_length(body)

    usage = message.usage
    cached = getattr(usage, "cache_read_input_tokens", 0) or 0
    print(f"\nDraft written to {outfile}", file=sys.stderr)
    print(f"Tokens: {usage.input_tokens} in ({cached} cached), "
          f"{usage.output_tokens} out", file=sys.stderr)
    print("\nThis is a draft. Run the checklist in "
          ".claude/skills/linkedin/references/checklist.md before it goes "
          "anywhere. Nothing here posts anything.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
