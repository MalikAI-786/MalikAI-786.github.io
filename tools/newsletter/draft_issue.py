#!/usr/bin/env python3
"""
Draft an issue of Proof Over Promise from source material.

The interesting file in this directory is voice.md, not this one. This script
is plumbing: it reads whatever notes you point it at, sends them to Claude with
voice.md as the system prompt, and streams the result to a file. Everything
that decides how the draft actually reads lives in voice.md, which is a
document you edit rather than code you change.

Three decisions worth knowing before you edit this file.

1. **It writes to disk and nowhere else.** There is no send path, no Substack
   call, no LinkedIn call, and there should never be one. AGENTS.md is explicit
   that transmission is Yasir's decision every time, so the safest tool is one
   that structurally cannot transmit. Keep it that way.

2. **Output lands in build/newsletter/ and is gitignored.** Everything else in
   this repository is public by design; an unreviewed draft is the one thing
   that should not be. The ignore rule is deliberate, not an oversight.

3. **voice.md is cached, sources are not.** The system prompt carries a cache
   breakpoint, so repeated runs against the same voice.md pay for it once at
   read rates. That only holds while voice.md is byte-identical between runs —
   editing it is cheap, but it does invalidate the cache.

Usage:

    pip install anthropic
    export ANTHROPIC_API_KEY=...
    ./draft_issue.py notes.md --title "What the walkthrough found"
"""
import argparse
import contextlib
import datetime
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
VOICE = os.path.join(HERE, "voice.md")
OUT_DIR = os.path.join(ROOT, "build", "newsletter")

MODEL = "claude-opus-5"

# Thinking is on by default on this model and counts against max_tokens, so the
# ceiling is set well above the length of any issue voice.md asks for.
MAX_TOKENS = 32000

# A refusal here is close to unimaginable — this is a newsletter about audit
# evidence — but the classifiers are opt-out rather than opt-in, and a draft
# that silently stops is worse than one served by a fallback model.
FALLBACK_BETA = "server-side-fallback-2026-07-01"

EFFORTS = ("low", "medium", "high", "xhigh", "max")


# ---------------------------------------------------------------------------
# Source material.
#
# Anything readable as text is fair game: interview notes, a framework excerpt,
# a half-written draft, a transcript. Each file is fenced and labelled so the
# model can tell one source from another and cite them back in the handback
# note.
# ---------------------------------------------------------------------------

def read_sources(paths):
    """Read each source file, returning labelled blocks."""
    blocks = []
    for path in paths:
        with open(path, encoding="utf-8") as fh:
            text = fh.read().strip()
        if not text:
            sys.exit(f"error: {path} is empty — nothing to draft from.")
        blocks.append(f"<source path=\"{os.path.basename(path)}\">\n{text}\n</source>")
    return "\n\n".join(blocks)


def build_request(sources, title, thread):
    """Assemble the user turn: the material, then the ask."""
    parts = [
        "Here is the source material for this issue.",
        "",
        sources,
        "",
    ]
    if title:
        parts.append(f'Working title: "{title}". Use it, or propose a better '
                     "one at the top of the handback note if the material has "
                     "moved somewhere else.")
    else:
        parts.append("No title yet — propose one, and say in the handback note "
                     "what you were weighing against.")
    if thread:
        parts.append(f"This one sits in the {thread} thread.")
    parts.append(
        "Draft the issue. Work only from the material above and the facts on "
        "the record in your instructions; where the argument needs something "
        "neither of them gives you, leave the hole visible and say so in the "
        "handback note rather than filling it."
    )
    return "\n".join(parts)


def slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "issue"


# ---------------------------------------------------------------------------
# The call.
# ---------------------------------------------------------------------------

def open_stream(client, anthropic, params, stack):
    """Open the streaming request, degrading if the fallback beta is refused.

    Server-side fallbacks are worth having and cost nothing when they do not
    fire, but they are a beta and this script runs against whatever version of
    the SDK the reader happened to install. A refused beta should cost a line
    on stderr, not the draft.
    """
    try:
        return stack.enter_context(client.beta.messages.stream(
            betas=[FALLBACK_BETA], fallbacks="default", **params))
    except TypeError as exc:
        # An older SDK does not know the parameter at all. Any other TypeError
        # — an unresolvable credential, most often — is not ours to swallow.
        if "unexpected keyword" not in str(exc):
            raise
        print("note: this SDK predates server-side fallbacks; continuing "
              "without them.", file=sys.stderr)
    except (anthropic.BadRequestError, anthropic.NotFoundError) as exc:
        print(f"note: server-side fallbacks unavailable ({type(exc).__name__}); "
              "continuing without them.", file=sys.stderr)
    return stack.enter_context(client.messages.stream(**params))


