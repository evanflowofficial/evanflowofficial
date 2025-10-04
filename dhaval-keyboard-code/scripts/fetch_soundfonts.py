#!/usr/bin/env python3
import json, os, urllib.request
MAN = 'manifest.json'
with open(MAN,'r') as f: man=json.load(f)
prefix=man['cdn_prefix']; sf=man['soundfont']; files=man['files']
out=os.path.join('soundfonts', sf); os.makedirs(out, exist_ok=True)
for name in files:
    url=f"{prefix}/{sf}/{name}"; dest=os.path.join(out, name)
    print('Downloading', url)
    try: urllib.request.urlretrieve(url, dest)
    except Exception as e: print('FAILED', url, e)
print('Done. Saved to', out)
