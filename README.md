# motion-buddy

Claude Code plugin for motion videos rendered from code. One skill, `/motion-reel`, and a project
template: a single canvas painted by `window.seek(t)`, closed-form springs, frame-by-frame capture in
headless Chrome piped to ffmpeg (sub-frame motion blur), music and SFX synthesized from the same
`timeline.js`, and a critique loop on contact sheets and phone-size previews. 16:9, 9:16 or 1:1 from one
timeline — only the formats you pick.

## Install
In Claude Code:
```
/plugin marketplace add TinyFrontier/motion-buddy
/plugin install motion-buddy@motion-buddy
```
or from a shell: `claude plugin marketplace add TinyFrontier/motion-buddy && claude plugin install motion-buddy@motion-buddy`.
Needs Node 20+ and ffmpeg; Google Chrome or `npx playwright install chromium`; Python + librosa only to
measure a supplied music track; a fish.audio key only for voice-over.

## Use
Ask for a video ("a 20 s launch film for <url>, vertical") or type `/motion-reel`. Every new film starts
with an intake questionnaire (`skills/motion-reel/references/intake.md`): up to four rounds of questions
where the user answers only what they alone know (goal, audience, formats, what is true, rights) and the
skill proposes the craft (idea, hook, shape with its peak, signature element), then the look is picked
from three rendered style frames. Films live in `videos/<slug>/`, each a copy of
`skills/motion-reel/template/` with its own `CLAUDE.md` house rules.

| File in a film | Role |
|---|---|
| `timeline.js` | shots, cues, music sections — read by picture and sound |
| `index.html` + `lib/motion.js` | the film: `seek(t)`, springs, `track()`, seeded noise |
| `render.mjs` | stills (`--at`) or video (`--fps 60 --sub 4`, `--format 9x16`) |
| `sound.mjs` → `mux.mjs` | synthesized score + SFX → −14 LUFS → `out/final-<fmt>.mp4` |
| `critique.mjs` | contact sheet per beat, phone view, strips, waveform, poster, loop and determinism checks |
| `voice.mjs` | voice-over from `docs/vo.json` via fish.audio, with phrase onsets for sync |

The renderer stops on canvas text that is really a bug (`undefined`, `NaN`, `[object …]`) and tells the
film its frame rate, so data-driven shapes read `M.frameT(t)` and stay crisp under motion blur.
