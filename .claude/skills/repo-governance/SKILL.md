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

**Repository governance**

1. Inspect `AGENTS.md`, `CLAUDE.md`, `.claude/SKILL-MAP.md`, and the relevant skill before mutation.
2. Use isolated branches for substantive changes. Merge only after reviewing the exact diff and invariant status.
3. Treat this Pages repository as public. Never commit secrets, private legal, medical, or financial records, tokens, credentials, private recipient lists, or sensitive source originals.
4. Claude-discoverable skills live only at `.claude/skills/<skill>/SKILL.md` and require YAML `name` plus a trigger-rich `description` in frontmatter.
5. Do not call a flat root Markdown document a durable Claude skill.
6. Keep one canonical copy of each executable skill. Indexes may link to it but must not fork its instructions.
7. Preserve invariant tests and extend them when a new regression class is discovered.
8. Before a public-facing deploy, test for accidental data transport in URLs, localStorage, generated files, static HTML, source maps, and committed fixtures.
9. Write repository prose like an editor, not like a template generator. Use ordinary sentences and a small number of useful sections. Prefer numbered procedures when order matters. Avoid decorative hash-heavy headings, repeated dash lists, canned transitions, and long em-dash chains when simpler grammar is clearer.

**Definition of done**

The correct branch and base are identified. The diff contains no unrelated changes. The public and private boundary is intact. A fresh session can discover the skill. Relevant tests and invariants pass, or the inability to run them is explicitly recorded. After merge, re-read the remote state rather than relying on a stale local commit claim.