# MalikAI Durable Agent Skills

This directory is a compatibility index for sanitized, reusable operating skills.
Executable Claude Code skills live under `.claude/skills/<name>/SKILL.md`, which
is the discovery layout new sessions actually load.

## Mandatory cross-domain skills

- [`source-ingestion`](../.claude/skills/source-ingestion/SKILL.md) — use whenever
  Yasir supplies a reel, video, post, article, PDF, screenshot, email, document,
  repository, transcript, or other source and asks to learn from it, extract
  techniques, preserve it, or incorporate it into future work.

## Rule for fresh agents

Before treating an external source as learned knowledge, apply the source-ingestion
protocol. Do not rely on chat memory, do not invent inaccessible content, and do
not create a new skill when an existing domain skill can be strengthened instead.

Start with [`.claude/SKILL-MAP.md`](../.claude/SKILL-MAP.md) for domain routing.
Live status, pending captures, and decisions remain in the Malik Operating System
Notion control center; GitHub is the sanitized published operating record.
