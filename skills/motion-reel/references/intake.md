# Intake — the questionnaire before building

Replaces the old step 1 "Inputs". Goal: by the time code starts, the film has a goal, a viewer, one idea, a hook,
a shape with a peak, a signature element, sound with rights, exact words, a truth list, the formats to render and
a look chosen from a frame.

## Principles
- **Ask only what only the user knows:** goal, viewer, formats, truth, rights, material.
  **Propose the craft yourself:** hook, shape, signature, look — 3 candidates each.
- **The look is picked from frames, not words.** On ELPLAY the hook and the look were picked blind: the hook
  reached 8 only in the 4th critique round, and the second drop was the calmest picture until the 3rd. In the
  voice explainer the hook stayed at 7 every round.
- **All "(recommended)" options together make one coherent direction.** The other options differ in how they
  work (safe / bold / strange), not in shade. Every option is a picture or a phrase: what is on screen, what
  sounds, which word. "Modern", "dynamic", "minimalism", "stylish" are banned.
- **Don't ask a question if every answer gives the same shot list.** BPM, easing, springs, hex, fonts,
  transitions, SFX, technique are never asked: they show on the frames or we decide them.
- **Render only the formats the user picked.** Every extra format is a full render and its own critique pass;
  never add one nobody asked for.

## The AskUserQuestion call
- ≤4 questions, 2–4 options each; the tool adds "Other" itself. `header` ≤12 characters; `label` 1–5 words,
  the first with " (recommended)"; `description` — one line: what we will see or hear, and why.
- Name the subject in the question and in the options. `multiSelect` only for Formats, Facts, Refusals, Material.
- **At most 4 calls for the whole intake** (usually 3 rounds + confirmation). After each round, one line
  "Got it: 9:16 only, 30 s, idea 'never ends', ending — the name." Misunderstandings get caught before code.

## Round 0 — silent, no questions
1. Read the message, files, track, references; name the type (see "Branching by type"). Don't ask what is known.
2. A URL → step 3 right away (Playwright: screenshots, logo, colours, fonts); the brand becomes a confirmation.
   A track → `scripts/beats.py` right away; the shape options are built from its sections.
3. Write down the user's vocabulary (every option is built from it) and the claim words (endless, never,
   first, AI, free, best, numbers) — the Facts are built from them.
4. Find the subject's world, the source of candidates. ELPLAY: oscilloscope, modular synth, rave flyer, 303.
5. **The material the film stands on must be in hand.** A launch without screenshots, an explainer without a
   read source, a food or venue ad without photos → the options don't refer to that material ("from your
   screenshot", "from the article" are banned). A source named but not found → one line "couldn't find
   <path>, send it" and wait until Round 1. A launch without UI: no style frames with a placeholder; Round 4
   waits for the screenshots.

## Fast path
- "you decide", "your call", "just do it", unattended work → no questions. Take every recommended option
  (formats: the recommended one only), render 1 style frame, show the card (see "Stop and confirm") with an
  "Assumed" line listing everything taken by default, and build. Write the decisions in `docs/review_log.md`.
- A one-line idea and "quick", user at hand → Round 1 only, the rest by default into the card.
- "Surprise me, but let me choose" → Round 1 + one `Direction` question: 3 whole readings (idea · hook · shape
  · look, 2 lines each) + a sheet of 3 style frames. An install test (a genre line) → ask nothing.
- **No invented facts on the fast path either:** no text supplied → only the name and the user's words on screen.

## Round 1 — "Why and for whom" (always first)
Each question: text template → how to build the options → **Fields** in `brief.md` → **Skip**.

