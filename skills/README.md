# MalikAI Durable Agent Skills

This directory holds sanitized, reusable operating skills that should remain
discoverable across assistants and sessions.

## Mandatory cross-domain skills

- [`SKILL-source-ingestion.md`](SKILL-source-ingestion.md) — use whenever Yasir
  supplies a reel, video, post, article, PDF, screenshot, email, document,
  repository, transcript, or other source and asks to learn from it, extract
  techniques, preserve it, or incorporate it into future work.

## Rule for fresh agents

Before treating an external source as learned knowledge, apply the source-skill
ingestion protocol. Do not rely on chat memory, do not invent inaccessible
content, and do not create a new skill when an existing domain skill can be
strengthened instead.

Live status, pending captures, and decisions remain in the Malik Operating
System Notion control center; GitHub is the sanitized published operating
record.
