#!/bin/bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo 'Usage: ./add-image.sh path/to/photo.jpg [width%]' >&2
  exit 1
fi

SRC="$1"
WIDTH="${2:-50%}"
if [ ! -f "$SRC" ]; then
  echo "File not found: $SRC" >&2
  exit 1
fi

FILENAME=$(basename "$SRC")
DEST="images/$FILENAME"
if [ -e "$DEST" ]; then
  echo "Using existing $DEST"
else
  cp "$SRC" "$DEST"
fi

printf '<img src="/images/%s" alt="" width="%s">\n' "$FILENAME" "$WIDTH"
echo 'Optional: class="sharp" for plots, class="torn" for photos. See README for captions.'
