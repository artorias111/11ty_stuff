#!/bin/bash
# Usage: ./new-post.sh [--living] "Title"
set -euo pipefail
cd "$(dirname "$0")"

LIVING=false
if [ "${1:-}" = "--living" ]; then
  LIVING=true
  shift
fi
if [ "$#" -ne 1 ] || [ -z "$1" ]; then
  echo 'Usage: ./new-post.sh [--living] "Title"' >&2
  exit 1
fi

TITLE="$1"
SLUG=$(printf '%s' "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
if [ -z "$SLUG" ]; then
  echo 'Title must contain a letter or number for the filename.' >&2
  exit 1
fi
FILE="posts/${SLUG}.md"
if [ -e "$FILE" ]; then
  echo "File already exists: $FILE" >&2
  exit 1
fi

# JSON strings are valid YAML, including titles with quotes or colons.
QUOTED_TITLE=$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' -- "$TITLE")
{
  printf '%s\n' '---' "title: $QUOTED_TITLE"
  if [ "$LIVING" = true ]; then
    printf '%s\n' 'living: true' "updated: $(date +%F)"
  else
    printf '%s\n' "date: $(date +%F)"
  fi
  printf '%s\n' 'tags: []' 'draft: true' '---' '' "# $TITLE" ''
} > "$FILE"

echo "Created $FILE"
${EDITOR:-nano} "$FILE"
