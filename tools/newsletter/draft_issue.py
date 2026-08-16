#!/usr/bin/env python3
"""
Draft an issue of Proof Over Promise from source material.

Drafts only. This script writes a markdown file to disk and does nothing else —
it does not post, publish, email, or touch Substack. Sending stays with you.

    pip install anthropic
    export ANTHROPIC_API_KEY=...

    ./draft_issue.py notes.md
    ./draft_issue.py notes.md transcript.txt --words 1200 --title "Working title"

The voice lives in voice.md next to this file, not in this script. Edit that file
to change how the drafts sound; the prompt reloads it on every run.
"""
import argparse
import os
import re
import sys
from datetime import date
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("anthropic SDK not installed. Run: pip install anthropic")

HERE = Path(__file__).resolve().parent
VOICE_PATH = HERE / "voice.md"

MODEL = "claude-opus-5"

# Claude Opus 5 safety classifiers can decline a request, returning a normal
# HTTP 200 with stop_reason "refusal". Opting in re-runs the declined request on
# Anthropic's recommended fallback inside the same call. Set to False if this
# beta is not enabled on your account (the request 400s if it is not).
USE_REFUSAL_FALLBACK = True
FALLBACK_BETA = "server-side-fallback-2026-07-01"


def build_task(sources: list[tuple[str, str]], words: int, title: str | None) -> str:
    """The per-issue turn. Everything stable lives in the cached system prompt."""
    parts = [
        "Draft the next issue of Proof Over Promise from the source material below.",
        "",
        f"Target length: about {words} words. Match the length to what the material "
        "actually supports — do not pad to reach the number, and do not add filler "
        "sections, a restated summary, or boilerplate to fill space.",
    ]
    if title:
        parts += ["", f'Working title supplied by the author: "{title}". '
                      "Use it, or propose a better one and say why in one line at the end."]

    parts += [
        "",
        "Deliver what was asked for, at the scope intended. Do not widen the piece "
        "into adjacent topics the material does not cover. If you think the framing "
        "is wrong, say so in one sentence at the end and draft it as asked anyway.",
        "",
        "Output format: markdown. Start with an H1 title, then the body. No preamble, "
        "no note to me about what you are about to do, no closing offer of revisions. "
        "If any facts were missing, list them under a final `## Gaps` heading — every "
        "`[UNVERIFIED: ...]` marker you used, plus anything you left out under the "
        "privacy rule.",
        "",
        "--- SOURCE MATERIAL ---",
    ]

    for name, text in sources:
        parts += ["", f"### Source: {name}", "", text]

    return "\n".join(parts)


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "issue"


def main() -> int:
    ap = argparse.ArgumentParser(description="Draft a Proof Over Promise issue.")
    ap.add_argument("sources", nargs="+", type=Path,
                    help="Files of source material: notes, transcripts, findings.")
    ap.add_argument("--words", type=int, default=900, help="Target length (default 900).")
    ap.add_argument("--title", help="Working title, if you have one.")
    ap.add_argument("--out", type=Path, default=HERE / "drafts",
                    help="Output directory (default: ./drafts next to this script).")
    ap.add_argument("--effort", default="high",
                    choices=["low", "medium", "high", "xhigh", "max"],
                    help="Reasoning effort (default high).")
    args = ap.parse_args()

    if not VOICE_PATH.exists():
        sys.exit(f"missing voice spec: {VOICE_PATH}")
    voice = VOICE_PATH.read_text(encoding="utf-8")

    sources = []
    for path in args.sources:
        if not path.exists():
            sys.exit(f"no such file: {path}")
        sources.append((path.name, path.read_text(encoding="utf-8")))

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY, or an `ant auth login` profile

    request = dict(
        model=MODEL,
        max_tokens=64000,
        # The voice spec is identical across runs, so cache it: later issues read
        # the prefix instead of re-paying for it.
        system=[{"type": "text", "text": voice, "cache_control": {"type": "ephemeral"}}],
        thinking={"type": "adaptive"},
        output_config={"effort": args.effort},
        messages=[{"role": "user", "content": build_task(sources, args.words, args.title)}],
    )

    print(f"Drafting with {MODEL} (effort={args.effort})…\n", file=sys.stderr)

    # Streaming, because a long issue at a large max_tokens would otherwise risk
    # an HTTP timeout — and it lets you watch the piece arrive.
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
    stem = slugify(args.title) if args.title else "issue"
    outfile = args.out / f"{date.today().isoformat()}-{stem}.md"
    outfile.write_text(body + "\n", encoding="utf-8")

    usage = message.usage
    cached = getattr(usage, "cache_read_input_tokens", 0) or 0
    print(f"Draft written to {outfile}", file=sys.stderr)
    print(f"Tokens: {usage.input_tokens} in ({cached} cached), "
          f"{usage.output_tokens} out", file=sys.stderr)
    print("\nThis is a draft. Read it before it goes anywhere.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
