#!/bin/bash
# Usage: ./paste-image.sh [name]
#
# Takes the image currently on your clipboard (screenshot, a copied figure,
# an image copied from a browser), saves it into images/, and leaves the
# markdown snippet on your clipboard so you can paste straight into Zed.
#
#   1. Cmd+Ctrl+Shift+4 to screenshot to the clipboard (the Ctrl is what
#      sends it to the clipboard instead of to a file), or copy an image
#      from anywhere
#   2. ./paste-image.sh telomere-length
#   3. Cmd+V in your post
#
# With no name it uses the date plus a counter.

set -e
cd "$(dirname "$0")"

NAME="$1"
if [ -z "$NAME" ]; then
  N=1
  while [ -e "images/$(date +%Y-%m-%d)-$N.png" ]; do N=$((N + 1)); done
  NAME="$(date +%Y-%m-%d)-$N"
fi

# Strip a trailing .png if one was given, then slugify.
NAME="${NAME%.png}"
NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]._-')
DEST="images/${NAME}.png"

if [ -e "$DEST" ]; then
  echo "Refusing to overwrite $DEST — pick another name."
  exit 1
fi

# The clipboard holds many flavours of an image; «class PNGf» is the PNG one.
# This fails loudly if the clipboard has no image at all.
if ! osascript -e 'the clipboard as «class PNGf»' >/dev/null 2>&1; then
  echo "No image on the clipboard."
  echo "Copy one first — Cmd+Ctrl+Shift+4 screenshots straight to the clipboard."
  exit 1
fi

ABS="$(pwd)/$DEST"
osascript >/dev/null <<AS
set imgData to (the clipboard as «class PNGf»)
set fh to open for access (POSIX file "$ABS") with write permission
set eof fh to 0
write imgData to fh
close access fh
AS

SNIPPET="![](/${DEST})"
printf '%s' "$SNIPPET" | pbcopy

echo "Saved $DEST"
echo ""
echo "On your clipboard, ready to paste:"
echo "  $SNIPPET"
echo ""
echo "It'll get hand-cut corners automatically. If you need something else,"
echo "write the tag out instead:"
echo "  <img class=\"sharp\" src=\"/$DEST\" alt=\"\">   square edges, for plots"
echo "  <img class=\"torn\"  src=\"/$DEST\" alt=\"\">   torn-paper edge, for photos"
