# House rules for this film

These apply to every change in this folder. The skill `/motion-reel` explains the pipeline.

## Render contract
- The film is a pure function of time: `window.seek(t)` in index.html paints frame t on one canvas.
- Never in the film: CSS transitions or animations, setTimeout/setInterval, requestAnimationFrame
  (except the live-preview loop), state carried from one frame to the next, `Math.random`, `Date.now`.
  Randomness comes from `M.rng(seed)`.
- Times live in `timeline.js`. The picture and `sound.mjs` read the same numbers; never type a time twice.
- Shots get (local time, absolute time); anything that spans shots (a character, the element that never
  cuts, a cursor, the camera) is a layer in `LAYERS`, drawn with absolute time.
- Layout comes from the canvas size (`W`, `H`, a unit `u`), so 16:9, 9:16 and 1:1 are recomposed
  from one timeline, never cropped.
- Fonts and images are local files in `fonts/` and `assets/`, loaded before `window.ready` resolves.
- Render: `npm run draft` / `npm run final` (`F=9x16 npm run final` for another format). A span:
  `node render.mjs --from a --to b` writes `out/part-…` and never replaces the full film.

## Look
- Refused defaults: a centred title on a gradient; everything fading in the same way; labels, crop
  marks or frames in the corners; glow on UI chrome; generic particle bursts or confetti.
- One display face and one UI face. One accent colour unless the brief says otherwise.
- The first 2 seconds carry the hook. Something new happens every 2–4 seconds.
- Text must read on a phone: check `out/phone-<fmt>.png` (360 px wide). Anything the viewer must read is
  at least W/30 px on the canvas (≈ 12 px on the phone): 64 px on 1920-wide, 36 px on 1080-wide.
- No copy supplied → no text, or plain words naming what happens. Never invented slogans, claims or numbers.
- Real product UI only: crop and animate screenshots from `assets/`, never redraw a product from memory.

## Motion
- Closed-form springs from `lib/motion.js` instead of easing curves. Tiny overshoot on UI, none on type.
- A value that changes target more than once uses `track()` (one spring per change), so it stays
  continuous and seekable.
- Text inside a moving container arrives after the container starts moving and leaves before it moves on
  (`M.swapAlpha`). Stretching indicators: `M.indicator`. Loops: `M.loopT`, last frame = first frame.
- Linear motion only for loops and marquees.

## Sound
- Music and SFX are synthesized in `sound.mjs` unless a track is supplied (`TL.TRACK`); with a track,
  measure it first (`python3 scripts/beats.py assets/track.wav > beats.json`), copy bpm and t0 into
  `timeline.js`, put cuts on beats and SFX on hits. Voice files go in `TL.VOICE`.
- Final loudness −14 LUFS (`node mux.mjs` does it).

## Before showing anyone
1. `node critique.mjs contact` and `node critique.mjs phone` (add `--format` for other canvases); open
   both images and look properly. Every tile is stamped with its time.
2. Score 1–10: hook in the first 2 s · readability at phone size · motion quality · variety ·
   composition · brand accuracy · sound sync (after sound exists).
3. Write the scores and the 3 worst problems (with times) in `docs/review_log.md`; fix them.
4. Repeat until every score is 8+, at least 3 rounds. After 5 rounds without getting there, show the
   human what you have and what is still weak.
5. On a draft video, cut strips around fast moves (`node critique.mjs strip <t>`) to catch pops,
   overlaps and things that slide instead of settling. After sound: `node critique.mjs wave`.
6. Once per film: `node critique.mjs det` (two renders must be identical).
