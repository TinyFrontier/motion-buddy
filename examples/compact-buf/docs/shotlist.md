# STORYBOARD — Clawd: /compact

Tempo: 120 BPM · beat 0.5 s · bar 2 s · total 40 s = 20 bars · master 16:9 · key frames: `critic/storyboard/contact-sheet.jpg`
Text on screen: ~210 characters / budget 360
Cuts: continuity — a scene's end state = the next scene's start state, cut on the bar.

| id | start s (bar) | length s (bars) | text (exact) | chars | read time needed, s | held, s | layout / action | motion roles | SFX | energy |
|---|---|---|---|---|---|---|---|---|---|---|
| s01 boot | 0 (1) | 4 (2) | `> fix the login bug` | 19 | 1.77 | 2.0 | empty well, Clawd falls and lands, the prompt types out | move steps · enter per character | landing thud, key clicks, blink | 2 |
| s02 first-bites | 4 (3) | 6 (3) | chips `src/auth.ts`, `login.tsx`, `auth.test.ts` | 11 / 9 / 12 | 1.23 / 1.1 / 1.3 | 1.3 each on the head | 3 chips, one per bar: fall, rest on the head, get swallowed; body +1 row; meter 0→24% | enter power2.in · growth set | falling whistle, "gulp" ×3 | 2 |
| s03 whole-repo | 10 (6) | 6 (3) | `> read the whole repo`; `node_modules/` | 21 / 13 | 1.9 / 1.37 | 4.9 / 1.6 | a rain of chips (texture), a heavy `node_modules/` with a dull thud; body 12×12 → 18×20; 24→72% | enter power2.in · growth set · emphasis back.out (digits) | rapid ticks, heavy thud | 4 |
| s04 full-log | 16 (9) | 6 (3) | `> paste the full log`; `full log (12k lines)`; `error.log`, `diff --git` | 20 / 20 / 9 / 10 | 1.83 / 1.83 / 1.1 / 1.17 | 5.1 / 1.9 / 1.5 / 1.6 | a giant log chip → the last straw: 18×22, 98% in yellow; two chips get stuck in the neck; eyes up, swaying | enter power2.in · move steps (sway 1U) | heavy drop, crackle, 98% alarm on the beats | 5 |
| s05 pause | 22 (12) | 4 (2) | `> /compact` | 10 | 1.17 | 2.1 | the music fades; the prompt clears, `/compact` types out slowly, Enter on bar 13; Clawd freezes | enter per character | silence, key clicks, Enter "clack" | 1 |
| s06 line-clear | 26 (14) | 6 (3) | `summary.md` | 10 | 1.17 | 1.5 | **signature**: the stuck chips drop through and fade, then 8 rows flash one per beat and vanish, the body shrinks to 12×8, 98→12%; `summary.md` pops out of the head | set flashes per beat · growth down set · emphasis back.out | a rising arpeggio per row, a "whomp" at the end, a "pop" | 5 |
| s07 relief | 32 (17) | 4 (2) | `> back to the login bug` | 23 | 2.03 | 2.8 | the prompt types out; two happy hops on the beats with `summary.md` on the head | move steps · enter per character | "boing" hops, a short jingle | 3 |
| s08 sign-off | 36 (19) | 4 (2) | `claude code█` | 11 | 1.23 | 2.4 | the well, the meter and the prompt leave; Clawd steps up to the centre; the caption types out, the cursor blinks | exit power2.in · move steps · enter per character | clicks, final chord | 2 |

Checks: every "needed ≤ held" ✓; neighbouring scenes differ in action; the breath is s05 (22–26 s), hold pauses in every scene.
Decor (not for reading, `data-layout-ignore` / `data-mb-ignore`): labels inside Clawd's body, the "rain" chips in s03.

## Clawd states (carried across scenes, for continuity)

Growth: rows → body (w×h, U): 0–1 → 12×8 · 2 → 12×10 · 3 → 12×12 · 4 → 14×14 · 5 → 16×16 · 6 → 16×18 · 7 → 18×20 · 8 → 18×22. Feet always on the well floor, centred in the well.

| boundary | rows | body | meter | prompt | other |
|---|---|---|---|---|---|
| start s01 | 0 | — (Clawd above the frame) | 0% | `> █` | |
| s01 → s02 | 0 | 12×8 | 0% | `fix the login bug` | |
| s02 → s03 | 3 | 12×12 | 24% | `fix the login bug` | |
| s03 → s04 | 7 | 18×20 | 72% | `read the whole repo` | |
| s04 → s05 | 8 | 18×22, looking up | 98% ⚠ | `paste the full log` | `error.log`, `diff --git` in the neck |
| s05 → s06 | 8 | 18×22 | 98% ⚠ | `/compact` | same |
| s06 → s07 | 0 | 12×8 | 12% | `/compact` | `summary.md` on the head |
| s07 → s08 | 0 | 12×8 | 12% | `back to the login bug` | `summary.md` on the head |
| end s08 | 0 | 12×8 at the canvas centre | — | — | caption `claude code█` |
