#!/usr/bin/env bash
set -euo pipefail
MAN="manifest.json"
if ! command -v jq >/dev/null; then echo "jq is required"; exit 1; fi
if ! command -v curl >/dev/null; then echo "curl is required"; exit 1; fi
SF=$(jq -r '.soundfont' "$MAN"); PREFIX=$(jq -r '.cdn_prefix' "$MAN"); mkdir -p "soundfonts/$SF"
jq -r '.files[]' "$MAN" | while read -r f; do
  url="${PREFIX}/${SF}/${f}"; echo "Downloading $url"; curl -L "$url" -o "soundfonts/$SF/$f"
done
echo "Done. Files saved to soundfonts/$SF"
