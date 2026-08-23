---
name: repo-governance
description: >-
  Use for GitHub architecture, Pages publishing, repositories, branches, pull
  requests, workflows, agents, Claude skills, automation, invariants, public vs
  private boundaries, and repository cleanup. Trigger on GitHub, repo, branch,
  PR, merge, workflow, Pages, skill path, agent, invariant, deploy, publish,
  automation, or "make future sessions use this". Prefer isolated branches,
  explicit verification, discoverable .claude/skills layout, and strict public
  repository privacy controls.
---

# Repository governance

## Rules
1. Inspect `AGENTS.md`, `CLAUDE.md`, `.claude/SKILL-MAP.md`, and relevant skill before mutation.
2. Use isolated branches for substantive changes; merge only after reviewing the exact diff and invariant status.
3. Treat this Pages repository as public. Never commit secrets, private legal/medical/financial records, tokens, credentials, private recipient lists, or sensitive source originals.
4. Claude-discoverable skills live only at `.claude/skills/<skill>/SKILL.md` and require YAML `name` + trigger-rich `description` frontmatter.
5. Do not call a flat root Markdown document a durable Claude skill.
6. Keep one canonical copy of each executable skill; indexes may link to it but must not fork its instructions.
7. Preserve invariant tests and extend them when a regression class is discovered.
8. Before a public-facing deploy, test for accidental data transport in URLs, localStorage, generated files, static HTML, source maps and committed fixtures.

## Definition of done
- Correct branch/base identified.
- Diff reviewed for unrelated changes.
- Public/private boundary checked.
- Discoverability path verified.
- Relevant tests/invariants pass, or inability to run them is explicitly recorded.
- Remote main/PR state is re-read after merge; do not rely on stale local SHA claims.
