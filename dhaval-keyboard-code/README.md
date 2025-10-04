
# EvanFlow – Local-Only Keyboard (Offline)

This build uses **only local files** (no CDN at runtime).

## 1) Fetch everything locally

From the project root:

- Library (one-time):
```bash
./scripts/fetch_soundfont_library.sh
# or
python3 scripts/fetch_soundfont_library.py
```

- Instrument samples (all instruments you requested):
```bash
./scripts/fetch_soundfonts.sh
# or
python3 scripts/fetch_soundfonts.py
```

This will create:
```
assets/js/soundfont-player.min.js
soundfonts/MusyngKite/*.js
```

## 2) Run
Open `index.html` in a modern browser (or serve statically for best results).

## 3) Integrate as a subpage
Copy `assets/` and `soundfonts/` to your site, then include:
```html
<link rel="stylesheet" href="/assets/css/evf-keys.css">
<script src="/assets/js/soundfont-player.min.js"></script>
<script src="/assets/js/evf-keys.js" defer></script>
```
Drop the contents of `keyboard.html` into your page template where you want the keyboard.

## Notes
- Recording outputs a WebM file (`evanflow-jam.webm`).
- Djembe, Cajón, and Tabla are mapped to nearest GM percussion.
- If you have a strict CSP, this build avoids CDNs at runtime.
