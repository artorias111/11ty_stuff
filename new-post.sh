#!/bin/bash
# Usage: ./new-post.sh "my post title"
# Creates blog/my-post-title.md and opens it for editing.

if [ -z "$1" ]; then
  echo "Usage: ./new-post.sh \"Post Title\""
  exit 1
fi

TITLE="$1"
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILE="blog/${SLUG}.md"

if [ -f "$FILE" ]; then
  echo "File already exists: $FILE"
  exit 1
fi

cat > "$FILE" <<EOF
---
title: $TITLE
---

# $TITLE

<!-- To add an image: ./add-image.sh path/to/photo.jpg -->

EOF

echo "Created $FILE"
${EDITOR:-nano} "$FILE"
