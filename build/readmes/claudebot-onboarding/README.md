<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://malikai-786.github.io/assets/brand/banners/claudebot-onboarding/banner-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://malikai-786.github.io/assets/brand/banners/claudebot-onboarding/banner-light.png">
    <img alt="ClaudeBot Onboarding — Yasir A. Malik" src="https://malikai-786.github.io/assets/brand/banners/claudebot-onboarding/banner-light.png" width="100%">
  </picture>
</p>

# Practical AI adoption

A walkthrough for colleagues meeting LLM tooling for the first time.

Most AI training either oversells the tool or drowns people in prompt tricks. I
wrote this for audit and risk colleagues who need a third thing: what it is good
at, what it is bad at, and where a professional still has to do the thinking.
It is deliberately unglamorous, and it is the document I actually hand to
people.

## Getting started

**Understand the shape of the tool.** It drafts and edits text, explains
concepts, reads and writes code, summarises, and helps you think out loud. It
does not know what it does not know, and it will not tell you when it is
guessing.

**Ask properly.** Be specific about what you need and why. Give it the context a
new colleague would need. Break large tasks into steps. Say what format you want
back.

**Iterate.** Push back on the first answer. Ask it to argue the other side. The
second answer is usually the useful one.

## Where judgment stays yours

| The tool is good at | You still own |
| --- | --- |
| Drafting, editing, restructuring | Whether the conclusion is right |
| Explaining an unfamiliar concept | Whether it applies to your facts |
| Reading code and spotting patterns | Whether the control actually operates |
| Summarising long documents | What was left out of the summary |

The failure mode to watch for is not the obvious wrong answer. It is the
plausible one that arrives already formed, in confident prose, agreeing with the
position you walked in holding. That is the risk I research, and it is the
reason this guide exists.

## Working rules

1. Know what you want before you start.
2. Give context; vague requests get vague answers.
3. Verify anything you would be embarrassed to be wrong about.
4. Disclose the assistance where disclosure matters.
5. Never let it write the conclusion for you.

## Recent tooling worth knowing

Claude Code ships weekly. Most of it is cosmetic. A few changes actually
change how you work with it.

**Sessions follow you, not the machine.** `/resume` in the desktop app pulls
in any terminal session, even a closed one, with the same transcript. Remote
Control (`claude rc`) starts a session from your phone on a machine you left
running, picking up its files, MCP servers, and tools where you left off.
Running several sessions at once, `/color` and `/rename` label each one so
you can tell them apart, and the label follows the session across `--resume`.

**Supervised instead of trusted.** `claude --restricted` disables command
execution, code execution, and web access outright, and confines file tools
to the working directory. The right default for a shared machine or anywhere
the assistant should be watched rather than given the keys.

**Verification habits worth copying**, from engineers who use this daily:

- *Recap before resuming.* A short skill that refreshes anything stale — a
  PR, a running job, a linked thread — then reports four things: the goal in
  the requester's own words, actual status with evidence ("tests passing"
  does not count as proof), what's blocked on a person versus something
  technical, and next steps split into "Claude's" and "yours." It is not
  allowed to start new work during the recap.
- *Adversarial review before you read a diff.* A fresh subagent that has not
  seen the conversation — so it does not share its blind spots — attacks the
  change for correctness and simplicity, then publishes its assumptions and
  design reasoning as a short writeup. Read that first; it tells you where to
  look instead of reading the whole diff cold.

Neither of those is a feature. They are habits: verify before you trust the
first answer, and get a second, independent read before you sign off on your
own work. That is the whole argument of this document, restated in the
tool's own vocabulary.

---

<sub>[Profile](https://github.com/MalikAI-786) · [Site](https://malikai-786.github.io) · [Brand system](https://malikai-786.github.io/brand.html) · [Newsletter](https://proofoverpromise.substack.com) · [LinkedIn](https://linkedin.com/in/yasiramalik)</sub>

<sub><b>Yasir A. Malik</b> · Audit · Risk · Governance · Newark, NJ · NYC metro</sub>
