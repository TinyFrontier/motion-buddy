---
name: motion-reel
description: >-
  Make a motion video rendered from code — launch or product video, showreel, animated explainer,
  motion ad, social clip, music-synced short. One canvas with window.seek(t), closed-form springs,
  headless frame capture + ffmpeg, music and SFX synthesized from the same timeline, a critique loop
  on contact sheets, 16:9 / 9:16 / 1:1 from one timeline (only the formats the user picks). Use when
  the user asks for any such video, gives a product URL or a reference to animate, or types
  /motion-reel; also to continue or fix a film in videos/<slug>/. Every new film starts with an
  intake questionnaire (references/intake.md).
---

# Motion reel

The prompt is a small part of a good film; the harness is the rest: a deterministic render engine,
real assets and a reference, a plan on the beat grid, sound on the same timeline, and looking at your
own frames until they hold up. Every film lives in `videos/<slug>/`, a copy of `template/`.

`SKILL` below = this skill's directory (the one holding this file).

## 0. Continue or start
- `videos/*/docs/review_log.md` for the film the user means exists → read its `CLAUDE.md`, `docs/`,
  the last review round, and carry on from there.
- New film → steps 1–9, starting with the intake (step 1) — even when the request looks complete.
  Effort: medium for fixes and re-renders, extra-high for a new film, max for a flagship or launch piece.

## 1. Intake questionnaire (always first) — `SKILL/references/intake.md`
Follow the reference exactly. In short:
- **Round 0, silent:** read the message, files, track, URL; name the film type; collect the user's own
  words and every claim in them; find the subject's own world (the source of every option).
- **Ask only what only the user knows** (goal, audience, formats, what is true, rights, material);
  **propose the craft yourself** — 3 concrete candidates each for the idea, the hook, the shape with its
  peak, the signature element. Recommended options together form one coherent direction.
- AskUserQuestion, ≤ 4 questions per call, ≤ 4 calls in total: R1 why and for whom · R2 idea and sound ·
  R3 words, truth, limits · R4 pick a style frame + "build?". One line "Got it: …" after each round.
- **Formats are asked in R1** (16:9 / 9:16 / 1:1, multiSelect). Only the ticked formats get rendered;
  never add one the user didn't pick.
- **The look is chosen from pictures:** set up the project (step 2) early and render the hook in 3 named
  directions → `out/style_frames.png` before R4.
- Fast path: "you decide" / unattended → no questions, all recommended defaults (one format), one style
  frame, a brief card with "Assumed". A one-liner in a hurry → R1 only.
- Stop when the 12 slots are closed (answered or declared); show the 6–8 line brief card; write
  `docs/brief.md` with its `## Direction` block and `docs/style_guide.md` from the chosen frame.

## 2. Set up the project
```bash
cp -R SKILL/template videos/<slug> && cd videos/<slug> && npm install
npx playwright install chromium   # skip if Google Chrome is installed; render.mjs falls back to it
```
Needs Node 20+, ffmpeg; Python with librosa only for a supplied track. Fill `docs/brief.md`.
Trim `FORMATS` in `timeline.js` to the chosen formats, master first: every script renders the first one
unless given `--format` (`F=` for npm).
Fonts: the brand's files, else an OFL face (Google Fonts) downloaded into `fonts/` and declared in
index.html; system fonts only for private drafts.
Keys for voice/image/video APIs go in `.env`, never in prompts or files you show.

## 3. Assets (product films)
Visit the URL with Playwright: screenshots of the real UI, the real logo, colours, fonts → `assets/`,
fonts → `fonts/`. List what you found before animating. Never redraw a product's UI from imagination:
crop and animate the real screenshots; rebuild in code only the element that has to move.

## 4. Reference → style guide
See `SKILL/references/reference.md`. Output: `docs/style_guide.md` (palette, type, shot lengths,
transitions, camera, texture, how text enters and leaves) — the grammar of the reference, never its
content, logos or characters. No reference → name a style and write the guide from the subject's own
world. Pick the technique yourself (canvas, SVG paths, a hand-drawn renderer…); the user specifies the
look, not the library. A series or data-driven batch, or a team already on Remotion or HyperFrames:
build in that framework and keep this skill's reference, beat-grid, critique and delivery steps.

## 5. Beat grid and shot list
- Track supplied: `python3 scripts/beats.py assets/track.wav > beats.json`; copy `bpm` → `TL.BPM` and
  `t0` → `TL.T0`; state changes on beats, big moments on downbeats, SFX on `hits`. Set `TL.TRACK`.
