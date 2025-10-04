#!/usr/bin/env python3
import urllib.request, os
url = "https://cdn.jsdelivr.net/npm/soundfont-player@0.15.7/dist/soundfont-player.js"
out = os.path.join("assets","js")
os.makedirs(out, exist_ok=True)
dest = os.path.join(out, "soundfont-player.min.js")
print("Downloading", url)
urllib.request.urlretrieve(url, dest)
print("Saved to", dest)
