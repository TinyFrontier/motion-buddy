# /compact — example film

The pilot's brief and storyboard (docs/brief.md, docs/shotlist.md) rebuilt on the motion-reel
harness: one canvas, `window.seek(t)`, closed-form springs, the character on twos, sound synthesized
from `timeline.js`, four critique rounds (docs/review_log.md). The character, Buf, is original.
A single-format example: the layout is fixed to 1920×1080 with a 30 px unit (the template's
`index.html` shows the layout-from-canvas pattern that multi-format films use).

```bash
npm install
npm run final                              # out/silent-16x9.mp4 → out/audio.wav → out/final-16x9.mp4
node critique.mjs contact && node critique.mjs phone   # out/contact-16x9.png, out/phone-16x9.png
node render.mjs --at 5,19.5 --outdir out/stills
```

Fonts are not in the repo: put JetBrains Mono (OFL) into `fonts/` as `jbm-400.ttf` and `jbm-700.ttf`.
