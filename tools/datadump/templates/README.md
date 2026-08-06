# Data dump

A local git repository for working data. No remote by design — nothing here
leaves this machine unless a remote is added deliberately.

## Layout

| Directory   | What goes in it                                          |
|-------------|----------------------------------------------------------|
| `inbox/`    | Whatever just arrived, unsorted. Triage from here.       |
| `datasets/` | Sorted data worth keeping. One subdirectory per source.  |
| `notes/`    | Markdown notes, provenance, and what a dataset means.    |
| `scripts/`  | Anything used to fetch, clean, or reshape the data.      |

## Guardrails

A versioned `pre-commit` hook (in `.githooks/`, wired up via
`core.hooksPath`) refuses any staged file over 50MB and anything that looks
like a credential. Override the size limit with `MAX_MB=200 git commit`, or
skip the hook entirely with `git commit --no-verify`.

## Worth knowing about git and data

Git stores every version of every file forever. A 200MB CSV committed weekly
is 200MB added to the repo each time, and deleting it later does not shrink
the history — it only adds a commit. For data that changes often, commit the
script that produces it rather than the output, or keep the file outside the
repo and commit a note recording where it came from.

## If you ever want it backed up

```bash
git remote add origin <url>     # a private repo, or a path on an external drive
git push -u origin main
```

A plain directory works as a remote, which keeps this entirely off the
internet:

```bash
git init --bare /Volumes/Backup/data-dump.git
git remote add origin /Volumes/Backup/data-dump.git
git push -u origin main
```
