#!/usr/bin/env bash
# Where everything stands. Run at the top of any session:
#   bash .claude/scripts/status.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
B=$'\033[1m'; D=$'\033[2m'; O=$'\033[38;5;208m'; G=$'\033[38;5;36m'; R=$'\033[0m'

echo "${B}MĪZĀN / MALIK — STATUS${R}   $(date -u '+%Y-%m-%d %H:%MZ')"
echo

echo "${B}BRANCHES${R}"
git fetch -q origin 2>/dev/null
DEF=$(git symbolic-ref -q --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|origin/||'); DEF=${DEF:-main}
git for-each-ref --format='%(refname:short)|%(committerdate:relative)|%(subject)' refs/remotes/origin \
| grep -v "origin/HEAD" | while IFS='|' read -r ref age subj; do
  br=${ref#origin/}
  if [ "$br" = "$DEF" ]; then mark="${G}●${R} default"; ab=""
  else
    a=$(git rev-list --count "origin/$DEF..$ref" 2>/dev/null || echo 0)
    b=$(git rev-list --count "$ref..origin/$DEF" 2>/dev/null || echo 0)
    mark="${O}○${R}"; ab="${D}+$a/-$b vs $DEF${R}"
  fi
  cur=""; [ "$br" = "$(git rev-parse --abbrev-ref HEAD)" ] && cur=" ${O}← you are here${R}"
  printf "  %b %-46s %s%b\n" "$mark" "$br" "$ab" "$cur"
  printf "     ${D}%s · %s${R}\n" "$age" "${subj:0:66}"
done

echo
echo "${B}UNCOMMITTED${R}"
if [ -z "$(git status --porcelain)" ]; then echo "  ${D}clean${R}"
else git status --porcelain | sed 's/^/  /'; fi

echo
echo "${B}SKILLS IN THIS REPO${R}"
if [ -d .claude/skills ]; then
  for d in .claude/skills/*/; do
    n=$(basename "$d")
    refs=$(ls "$d"references/*.md 2>/dev/null | wc -l | tr -d ' ')
    scr=$(ls "$d"scripts/* 2>/dev/null | wc -l | tr -d ' ')
    lines=$(wc -l < "$d/SKILL.md" 2>/dev/null | tr -d ' ')
    printf "  ${G}▸${R} %-16s ${D}SKILL.md %sL · %s refs · %s scripts${R}\n" "$n" "$lines" "$refs" "$scr"
  done
else echo "  ${D}none${R}"; fi

echo
echo "${B}PAGES / DEPLOYED${R}"
echo "  ${D}Pages serves origin/$DEF. A merge is a deploy.${R}"
for p in mizan/index.html mizan/coach/index.html mizan/khudi/index.html; do
  if git cat-file -e "origin/$DEF:$p" 2>/dev/null; then s="${G}live${R}"; else s="${O}not on $DEF${R}"; fi
  printf "  %-30s %b\n" "$p" "$s"
done

echo
echo "${B}CHECKS${R}"
if [ -f .claude/skills/mizan/scripts/smoke.js ]; then
  echo "  ${D}smoke: node .claude/skills/mizan/scripts/smoke.js${R}"
fi
echo "  ${D}status: bash .claude/scripts/status.sh${R}"
