#!/usr/bin/env bash
set -euo pipefail
mkdir -p assets/js
curl -L https://cdn.jsdelivr.net/npm/soundfont-player@0.15.7/dist/soundfont-player.js \
  -o assets/js/soundfont-player.min.js
echo "Saved to assets/js/soundfont-player.min.js"
