#!/bin/bash

set -e
cd "$(dirname "$0")"

NAME="$1"
if [ -z "$NAME" ]; then
  N=1
  while [ -e "images/$(date +%Y-%m-%d)-$N.png" ]; do N=$((N + 1)); done
  NAME="$(date +%Y-%m-%d)-$N"
fi

NAME="${NAME%.png}"
NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]._-')
DEST="images/${NAME}.png"

if [ -e "$DEST" ]; then
  echo "Refusing to overwrite $DEST — pick another name."
  exit 1
fi

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

echo "Saved $DEST. Ready to paste:"
printf '%s\n' "$SNIPPET"
echo 'See README for captions and sharp/torn image styles.'