def draft(params, out_path, header):
    """Stream the draft to disk, mirroring it to stderr as it arrives."""
    try:
        import anthropic
    except ImportError:
        sys.exit("error: the anthropic package is not installed — pip install anthropic")

    client = anthropic.Anthropic()
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    try:
        with contextlib.ExitStack() as stack:
            stream = open_stream(client, anthropic, params, stack)
            out = stack.enter_context(open(out_path, "w", encoding="utf-8"))
            out.write(header)
            for text in stream.text_stream:
                out.write(text)
                out.flush()
                sys.stderr.write(text)
                sys.stderr.flush()
            final = stream.get_final_message()
    except anthropic.AuthenticationError:
        sys.exit("\nerror: ANTHROPIC_API_KEY was rejected.")
    except TypeError as exc:
        # How the SDK reports having no credential to resolve at all.
        if "authentication" not in str(exc).lower():
            raise
        sys.exit("\nerror: no credentials — set ANTHROPIC_API_KEY, or run `ant auth login`.")
    except anthropic.RateLimitError as exc:
        sys.exit(f"\nerror: rate limited — {exc}")
    except anthropic.APIStatusError as exc:
        sys.exit(f"\nerror: API returned {exc.status_code} — {exc.message}")
    except anthropic.APIConnectionError as exc:
        sys.exit(f"\nerror: could not reach the API — {exc}")

    sys.stderr.write("\n")
    return final


def report(final, out_path):
    """Say plainly what came back, including when it came back short."""
    if final.stop_reason == "refusal":
        detail = getattr(final, "stop_details", None)
        category = getattr(detail, "category", None) or "unspecified"
        print(f"warning: the model declined this request ({category}). "
              f"The partial draft, if any, is at {out_path}.", file=sys.stderr)
    elif final.stop_reason == "max_tokens":
        print(f"warning: the draft hit the {MAX_TOKENS}-token ceiling and is cut "
              "off. Raise MAX_TOKENS or narrow the source material.", file=sys.stderr)

    usage = final.usage
    print(f"\n{out_path}", file=sys.stderr)
    print(f"  in {usage.input_tokens} · out {usage.output_tokens} · "
          f"cache read {usage.cache_read_input_tokens} · "
          f"cache write {usage.cache_creation_input_tokens}", file=sys.stderr)
    print("  Draft only. Nothing has been sent, posted or scheduled.", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(
        description="Draft an issue of Proof Over Promise from source material.",
        epilog="Writes to build/newsletter/. Sends nothing, anywhere, ever.")
    ap.add_argument("sources", nargs="+",
                    help="notes, transcripts, excerpts — anything readable as text")
    ap.add_argument("--title", help="working title for the issue")
    ap.add_argument("--thread", choices=("governance", "judgment", "evidence",
                                         "ethics", "practice"),
                    help="which of the five threads this belongs to")
    ap.add_argument("-o", "--out", help="output path (default: build/newsletter/<slug>.md)")
    ap.add_argument("--effort", choices=EFFORTS, default="high",
                    help="how hard the model works at it (default: high)")
    ap.add_argument("-f", "--force", action="store_true",
                    help="overwrite an existing draft")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the assembled prompt and exit without calling the API")
    args = ap.parse_args()

    for path in args.sources:
        if not os.path.isfile(path):
            sys.exit(f"error: no such file — {path}")

    with open(VOICE, encoding="utf-8") as fh:
        voice = fh.read()

    sources = read_sources(args.sources)
    request = build_request(sources, args.title, args.thread)

    if args.dry_run:
        print("=== system (voice.md) ===")
        print(voice)
        print("\n=== user ===")
        print(request)
        return

    today = datetime.date.today().isoformat()
    stem = args.title or os.path.splitext(os.path.basename(args.sources[0]))[0]
    out_path = args.out or os.path.join(OUT_DIR, f"{today}-{slugify(stem)}.md")

    if os.path.exists(out_path) and not args.force:
        sys.exit(f"error: {out_path} already exists — pass --force to overwrite.")

    header = (
        "---\n"
        f"title: {args.title or 'untitled'}\n"
        f"date: {today}\n"
        f"sources: {', '.join(os.path.basename(p) for p in args.sources)}\n"
        f"model: {MODEL} (effort: {args.effort})\n"
        "status: DRAFT — not reviewed, not published\n"
        "disclosure: Drafting assistance used and disclosed. The judgment, the\n"
        "  argument, and every claim about a real institution are Yasir's.\n"
        "---\n\n"
    )

    params = dict(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        # The voice prompt is stable across runs and the sources are not, so the
        # breakpoint goes here and nowhere else.
        system=[{"type": "text", "text": voice,
                 "cache_control": {"type": "ephemeral"}}],
        thinking={"type": "adaptive"},
        output_config={"effort": args.effort},
        messages=[{"role": "user", "content": request}],
    )

    final = draft(params, out_path, header)
    report(final, out_path)


if __name__ == "__main__":
    main()
