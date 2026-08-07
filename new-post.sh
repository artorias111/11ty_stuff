#!/bin/bash
# Usage: ./new-post.sh <section> "My post title"
#   e.g. ./new-post.sh posts   "Calling telomere variants"
#        ./new-post.sh food    "Malai broccoli, again"
#
# Sections: posts, food, travel, reading
# (tech-stack and lab-space are living pages — edit them in place and bump
#  their `updated:` date instead of adding an entry.)

set -e

case "$1" in
  posts)             DIR="posts" ;;
  food|travel|reading) DIR="notes/$1" ;;
  "")   echo "Usage: ./new-post.sh <posts|food|travel|reading> \"Post Title\""; exit 1 ;;
  *)    echo "Unknown section: $1"; echo "Use one of: posts, food, travel, reading"; exit 1 ;;
esac

TITLE="$2"
if [ -z "$TITLE" ]; then
  echo "Usage: ./new-post.sh $1 \"Post Title\""
  exit 1
fi

SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILE="${DIR}/${SLUG}.md"

if [ -f "$FILE" ]; then
  echo "File already exists: $FILE"
  exit 1
fi

cat > "$FILE" <<EOF
---
date: $(date +%F)
title: $TITLE
---

# $TITLE

<!-- To add an image: ./add-image.sh path/to/photo.jpg -->

EOF

echo "Created $FILE"
${EDITOR:-nano} "$FILE"
