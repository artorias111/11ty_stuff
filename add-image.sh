#!/bin/bash
# Usage: ./add-image.sh path/to/photo.jpg [width%]
# Copies the image to images/ and prints the HTML snippet to paste into your post.

if [ -z "$1" ]; then
  echo "Usage: ./add-image.sh path/to/photo.jpg [width%]"
  echo "Example: ./add-image.sh ~/Downloads/lunch.jpg 50%"
  exit 1
fi

SRC="$1"
WIDTH="${2:-50%}"

if [ ! -f "$SRC" ]; then
  echo "File not found: $SRC"
  exit 1
fi

FILENAME=$(basename "$SRC")
DEST="images/$FILENAME"

if [ -f "$DEST" ]; then
  echo "Note: images/$FILENAME already exists, skipping copy."
else
  cp "$SRC" "$DEST"
  echo "Copied to images/$FILENAME"
fi

echo ""
echo "Paste this into your post:"
echo ""
echo "<img src=\"/images/$FILENAME\" alt=\"\" width=\"$WIDTH\"/>"