- Otherwise pick a BPM for the mood (100–128 for promos) and synthesize on that grid.
- Write `docs/shotlist.md` on the grid: every shot with time, what we see, exact text, motion, sound,
  and the new thing that happens (one every 2–4 s; the hook in the first 2 s).
- For UI/product films, a state list works best: one element that never cuts, morphing from state to
  state (button → loader → card → chart …), a cursor causing each change. `SKILL/references/prompts.md`
  has this and other patterns.
- Show the shot list (timing only — the direction was agreed in the intake) and wait for the user's OK.
  If the user said to work unattended, write your choice into `docs/review_log.md` and continue.

## 5b. Voice-over (when the film needs words)
- Write the lines yourself (summaries in your own words, never long quotes from a source) into
  `docs/vo.json`: `[{ "id": "hook", "ch": 1, "text": "…" }, …]`, one line per shot.
- `.env`: `FISH_AUDIO_KEY`, `VOICE_ID` (a fish.audio voice; check its language with
  `GET https://api.fish.audio/model/<id>`), optional `FISH_MODEL` (`s2.1-pro-free` needs no API credit).
  Never print the key.
- Show the script with the shot list and wait for the OK before synthesizing (paid models cost credit).
- `node voice.mjs` synthesizes, trims, measures each line and its phrase onsets into `timeline.js`.
  Build SHOTS from the lines (each shot starts on the beat before its line; a chapter change adds a bar
  of breath) and key every picture event to a phrase onset. `mux.mjs` keeps the music `BED_DB` (−9 LU)
  under the voice and ducks it further while anyone speaks.

## 6. Build
- `timeline.js` first: shots, cues, music sections — the data both picture and sound read.
- `index.html`: one draw function per shot (local and absolute time), `LAYERS` for anything that spans
  shots, layout from `W`/`H`, springs, `track()`, `swapAlpha()` from `lib/motion.js`. Follow `CLAUDE.md`.
- Look often: `node render.mjs --at 1.2,4,7.5` writes stills in about a second.
- Films over ~60 s: one file per chapter (`chapters/chN.js`, each registering `SHOT[id] = (t, T) => …`,
  loaded by index.html), a shared helper file (`ui.js`: palette, type, the recurring instruments), and
  `docs/ANIMATION_GUIDE.md` (canvas zones, type sizes, motion vocabulary, phrase sync, the facts each shot
  may show, how to self-check). Build the recurring element, the chapter transitions and one exemplar shot
  yourself; then subagents build one chapter file each in parallel from the guide (they touch nothing
  else); you integrate and run the critique loop over the whole film.

## 7. Critique loop (the part that makes it good)
Follow "Before showing anyone" in `CLAUDE.md`: `node critique.mjs contact` + `phone` (stamped frames,
one per beat), look properly, score, log the 3 worst problems with their times, fix, repeat — at least
3 rounds, until every score is 8+.
The critique brief is in `SKILL/references/critique.md`. Be a harsh motion director, not a proud author.
Motion needs a draft video: `npm run draft`, then `node critique.mjs strip <t>` around fast moves.

## 8. Sound and render
- `sound.mjs`: music bed from `TL.MUSIC`, SFX from `TL.CUES` (every time from timeline.js).
- Final: `npm run final` (render 60 fps × 4 subframes → sound → mux to −14 LUFS). Voice files: `TL.VOICE`.
- `npm run final` renders the master only. Another format only if the user picked it in the intake:
  `F=9x16 npm run final` (recomposed by the layout, never cropped), then `node critique.mjs contact --format 9x16`.
  Never render a format nobody asked for.
- `node critique.mjs det` once: two renders of the film must be identical.
- You can't listen: `node critique.mjs wave` puts the waveform under bar lines and a tick per cue.

## 9. Deliver
Send `out/final-<fmt>.mp4` per chosen format, `out/contact-<fmt>.png`, `out/poster-<fmt>.png`
(`critique.mjs poster <t>`), the last scores, and one line on what you would improve next. Loops also
get `out/loop_check-<fmt>.mp4` and `out/seam-<fmt>.png`. Update the film's README.md (what it is, how to
render each format) so the source can be handed over. Feedback → back to the step it belongs to;
check a span with `node render.mjs --from a --to b` (writes `out/part-…`), then re-render the film.

## Hard rules
- Real content only: copy, numbers, product UI come from the user or the assets. No invented claims.
- No Math.random, timers, CSS animation or carried state in the film.
- Refused: corner labels and frames, a centred title on a gradient, everything fading in alike.
- Never redraw a real person, a brand mascot or a well-known character; make an original one.
