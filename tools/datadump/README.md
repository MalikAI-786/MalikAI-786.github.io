# tools/datadump

Tooling, not website. Nothing in this directory is linked from `index.html`, styled
by `assets/brand/tokens.css`, or served as part of the public site in any meaningful
sense — GitHub Pages will happily hand out these files, but they exist here only so
the script survives the machine it was written on.

## What it is

`init-datadump.sh` bootstraps a **local** git repository for working data — the
place a downloaded CSV or an exported workbook goes so that it has a history and a
provenance note instead of a filename ending in `-final-v3`.

What the script creates, in one run:

- `inbox/ datasets/ notes/ scripts/` scaffold, each with a `.gitkeep` so the empty
  directories survive the first commit
- a `.gitignore` covering credentials, working files, Python cruft and OS junk
- a `.gitattributes` that normalises text to LF and marks data formats binary, so
  git never tries to diff a spreadsheet
- a `README.md` explaining the layout and why committing a 200MB CSV weekly is a
  bad idea
- a versioned `pre-commit` hook in `.githooks/`, wired up with
  `git config core.hooksPath .githooks`, that refuses any staged file over 50MB
  and anything credential-shaped
- one initial commit on `main`, and **no remote** — nothing leaves the machine
  unless a remote is added deliberately

## Running it

```bash
bash tools/datadump/init-datadump.sh              # creates ~/data-dump
bash tools/datadump/init-datadump.sh ~/audit-dump # or wherever you like
MAX_MB=200 bash tools/datadump/init-datadump.sh   # raise the hook's size limit
```

It refuses to run if a git repo already exists at the target path.

The script is **self-contained**. Every file it writes lives in a heredoc inside it,
so it can be copied to another machine on its own — no checkout of this repo, no
`templates/` directory alongside it — and still work.

## `templates/`

The same file bodies, split out one per file, for reading and reuse. They are
reference copies: the script does not read them at runtime, and editing one changes
nothing until the matching heredoc in `init-datadump.sh` is edited to match.

They are deliberately named **without leading dots**:

| Template               | Becomes, in the generated repo |
|------------------------|--------------------------------|
| `templates/gitignore`  | `.gitignore`                   |
| `templates/gitattributes` | `.gitattributes`            |
| `templates/pre-commit` | `.githooks/pre-commit`         |
| `templates/README.md`  | `README.md`                    |

A real `.gitignore` or `.gitattributes` committed here would not be inert — git
applies both per-directory, so either file would silently change **this** repository's
behaviour for everything under `tools/datadump/`. Keep the dots off.

## Never commit real data here

This repository is the public source of `https://malikai-786.github.io/`. Every
branch is world-readable, and git history is not undone by deleting a file later.

Only reusable tooling belongs in this directory. No datasets, no extracts, no
credentials, no "just a small sample" — sample data that looks real is treated as
real data. The dumps the script creates are meant to live outside this repository
entirely, on the local machine, with no remote.
