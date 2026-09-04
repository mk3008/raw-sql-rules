#!/usr/bin/env sh
set -eu

REPOSITORY="mk3008/raw-sql-rules"
REF="${RAW_SQL_RULES_REF:-main}"
RULES_PATH="${RAW_SQL_RULES_PATH:-rules/raw-sql-rules.md}"
AGENTS_FILE="${AGENTS_FILE:-AGENTS.md}"
START='<!-- raw-sql-rules:start -->'
END='<!-- raw-sql-rules:end -->'

require() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'raw-sql-rules: required command not found: %s\n' "$1" >&2
    exit 1
  }
}

require gh
require awk
require grep
require mktemp

rules_dir=$(dirname "$RULES_PATH")
mkdir -p "$rules_dir"

tmp_rules=$(mktemp)
tmp_block=$(mktemp)
tmp_agents=$(mktemp)
trap 'rm -f "$tmp_rules" "$tmp_block" "$tmp_agents"' EXIT HUP INT TERM

gh api \
  "repos/$REPOSITORY/contents/raw-sql-rules.md?ref=$REF" \
  -H 'Accept: application/vnd.github.raw+json' \
  > "$tmp_rules"

mv "$tmp_rules" "$RULES_PATH"

cat > "$tmp_block" <<EOF
$START
## Raw SQL

For Raw SQL data-access work, read \`$RULES_PATH\` and follow it
as the repository contract.
$END
EOF

has_start=0
has_end=0
if [ -f "$AGENTS_FILE" ]; then
  grep -Fq "$START" "$AGENTS_FILE" && has_start=1
  grep -Fq "$END" "$AGENTS_FILE" && has_end=1
fi

if [ "$has_start" -ne "$has_end" ]; then
  printf 'raw-sql-rules: %s contains an incomplete managed block; not modifying it.\n' "$AGENTS_FILE" >&2
  exit 1
fi

if [ ! -f "$AGENTS_FILE" ]; then
  cat "$tmp_block" > "$AGENTS_FILE"
elif [ "$has_start" -eq 1 ]; then
  awk -v start="$START" -v end="$END" -v block="$tmp_block" '
    $0 == start {
      while ((getline line < block) > 0) print line
      close(block)
      skip = 1
      next
    }
    skip && $0 == end {
      skip = 0
      next
    }
    !skip { print }
  ' "$AGENTS_FILE" > "$tmp_agents"
  mv "$tmp_agents" "$AGENTS_FILE"
else
  if [ -s "$AGENTS_FILE" ]; then
    printf '\n' >> "$AGENTS_FILE"
  fi
  cat "$tmp_block" >> "$AGENTS_FILE"
fi

printf 'Installed %s from %s@%s\n' "$RULES_PATH" "$REPOSITORY" "$REF"
printf 'Updated %s\n' "$AGENTS_FILE"