**R1.1 `Goal`** — "What will the viewer do or remember after the last frame of <subject>?"
- 3 goals for the guessed type, each naming the final frame ("ELPLAY + address, 2.5 s"). Recommend a CTA only
  with an address or date the user named or we checked (the site opened), otherwise "remember the name".
  Launch: availability decides the ending, so it goes into the Goal options ("go in — it's open" / "sign up,
  opening <date>" / "remember the name"), not into `Facts`. A local place (café, salon): the recommended ending
  is the name + an address or landmark ("I'll type the address in Other"); without an address nobody comes.
  Type unclear → the options span types (promo / launch / explainer / ad), and this question decides it.
- **Fields:** `Direction · Goal · CTA`, the second half of `The film in one line`, the last line of `Beat sheet`.
  **Skip:** action and address named; showreel (ending = name + contact).

**R1.2 `Viewer`** — "Who watches <subject> and what do they already know?"
- 3 real segments of this subject; the description gives the consequence for the vocabulary ("plain words, no
  KICK/ACID"). Recommend the widest segment that can fulfil the Goal. Explainer: + level.
- **Fields:** `Direction · Audience`, the vocabulary of `Text on screen`. **Skip:** an announcement for insiders;
  a clip (slot → Sound).

**R1.3 `Formats`** (multiSelect) — "Which formats of <subject> do we render? Only the ticked ones get made."
- One option per format, platform and length in the label ("9:16 · Reels · 30 s"), the same length in each;
  another length goes in Other. Recommend one format for the type: promo and ads → 9:16, 15–30 s, the hook
  works without sound; explainer → X/YouTube 16:9, 60–90 s; landing page → 16:9, a silent loop. The master is
  the recommended format if ticked, else the first ticked; every other ticked format is recomposed from the
  same timeline, **never cropped**. Length = whole bars (128 BPM: 30 s = 16 bars). Voice film: the length is
  a **ceiling** (a voice explainer asked for 1.5–2 min; the speech ran 2:20).
- **Fields:** `Duration · formats` (master first), `Direction · Platform`, `TL.FORMATS` (only these, master
  first). **Skip:** formats and length named (a platform names its format: Reels → 9:16).

**R1.4 `Idea`** (generative) — "What one idea about <subject> will the viewer take away?"
- 3 phrases ≤7 words **only from the user's words**, angles: what it is / how it differs / what it gives.
  Recommend the one that draws without words and put it first. The user's own wording is among the options,
  marked "your wording"; recommend it only if it draws itself. A category description ("a task tracker for
  small teams") is a caption, not an idea. An option's description draws only its own idea, not a
  neighbour's image. Explainer: at least one angle is "what the viewer will be able to do" — from the source.
  A claim stronger than the original words → mark it "(is this true?)" and put it in R3.2.
- **Fields:** `Direction · One idea`, `The film in one line`. **Skip:** never (showreel: "what to remember about
  the author"; a clip without promo — skip).

## Round 2 — "Idea and sound" (candidates are built from the chosen idea)

**R2.1 `Hook`** (generative) — "The first 2 seconds: what is seen and heard?"
- 3 hooks as "frame · sound · word at 0:00": safe (the main object in frame 1), contrast (the problem),
  strange (a visual paradox). The first frame is never empty: no logo intro, no fade-in. Recommend the one
  that reads without sound and leads straight to the Idea.
- **Fields:** `Direction · Hook`, 0:00–0:02 in `Beat sheet`. **Skip:** never (explainer: the first line is a
  question, 3 exact options ≤12 words).

**R2.2 `Shape`** (generative) — "How are the <N> s built and where is the peak?"
- 3 skeletons of this type (`prompts.md`) with timecodes or bars. **Each names the second the picture peaks,
  and it matches the peak of the sound.** Recommend the shape whose peak lands on the name or the Idea. **The
  peak doesn't repeat the hook:** the hook asks a question or makes a promise, the peak shows what the hook
  didn't (the answer, a transformation, the name) — in fixed shapes (launch, ad) too, where the card names the
  peak second.
- **Fields:** `Beat sheet`, `Direction · Shape · peak`. **Skip:** launch, announcement, ad (the shape is fixed);
  showreel (strongest first); a supplied track → "Where does the picture peak?" from its sections.

**R2.3 `Signature`** (generative) — "Which one device runs through the whole film and never cuts?"
- 3 artefacts from the subject's world, each transforming at the end ("the oscilloscope line never breaks and
  becomes ∞"). "None, scenes on cuts" only for pieces ≤15 s. Recommend the device that ties the hook, the idea
  and the logo together.
- **Fields:** `Direction · Signature`, "the element that never cuts" in `style_guide.md`, `LAYERS`.
  **Skip:** set by the brand book; a launch with UI (signature = morphing container + cursor, slot → `Material`).

**R2.4 `Sound`** — "What drives the film and where does the sound come from?"
- Pairings: synthesized in code (genre + BPM), no voice / the product's real sound / your own track
  (`assets/track.wav`, rights with the user) / a voice over a synthesized bed. First: the product's real sound
  if it has one; otherwise music for promos ≤30 s, voice for explainers. The choice changes the architecture:
  music → cuts on bars; voice → timing on phrase onsets (step 5b) and a `Voice` question in Round 3. Voice +
  a platform that autoplays muted (X, LinkedIn, feeds, Reels) → burned-in subtitles by default: into the card,
  not as an option in `Words`.
- **Fields:** `Music · mood`, `Voice`, `TL.BPM` / `TL.TRACK`. **Skip:** track attached.

## Round 3 — "Words, truth, limits"

**R3.1 `Words`** — "Which words will be on screen?"
- The user's words verbatim, one per bar (list them in the description) / the same words in another language
  (check the font covers its script: Anton has no Cyrillic, Oswald does) / only the name at the end / "I'll
  write 2 versions — you approve one verbatim".
- **Fields:** `Must appear`, `Text on screen`, language. **Skip:** exact text given.

**R3.2 `Facts`** (multiSelect) — "Which of these about <subject> are true? Anything unticked stays out of the film."
- 2–4 claims stronger than the user's words, and conditions that change the frame (date inclusive, "to go",
  any size). The user's own words are not options: they are true by default and go straight into
  `Must appear`. No "(recommended)" in Facts: only the user knows the truth. Last option — "I have a number with
  a source — I'll type it".
- **Fields:** `Must appear` (ticked, verbatim), `Must not appear` (the rest). **Skip:** showreel, clip, no
  claims; explainer (the fact list from the source goes whole into the card, slot → `Voice`).

**R3.3 `Look`** — "What do we build the look from?"
- "No brand — show me 3 frames (recommended)" / "brand kit: logo, colours, fonts — I'll put them in `assets/`" /
  "reference: a video, a frame, a folder — we take its grammar, not its content" / launch: "the brand 1:1 or the
  brand + one bold detail". A reference of your own is the best cure for look-alike films.
- **Fields:** `Brand`, `Reference`. **Skip:** brand taken from the URL and a reference given → 1 frame to confirm.

**R3.4 `Refusals`** — **not asked** by default: 3–4 genre clichés go straight into the card's "Won't have",
corrected via "Adjust". Ask (multiSelect, "What is definitely out?") only if an option changes the shot list
(voice, people, the product's real sound, someone else's logo). Give the freed slot to the main gap from Round 0.
- 3–4 clichés **of this genre**, the main one first. Music: equalizer bars and neon, headphones and vinyl,
  DJ hands. SaaS: floating 3D dashboards, a purple gradient. Plus "voice" or "people" if that is a choice.
- **Fields:** `Must not appear`, `Refused` in `style_guide.md`.

**Swaps by branch:**
- `Voice` — "Whose voice?": a stock fish.audio voice with commercial rights, language = the words' language
  (recommended) / your own recording / a clone of your own voice with written consent. Never someone else's or
  a famous one. We write the script ourselves and approve it with the shot list (step 5b).
- `Material` (multiSelect) — "What real material is there?": web screenshots / mobile screenshots / a screen
  recording / a brand kit (SVG logo, colours, fonts — one item). A brand-kit answer closes the brand: R3.3
  `Look` doesn't ask it again, only a reference or 3 frames. The URL didn't load → in R1.3 each format's label
  names the product's platform ("16:9 · web · X" / "9:16 · mobile · Reels"); don't guess the master.
  What isn't there isn't in the film: no drawn UI.
- `Actions` (launch) — "Which 3 actions in <product> will the viewer see under the cursor?": 3 verb triples from
  the category's world, each marked "(is this in <product>?)", the user's own in Other. The choice = the list
  of screens we ask for in `Material`. "Assumed: actions — the ones on the screenshots" is banned.

## Style frames (after Round 3, if the look is still open)
1. Copy the template (step 2 early; the hook code gets reused later). Draw the hook frame in the master format
   with the real words in 3 **named** directions: from the category's world, from the subject's physical
   world, a contrasting one. Each has a name, a source, 2–3 hex, a font pair, one refusal. Recommend the
   subject's world.
2. `?style=a|b|c` (or 3 versions of the hook function) → `node render.mjs --at <hook t>` for each → ffmpeg
   `hstack` (9:16) / `vstack` (16:9) captioned A/B/C → `out/style_frames.png`. Show the file, then Round 4.
   About 5–10 minutes.
- Skip: brand and reference fix the look → 1 frame to confirm. Fast path → 1 frame, no question.

## Stop and confirm
**The brief is ready when the 12 slots are closed** (answered or declared as an assumption): goal/CTA · viewer ·
formats/master/length · idea · hook · shape with its peak second · signature · sound/voice with rights · words
verbatim and language · truth list · look (the chosen frame) · refusals.
Check: can I write the first and the last shot with exact text and name the peak second? Yes → enough.
No build without goal, formats, idea and truth list (fast path: assumptions declared). Slots still empty after
Round 3 get a default and go into "Assumed". There is no fifth call.

**The card before Round 4** (6–8 lines + a line "Waiting for: <what, for which shot>" if material hasn't
arrived; then `style_frames.png`). Example for ELPLAY:
```
ELPLAY — 30 s, 9:16 only, Reels; goal: remember the name (no address yet)
Idea:      music that never ends · viewer: background listeners, no jargon
Hook:      a flat line, a kick in silence, the line jumps; the word ENDLESS from the first frame
Shape:     layers 0–8 · drop 8–15 · line → ∞ 15–22 · drop 2 = picture and sound peak 22–26 · name 26–30
Signature: the oscilloscope line never breaks and becomes ∞
Sound:     synthesized acid house, 128 BPM, no voice; never passed off as ELPLAY's own sound
Words:     ENDLESS · ELECTRONIC MUSIC · SYNTHESIZED ON THE FLY · ELPLAY (EN, your words verbatim)
Won't have: equalizer bars, neon, invented UI, numbers · Assumed: A minor, no URL in the ending
```

**Round 4** (one call): `Style` — A/B/C by name, the recommended one first (if the look is open) +
`Start` — "Build (recommended)" / "Adjust the idea" / "Adjust the words" / "Adjust the formats".
An adjustment → apply it and show the card again as text, no new rounds. Then write `docs/brief.md`
(every field + the block below) and `docs/style_guide.md` from the chosen frame, and trim `TL.FORMATS` to the
chosen formats, master first → steps 3–5. The shot list in step 5 is approved as before (it carries the
timing), but briefly.

```
## Direction
- Goal · CTA:
- Audience · platform:        (sound on/off, safe zones, loop)
- One idea:
- Hook 0:00–0:02:             (frame · sound · word)
- Shape · peak:               (the second the picture peaks = the sound peaks)
- Signature (never cuts):
- Assumed without asking:
```

## Branching by type
| Type | What changes in the questionnaire | Defaults |
|---|---|---|
| Product launch | URL required (Round 0). Signature → `Material`; the free 4th slot of Round 2 → `Actions`. Facts required: one number with a source, or "no number" — then the proof shot is cut. Shape not asked: hook (R2.1) → the UI assembles → 3 actions from `Actions` by cursor → proof → logo + CTA (or a state list) | 9:16, 30–45 s, 110–124 BPM, real screenshots |
| Explainer | Idea → "what the viewer will understand or be able to do". Hook → the first line, a question. Signature → an instrument (a dial, a scale). Sound: voice by default. Facts → the source's list, whole. Length = a ceiling; word budget EN ≈2.3/s, RU ≈2/s | 16:9, 60–90 s, bed 90–110 BPM; >60 s — chapters + ANIMATION_GUIDE |
| Brand / hype promo | Main questions: Idea, Hook, Signature, Look. Facts usually skipped (no numbers) | 9:16, 20–30 s, music leads, 120–128 BPM |
| Showreel | Goal → whose reel and the contact verbatim. Idea → "what to remember about the author". Facts → what may be shown (NDA, others' logos). Shape → "one technique per shot" or "one world, everything flows" | 16:9, 15–60 s, strongest first |
| Social ad | Network and length named → `Formats` not asked: 9:16 with Reels + Stories safe zones into the card, slot → `Material`. A physical product or place: recommend "I'll send 3–5 phone photos or videos" — the product in frame from 0:00; food and macro textures are not drawn in code. Goal → offer and CTA verbatim (price, deadline, address — only from the user); an approved call-to-action verb or the address is on screen. Facts: conditions that change the frame, + "legal line — I'll type it verbatim" (promo terms, an ad label if the market requires one). Hook within 1 s. The text carries the meaning; with a voice — burned-in subtitles. "Best", "#1", "free" — only with proof. Fixed shape: hook → benefit (the product big) → offer → CTA. Offer 2–3 hooks from one timeline for A/B | 9:16, 15 s, loop |
| Announcement | Idea = the news verbatim: what, when, where. Hook = the news itself, not a teaser for it. Shape and Viewer not asked. The date, the URL and anything that may change become variables in `timeline.js` | 16:9, 10–20 s |
| Clip / on the beat | Sound moves into Round 1 in place of Viewer: the track + sync rights. Shape → "Where does the picture peak?" from the `beats.py` sections + sync density (every beat / strong beats / drops only). Idea and Facts only if it is a promo | length = the track excerpt |

ELPLAY is a hype promo and a beat-synced clip at once: both rows apply.

## Hard rules
- **No invented product UI, claims, numbers or slogans.** Options come only from the user's words and the found
  assets. Picking a text option = approving that text verbatim. No text → ask for it verbatim or "I'll write 2
  versions — you approve"; unapproved text never reaches the screen.
- Music: synthesized by default. Someone else's track only with the user's rights (ads: sync rights). If the
  product makes its own sound, synthesis is never passed off as it.
- Voice: stock with commercial rights, or the user's own voice with their consent; never clone someone else's
  or a famous voice; run a paid model only after the script is approved.
- Keys only in `.env` (`FISH_AUDIO_KEY`, `VOICE_ID`…): never ask for them in chat, the user types them in; if
  one arrives in chat → put it in `.env` and never repeat it. Options never include real people, others'
  mascots, famous characters, or anything this pipeline can't draw.

## Example: Round 1 for ELPLAY
Round 0: no URL, UI or logo; the user's words — endless, electronic music, synthesized on the fly.
Type: hype promo + on the beat. The subject's world: oscilloscope, 303, rave flyer.
```json
{"questions": [
 {"header": "Goal", "multiSelect": false, "question": "What will the viewer do or remember after the ELPLAY film?", "options": [
   {"label": "Remember the name (recommended)", "description": "Ending: ELPLAY and the ∞ sign, no call to action. There is no address yet, so we don't invent one."},
   {"label": "Go and listen", "description": "Ending 2.5 s: ELPLAY + an address or QR. Type the address in Other."},
   {"label": "Join the waitlist", "description": "ELPLAY + early access + a date. Type the date in Other."}]},
 {"header": "Viewer", "multiSelect": false, "question": "Who watches the ELPLAY film and what do they already know?", "options": [
   {"label": "Background listeners (recommended)", "description": "Music for work and sport: plain words like endless, no KICK or ACID. The widest audience."},
   {"label": "Electronic music fans", "description": "They know acid and the drop; some jargon is fine."},
   {"label": "Producers and DJs", "description": "We can show how the track is built: layers, 303, waves."}]},
 {"header": "Formats", "multiSelect": true, "question": "Which formats of the ELPLAY film do we render? Only the ticked ones get made.", "options": [
   {"label": "9:16 · Reels · 30 s (recommended)", "description": "30 s = 16 bars at 128 BPM. The vertical feed; the hook holds without sound."},
   {"label": "16:9 · X/YouTube · 30 s", "description": "Sound on, horizontal. As a second format: recomposed from the same timeline, rendered on its own."},
   {"label": "1:1 · feed · 30 s", "description": "Square for feeds and LinkedIn; recomposed, not cropped."}]},
 {"header": "Idea", "multiSelect": false, "question": "What one idea about ELPLAY will the viewer take away?", "options": [
   {"label": "Music that never ends (recommended)", "description": "Your word endless. It draws without words: the line never breaks and becomes ∞."},
   {"label": "A track born before your eyes", "description": "Synthesis on the fly: the layers assemble right in the frame."},
   {"label": "Music that didn't exist a second ago", "description": "A film about the moment of generation itself: every frame is one of a kind."}]}
]}
```
The summary line: "Got it: 9:16 only, Reels, 30 s, background listeners, idea 'never ends', ending — the name."
