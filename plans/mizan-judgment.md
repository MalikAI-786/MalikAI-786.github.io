# Judgment practice integration

## Purpose and scope

`mizan/judgment/` is an unscored educational worksheet for Iqbal reading, doctoral reasoning and evidence-bounded newsletter claims. It implements an independent first answer, a constructed challenge, an evidence record, and a justified revision. The two professional cases are synthetic. This practice is not validated, is not a psychometric instrument, and supplies no research findings.

The page is a standalone deliberate-work utility linked from `mizan/khudi/`. It does not load `core.js`, register a scored measure, or join the shared engine's page NAV. Its return links use the existing dashboard and Khudī routes. This keeps all seven measures, weights, phases, ladder gates, Lab behavior and stored history unchanged.

## State and privacy contract

State exists only in the current page's JavaScript memory and form controls. There are no storage API calls, cookies, query-string inputs, automatic network requests, AI requests, analytics, mail links, or sharing endpoints. Source links navigate only when the reader chooses them. A user-initiated text download is the sole export; no private examples or participant responses are shipped. The first answer and confidence are snapshotted before the challenge is shown and cannot be edited within the same attempt. Clearing or reloading starts a new attempt.

No access to `mizan.v1`, `mizan.money.v1`, `mizan.lab.v1`, current scores, calibration, or personal records is required. Confidence is a self-report in this practice, not a new Mīzān score or a measured improvement.

## Existing ʿIlm / Jarvis route

The user may manually discuss a selected worksheet in the existing ʿIlm review. No new agent, AI endpoint or automatic transfer is introduced. PR #26's Jarvis and Amānah additions remain a separate, unmerged change; this page neither imports their code nor depends on them. The private sixteen-session reading track and private DBA sources remain outside this public repository. This public utility is not a second canonical copy of that curriculum.

## Source provenance

- Source-derived: Iqbal describes his 1908 work as a historical review, introduction pp. x–xi; chapter V pp. 112–116 reports different Sufi positions. https://www.gutenberg.org/ebooks/41707
- Source-derived: Tversky and Kahneman discuss anchoring in judgment. *Science* 185(4157), 1124–1131 (1974), https://doi.org/10.1126/science.185.4157.1124
- Constructed application: the first-answer sequence, fictional review case, newsletter case, prompts, and export format. They carry no claim of validated bias reduction, religious authority, or faculty approval. The 1908 historical review is kept distinct from later khudī doctrine.

## Verification

Run `node .claude/skills/mizan/scripts/judgment-smoke.js`, then the existing Mīzān smoke suite and repository invariants where the full checkout and dependencies are available. The `mizan-judgment` workflow installs pinned Playwright and Chromium and runs both browser suites on a full checkout. Verify the empty state, first-answer gate, retained initial answer, each track, complete export, empty reload, no storage changes, no automatic remote requests, keyboard focus, and mobile overflow. Keep generated README/AGENTS files and the brand generators untouched.
