---
name: source-skill-ingestion
version: 1.0.0
owner: Yasir A. Malik
status: production
scope: cross-repository
purpose: >
  Convert user-supplied external sources (reels, videos, posts, articles, PDFs,
  transcripts, screenshots, emails, documents, and links) into durable,
  provenance-backed agent skills without inventing content that was not
  actually observed.
---

# Source Skill Ingestion — Persistent Agent Protocol

## Trigger
Use this skill whenever Yasir supplies a source and asks to learn from it,
extract skills, keep it for later, reuse it, incorporate it into prompting,
or make sure future agents have it.

Examples include Instagram/TikTok/YouTube reels, articles, PDFs, screenshots,
meeting notes, emails, GitHub repositories, research papers, and transcripts.

## Non-negotiable source rule
The source itself is the evidence population.

1. Read/watch/inspect the source if the available tool can access it.
2. Preserve the source's terminology, ordering, examples, and stated limits.
3. Separate three classes explicitly:
   - SOURCE-DERIVED: directly supported by the material.
   - INFERENCE: a reasonable implementation implication, not stated verbatim.
   - EXTERNAL RESEARCH: added from other verified sources.
4. Never fill a missing transcript, hidden slide, inaudible statement, blocked
   reel, or inaccessible page from general knowledge.
5. If the source cannot be retrieved, record `SOURCE_PENDING_CAPTURE` and its
   exact URL/identifier. Do not create fake extracted skills.

## Extraction pass
For each accessible source, extract every reusable item that changes how an
agent should perform work. At minimum look for:

- named frameworks or mental models
- prompting patterns
- agent roles / delegation patterns
- tool-selection rules
- workflow sequences
- verification / critique loops
- memory / context-management methods
- research techniques
- coding or automation practices
- decision gates and stop conditions
- templates / schemas / structured outputs
- evaluation metrics
- security / privacy / provenance controls
- failure modes and anti-patterns
- examples that clarify when a technique should or should not be used

Do not treat motivational language, claims without an operational method, or
purely descriptive commentary as a 'skill' unless it translates into an
executable behavior.

## Skill card format
Every extracted reusable technique must be normalized into this card:

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
Before adding a new durable skill:

1. Search the relevant repository for existing `SKILL*.md`, `AGENTS.md`,
   `CLAUDE.md`, prompts, scripts, and workflow files.
2. Prefer enhancing an existing skill when the new source materially improves
   the same capability.
3. Create a new skill only when the behavior is distinct enough to have its own
   trigger, procedure, or evaluation criteria.
4. Never overwrite a stronger existing safeguard with a weaker social-media or
   third-party recommendation.
5. When two sources conflict, preserve both claims with provenance and create a
   decision note; do not silently reconcile them.

## Persistence model
Use three layers:

1. **Notion control center** — live status, source queue, decisions, blockers,
   and what has or has not been fully captured.
2. **GitHub skill files** — sanitized, reusable operating instructions that
   should survive across Claude, ChatGPT, Codex, Gemini, local agents, and new
   sessions.
3. **Private source/evidence store** — source materials or sensitive records
   that should not be published to a public Git repository.

Never put credentials, private financial records, legal records, medical data,
account numbers, personal records, or other sensitive originals into public
GitHub merely because they informed a skill.

## Cross-agent discoverability
A durable skill is not complete until a fresh agent can find it.

When adding or changing a domain skill:

- link it from the nearest durable agent entry point (`AGENTS.md`, `CLAUDE.md`,
  a repo-specific skill index, or the Notion control center);
- use stable filenames and explicit trigger language;
- include version and provenance;
- avoid requiring chat memory to understand why the skill exists.

## Blocked-source behavior
If a supplied source is inaccessible through available tools:

1. Preserve the exact source URL and identifier.
2. Mark it `SOURCE_PENDING_CAPTURE`.
3. Do not claim it was reviewed or extracted.
4. If the user later supplies the video, screen recording, transcript,
   screenshots, caption text, or an accessible mirror, process it immediately
   under this protocol.
5. Keep the ingestion task visible in the live control center until resolved.

## Quality gate
Before declaring extraction complete, answer all of these:

- Did I actually access the source?
- Did I distinguish source facts from inference?
- Did I extract executable behavior rather than slogans?
- Did I search for overlap with existing skills?
- Did I preserve stronger existing controls?
- Did I give the skill a durable home?
- Can a fresh agent discover it without this conversation?
- Did I keep sensitive source material out of public Git?

If any answer is no, extraction is not complete.

## Current pending source
- URL: https://www.instagram.com/reel/DcV05a_Ag3e/
- Identifier: DcV05a_Ag3e
- Status: SOURCE_PENDING_CAPTURE
- Reason: Instagram public fetch was unavailable through the current web and
  connector interfaces on 2026-08-23. No content-derived claim has been
  created from this reel yet.

---

This protocol is about durable capability, not collecting links. A source is
useful only when its operational method is either incorporated into an existing
skill or preserved as a new discoverable skill with provenance.
