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
require mktemp
require tr
require tail
require od

rules_dir=$(dirname "$RULES_PATH")
agents_dir=$(dirname "$AGENTS_FILE")
mkdir -p "$rules_dir" "$agents_dir"
rules_full=$(cd "$rules_dir" && pwd -P)/$(basename "$RULES_PATH")
agents_full=$(cd "$agents_dir" && pwd -P)/$(basename "$AGENTS_FILE")
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    rules_compare=$(printf '%s' "$rules_full" | tr '[:upper:]' '[:lower:]')
    agents_compare=$(printf '%s' "$agents_full" | tr '[:upper:]' '[:lower:]')
    ;;
  *) rules_compare=$rules_full; agents_compare=$agents_full ;;
esac
[ "$rules_compare" != "$agents_compare" ] || {
  printf 'raw-sql-rules: Rules and AGENTS paths must be different.\n' >&2
  exit 1
}

tmp_rules=$(mktemp)
tmp_block=$(mktemp)
tmp_agents=$(mktemp)
tmp_rules_backup=$(mktemp)
tmp_agents_backup=$(mktemp)
cleanup() {
  rm -f "$tmp_rules" "$tmp_block" "$tmp_agents" "$tmp_rules_backup" "$tmp_agents_backup"
}
trap cleanup EXIT

gh api \
  "repos/$REPOSITORY/contents/raw-sql-rules.md?ref=$REF" \
  -H 'Accept: application/vnd.github.raw+json' \
  > "$tmp_rules"

[ -s "$tmp_rules" ] || {
  printf 'raw-sql-rules: downloaded Rules file is empty.\n' >&2
  exit 1
}

cat > "$tmp_block" <<EOF
$START
## Raw SQL

For Raw SQL data-access work, read \`$RULES_PATH\` and follow it
as the repository contract.
$END
EOF

# Generate an AGENTS candidate while validating marker syntax. A marker is a
# complete line, with optional horizontal whitespace and an optional CR from
# CRLF input. Any inline marker text is treated as ambiguous and fails closed.
build_agents_candidate() {
  input=$1
  output=$2

  if [ ! -f "$input" ]; then
    cat "$tmp_block" > "$output"
    return
  fi

  final_newline=1
  if [ -s "$input" ]; then
    last_byte=$(tail -c 1 "$input" | od -An -tx1 | tr -d '[:space:]')
    [ "$last_byte" = "0a" ] || final_newline=0
  fi

  awk -v start="$START" -v end="$END" -v block="$tmp_block" -v final_newline="$final_newline" '
    function marker(line, wanted, clean) {
      clean = line
      sub(/\r$/, "", clean)
      sub(/[ \t]+$/, "", clean)
      return clean == wanted
    }
    function emit_block(line, eol) {
      while ((getline line < block) > 0) {
        sub(/\r$/, "", line)
        printf "%s%s", line, eol
      }
      close(block)
    }
    function emit_existing(line, line_no) {
      if (line_no == NR && !final_newline) printf "%s", line
      else printf "%s\n", line
    }
    {
      raw = $0
      if (marker(raw, start)) {
        start_count++
        start_line = NR
      } else if (marker(raw, end)) {
        end_count++
        end_line = NR
      } else if (index(raw, start) > 0 || index(raw, end) > 0) {
        invalid = 1
      }
      lines[NR] = raw
    }
    END {
      eol = ((start_count && lines[start_line] ~ /\r$/) ||
             (!start_count && NR > 0 && lines[1] ~ /\r$/)) ? "\r\n" : "\n"
      if (invalid || start_count > 1 || end_count > 1 || start_count != end_count ||
          (start_count == 1 && start_line > end_line)) exit 2
      if (start_count == 0) {
        for (i = 1; i <= NR; i++) {
          emit_existing(lines[i], i)
        }
        if (NR > 0) printf "%s", eol
        emit_block(line, eol)
        exit 0
      }
      for (i = 1; i <= NR; i++) {
        if (i == start_line) {
          emit_block(line, eol)
          skip = 1
          continue
        }
        if (skip && i == end_line) {
          skip = 0
          continue
        }
        if (!skip) {
          emit_existing(lines[i], i)
        }
      }
    }
  ' "$input" > "$output"
}

build_agents_candidate "$AGENTS_FILE" "$tmp_agents" || {
  printf 'raw-sql-rules: %s contains an incomplete, ambiguous, or duplicated managed block; not modifying it.\n' "$AGENTS_FILE" >&2
  exit 1
}

# Validate the generated candidate before either target is changed.
awk -v start="$START" -v end="$END" '
  function marker(line, wanted, clean) {
    clean = line
    sub(/\r$/, "", clean)
    sub(/[ \t]+$/, "", clean)
    return clean == wanted
  }
  {
    if (marker($0, start)) { starts++; start_line = NR }
    else if (marker($0, end)) { ends++; end_line = NR }
    else if (index($0, start) > 0 || index($0, end) > 0) { invalid = 1 }
  }
  END {
    if (invalid || starts != 1 || ends != 1 || start_line >= end_line) exit 1
  }
' "$tmp_agents" || {
  printf 'raw-sql-rules: generated managed block is invalid; not modifying targets.\n' >&2
  exit 1
}

rules_existed=0
agents_existed=0
if [ -e "$RULES_PATH" ]; then
  cp -p "$RULES_PATH" "$tmp_rules_backup"
  rules_existed=1
fi
if [ -e "$AGENTS_FILE" ]; then
  cp -p "$AGENTS_FILE" "$tmp_agents_backup"
  agents_existed=1
fi

rules_touched=0
agents_touched=0
rollback() {
  status=${1:-$?}
  if [ "$agents_touched" -eq 1 ]; then
    if [ "$agents_existed" -eq 1 ]; then cp -p "$tmp_agents_backup" "$AGENTS_FILE" || true
    else rm -f "$AGENTS_FILE" || true
    fi
  fi
  if [ "$rules_touched" -eq 1 ]; then
    if [ "$rules_existed" -eq 1 ]; then cp -p "$tmp_rules_backup" "$RULES_PATH" || true
    else rm -f "$RULES_PATH" || true
    fi
  fi
  cleanup
  trap - EXIT HUP INT TERM
  exit "$status"
}
trap rollback EXIT
trap 'rollback 1' HUP INT TERM

rules_touched=1
mv "$tmp_rules" "$RULES_PATH"
agents_touched=1
mv "$tmp_agents" "$AGENTS_FILE"

cleanup
trap - EXIT HUP INT TERM

printf 'Installed %s from %s@%s\n' "$RULES_PATH" "$REPOSITORY" "$REF"
printf 'Updated %s\n' "$AGENTS_FILE"
