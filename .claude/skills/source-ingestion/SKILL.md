---
name: source-ingestion
description: >-
  Turn user-supplied reels, videos, posts, articles, PDFs, transcripts,
  screenshots, emails, documents and links into durable, provenance-backed
  reusable agent skills. Trigger whenever Yasir says to learn from a source,
  extract skills, remember a method, keep it for future agents, incorporate it
  into prompting, or make sure a new session can reuse it. Never invent content
  from inaccessible sources; separate source-derived facts, inference, and
  external research; reconcile with existing skills before adding new ones.
---

# Source ingestion — durable agent protocol

## Trigger
Use this skill whenever Yasir supplies a source and asks to learn from it,
extract skills, keep it for later, reuse it, incorporate it into prompting,
or make sure future agents have it.

Examples include Instagram/TikTok/YouTube reels, articles, PDFs, screenshots,
meeting notes, emails, GitHub repositories, research papers, and transcripts.

## Non-negotiable source rule
The source itself is the evidence population.

1. Read, watch, or inspect the source when an available tool can access it.
2. Preserve the source's terminology, ordering, examples, and stated limits.
3. Separate three classes explicitly:
   - SOURCE-DERIVED: directly supported by the material.
   - INFERENCE: a reasonable implementation implication, not stated verbatim.
   - EXTERNAL RESEARCH: added from other verified sources.
4. Never fill a missing transcript, hidden slide, inaudible statement, blocked
   reel, or inaccessible page from general knowledge.
5. If the source cannot be retrieved, record `SOURCE_PENDING_CAPTURE` and its
   exact URL or identifier. Do not create fake extracted skills.

## Extraction pass
For each accessible source, extract reusable items that change how an agent
should perform work. At minimum check for:

- named frameworks or mental models
- prompting patterns
- agent roles and delegation patterns
- tool-selection rules
- workflow sequences
- verification and critique loops
- memory and context-management methods
- research techniques
- coding or automation practices
- decision gates and stop conditions
- templates, schemas and structured outputs
- evaluation metrics
- security, privacy and provenance controls
- failure modes and anti-patterns
- examples defining when a technique should or should not be used

Do not elevate motivational language or descriptive commentary into a skill
unless it produces an executable behavior.

## Skill card format
Normalize each reusable technique into:

### <skill name>
- Source: <URL / document / message identifier>
- Evidence status: SOURCE-DERIVED | INFERENCE | EXTERNAL-RESEARCH
- Problem solved:
- Trigger / when to use:
- Inputs required:
- Procedure:
- Verification / success test:
- Failure modes:
- Safety / privacy constraints:
- Best home: <repo/path or Notion control page>
- Related existing skill(s):

## Reconciliation with existing skills
Before adding a durable skill:

1. Search the relevant repository for existing `.claude/skills/**/SKILL.md`,
   `AGENTS.md`, `CLAUDE.md`, prompts, scripts and workflow files.
2. Prefer improving an existing skill when the new source materially improves
   the same capability.
3. Create a new skill only when the behavior is distinct enough to have its own
   trigger, procedure or evaluation criteria.
4. Never replace a stronger safeguard with a weaker social-media or third-party
   recommendation.
5. When sources conflict, preserve both claims with provenance and create a
   decision note; never silently reconcile them.

## Persistence model
Use three layers:

1. **Notion control center** — live status, source queue, decisions, blockers,
   and capture state.
2. **GitHub `.claude/skills/**/SKILL.md` files** — sanitized reusable operating
   instructions discoverable by future Claude Code sessions and other agents
   that inspect the repository.
3. **Private source/evidence store** — source materials or sensitive records
   that must not be published to a public repository.

Never put credentials, private financial records, legal records, medical data,
account numbers, personal records, or sensitive originals into public GitHub
merely because they informed a skill.

## Discoverability gate
A durable skill is not complete until a fresh agent can discover it.

- The canonical executable skill must live at `.claude/skills/<skill>/SKILL.md`.
- `SKILL.md` must start with YAML frontmatter containing `name` and a trigger-
  rich `description`.
- Stable filenames and explicit trigger language are mandatory.
- Link important skills from the repository skill map, but never rely on a
  manual link as the only discovery mechanism.
- Do not keep a second canonical copy under a publicly served Pages path.

## Blocked-source behavior
If a source cannot be accessed:

1. Preserve the exact URL and identifier.
2. Mark it `SOURCE_PENDING_CAPTURE`.
3. Do not claim it was reviewed or extracted.
4. If the user later supplies the file, screen recording, transcript,
   screenshots, caption text or accessible mirror, process it immediately.
5. Keep the ingestion task visible in the live control center until resolved.

## Quality gate
Before declaring extraction complete, verify all of these:

- The source was actually accessed, or explicitly marked pending.
- Source facts are separated from inference.
- Executable behavior was extracted rather than slogans.
- Existing skills were checked for overlap.
- Stronger safeguards were preserved.
- The skill has a durable canonical home.
- A fresh session can discover it from `.claude/skills/`.
- Sensitive source material stayed out of public Git.

If any answer is no, extraction is not complete.

## Current pending source
- URL: https://www.instagram.com/reel/DcV05a_Ag3e/
- Identifier: DcV05a_Ag3e
- Status: SOURCE_PENDING_CAPTURE
- Reason: the reel content has not yet been captured through an accessible
  source path. No content-derived claim should be created until it is.
