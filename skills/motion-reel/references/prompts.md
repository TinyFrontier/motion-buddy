# Prompt patterns

Why short prompts sometimes work: they name a genre with known rules (a showreel, a launch film, a
title sequence), give a length short enough to finish in one pass, and leave the model room to show
technique. Their weakness: many people using the same line get films that look alike, and a line with
no idea in it never tests the idea. Use them to test the setup, then give the film a real subject.

## Genre line (setup test)
A 15-second showreel of motion-design techniques, one technique per shot, strongest first, with sound.
Variants: a longer reel with an original score cut to the music; a story instead of techniques
("the history of X in 45 s, vertical, surprise me with the storyboard"); a studio persona ("as a
branding studio for founders: every graphic from scratch, one accent colour").

## Product film
Subject + URL, duration, "use the real product: screenshots, logo, colours, fonts", "must have music".
A shape that works: hook (the problem in a few huge words) → the product UI assembles itself →
three features, each a UI moment with a cursor doing a real action → one proof number (from the user)
→ logo and call to action. Contact sheet of one frame per beat before the full render.

## State list (UI morph films)
Give the model a spec instead of a vibe:
- inputs: product, 8–12 UI states that tell its story, the real data shown in each, brand, track or BPM, formats
- direction: one container never cuts — it changes size, radius and fill from state to state while its
  content swaps behind a short blur; a cursor causes every change; springs with at most a tiny
  overshoot; refused looks listed explicitly
- structure: BPM, bars, something on every beat, the state chain in order, last state = first (loop)
- build: seek(t), no timers or carried state; one spring per target change (`track`); text inside a
  morphing container enters after the morph starts and leaves before the next; tab indicators with
  leading and trailing edges on different springs so they stretch; start on a downbeat
- gotchas: nothing the camera scales should be pre-rasterised (blurry text); for loops the last frame
  must match the first including position and velocity of moving things
- start: ask for the inputs, then show the state list on the beat grid before any code

## Long film (director's brief)
For a minute or more, write the brief as if hiring a crew: the film in one line; references and what
to keep; tools, keys and budget; a character sheet (proportions, palette, expressions, what never
changes); a beat sheet with a hook in the first 2 s and a payoff every 3–5 s; rules for text on screen;
workflow gates (plan → stills → animatic at low resolution with placeholder audio → full pass →
polish → sound → render); the critique loop; deliverables. `template/docs/brief.md` has the skeleton.
One mixed technique: render base motion with a video model, then redraw every frame in code on top,
so the viewer only sees the code layer (consistent, ownable look; needs a video-model API).
