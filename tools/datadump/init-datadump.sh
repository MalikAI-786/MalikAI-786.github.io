#!/usr/bin/env bash
#
# init-datadump.sh — create a local git repository for data dumps.
#
# Local only: no remote is added, nothing is pushed anywhere. Adding a
# remote later is one command, printed at the end.
#
#   ./init-datadump.sh              # creates ~/data-dump
#   ./init-datadump.sh ~/audit-dump # or wherever you like
#
set -euo pipefail

TARGET="${1:-$HOME/data-dump}"
MAX_MB="${MAX_MB:-50}"

# Every file below is written with `>`, which truncates. So the target must be
# empty or absent — anything else and we would silently destroy a README, a
# .gitignore, or a repo the caller already had there.
if [ -e "$TARGET" ]; then
  if [ ! -d "$TARGET" ]; then
    echo "refusing: $TARGET exists and is not a directory" >&2
    exit 1
  fi
  if [ -e "$TARGET/.git" ]; then
    echo "refusing: a git repo already lives at $TARGET" >&2
    exit 1
  fi
  if [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
    echo "refusing: $TARGET is not empty — this script writes files that would overwrite what is there." >&2
    echo "Pick an empty or non-existent path instead." >&2
    exit 1
  fi
fi

mkdir -p "$TARGET"
cd "$TARGET"

git init -q -b main
mkdir -p inbox datasets notes scripts .githooks

# Keep the empty scaffold directories in the first commit.
for d in inbox datasets notes scripts; do
  printf 'Placeholder so git tracks this directory. Delete once it has real files.\n' > "$d/.gitkeep"
done

# ------------------------------------------------------------------ ignore
cat > .gitignore <<'IGNORE'
# Credentials and secrets — the pre-commit hook also blocks these, but
# ignoring them means they never reach the staging area in the first place.
.env
.env.*
*.pem
*.key
*_secret*
*_secrets*
credentials.json
service-account*.json
.netrc

# Working files that should not become history
*.tmp
*.part
*.download
~$*
.ipynb_checkpoints/

# Python
__pycache__/
*.py[cod]
.venv/
venv/

# OS and editor cruft
.DS_Store
._*
Thumbs.db
desktop.ini
.vscode/
.idea/
*.swp
IGNORE

# -------------------------------------------------------------- attributes
cat > .gitattributes <<'ATTRS'
# Text gets normalised line endings; data formats are treated as binary so
# git never tries to diff or line-ending-convert them.
* text=auto eol=lf

*.md   text eol=lf
*.txt  text eol=lf
*.csv  text eol=lf
*.tsv  text eol=lf
*.json text eol=lf
*.py   text eol=lf
*.sh   text eol=lf

*.xlsx binary
*.xls  binary
*.docx binary
*.pdf  binary
*.parquet binary
*.zip  binary
*.gz   binary
*.7z   binary
*.db   binary
*.sqlite binary
*.png  binary
*.jpg  binary
*.jpeg binary
ATTRS

# ------------------------------------------------------------------- hook
# Versioned in .githooks (not .git/hooks) so it survives a clone or a move.
cat > .githooks/pre-commit <<'HOOK'
#!/usr/bin/env bash
#
# Blocks two things a data-dump repo tends to swallow by accident:
# oversized files, and anything that looks like a credential.
#
# Everything below is measured against the STAGED BLOB, never the working
# tree. That distinction is the whole control: `git add secret.csv` then
# overwriting secret.csv with something harmless leaves the secret in the
# index, and a hook that stats the working tree would wave it through.
#
set -euo pipefail

MAX_MB="${MAX_MB:-__MAX_MB__}"
MAX_BYTES=$(( MAX_MB * 1024 * 1024 ))
fail=0

while IFS= read -r -d '' f; do
  # Resolve the staged blob for this path. Skip anything not in the index.
  sha=$(git ls-files -s -- "$f" | awk 'NR==1{print $2}')
  [ -n "$sha" ] || continue

  size=$(git cat-file -s "$sha" 2>/dev/null) || continue
  if [ "$size" -gt "$MAX_BYTES" ]; then
    printf 'BLOCKED  %s is %sMB staged (limit %sMB)\n' "$f" "$(( size / 1024 / 1024 ))" "$MAX_MB" >&2
    fail=1
  fi

  case "${f##*/}" in
    .env|.env.*|*.pem|*.key|id_rsa|id_dsa|credentials.json|service-account*.json|.netrc)
      printf 'BLOCKED  %s looks like a credential\n' "$f" >&2
      fail=1
      continue
      ;;
  esac

  # Content scan, also against the staged blob. Only the first 256KB — a key
  # or token lives near the top of a file, and this keeps large CSVs cheap.
  if git cat-file -p "$sha" 2>/dev/null | head -c 262144 | LC_ALL=C grep -qE \
      -e '-----BEGIN [A-Z ]*PRIVATE KEY-----' \
      -e '\bAKIA[0-9A-Z]{16}\b' \
      -e '\bgh[pousr]_[A-Za-z0-9]{20,}' \
      -e '\bsk-[A-Za-z0-9]{20,}' \
      -e '\bxox[abprs]-[A-Za-z0-9-]{10,}'; then
    printf 'BLOCKED  %s contains something shaped like a key or token\n' "$f" >&2
    fail=1
  fi
done < <(git diff --cached --name-only --diff-filter=AM -z)

if [ "$fail" -ne 0 ]; then
  cat >&2 <<'MSG'

Commit stopped. Unstage the file (git restore --staged <file>), or if you
are certain, re-run with: git commit --no-verify
MSG
  exit 1
fi
HOOK

# Bake the chosen limit into the generated hook so `MAX_MB=200 ./init-datadump.sh`
# produces a repo whose hook actually defaults to 200 — not to 50 with a limit
# that only held for the one run. (sed to a temp file: `sed -i` is not portable
# between GNU and BSD.)
sed "s/__MAX_MB__/${MAX_MB}/" .githooks/pre-commit > .githooks/pre-commit.tmp
mv .githooks/pre-commit.tmp .githooks/pre-commit
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks

# ----------------------------------------------------------------- readme
cat > README.md <<'README'
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
README

git add -A
git -c user.name="${GIT_AUTHOR_NAME:-$(git config user.name || echo 'Data Dump')}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo 'datadump@localhost')}" \
    commit -q -m "Initialise the data dump repository"

cat <<DONE

Created $TARGET

  main branch, one commit, no remote.
  Scaffold: inbox/ datasets/ notes/ scripts/
  Pre-commit hook blocks files over ${MAX_MB}MB and anything credential-shaped.

Next:
  cd $TARGET
  cp ~/Downloads/whatever.csv inbox/
  git add -A && git commit -m "Add whatever.csv"

DONE
