# Review log (article critique loop: contact sheet per beat + phone test, score 1–10, fix the 3 worst)

## Round 1 — out/contact-r1.png (80 frames, one per beat), out/phone-r1.png (360 px wide)
Scores: hook 4 · phone readability 3 · motion n/a (stills only) · variety 6 · composition 5 · brand 7 · sound n/a
Worst 3:
1. Phone readability — at 360 px wide the prompt (44 px) and meter (40 px) become ~8 px, chips (36 px) ~7 px. Raise: prompt 64, meter 56, chips 44, signature 96.
2. Hook — 0.0–0.5 s is an empty well; Buf lands at 1.0 s with no impact. Buf already falling at frame 0, lands on beat 0.5 with a 1-pose stage thud; typing moves to 1.0 s.
3. Dead stretch 24–26 s (after Enter only a pupil move) + antenna poking through head chips. Anticipation: antenna blinks on the beats, visor shut 25–26 s (bracing); antenna moves to the head's left corner.
Also: left half of the frame is empty — the bigger prompt and meter fill it.

## Round 2 — out/contact-r2.png, out/phone-r2.png
Scores: hook 6 · phone readability 7 · variety 7 · composition 6 · brand 7
Worst 3:
1. Falling chips cross the (now wider) prompt line — error.log lands on top of "paste the full log". Move the well right by 6 U (x 34–58 U): prompt column and well no longer share x.
2. Motion can't be judged from stills — render a draft video, cut strips around the fast actions (land, fall, swallow, clear, hop, rise).
3. No sound yet — write it before scoring sync.

## Round 3 — out/contact-r3.png (2 fps from the MP4), out/strips-r3.png, out/wave-r3.png (−14.4 LUFS, TP −2.4)
Scores: hook 7 · phone readability 7 · motion 7 · variety 7 · composition 7 · brand 7 · sound sync 7
Fixed from round 2: well moved right (no chip/prompt overlap); summary.md vanished during hops and the rise (clipped by the pop-out mask) → mask only while popping, chip never sinks into the head.
Worst 3:
1. Meter overshoot shows "100%" at 19.2 s — a number that isn't true. Clamp the displayed value to the current segment (spring moves, the number never overshoots).
2. Dead air 30.5–32 s: the groove stops after the pop. Add a quiet relief bed until s07.
3. Antenna pokes through summary.md in every s07/s08 frame. Antenna to the body's outer corner.

## Round 4 — final render: out/contact.png, out/phone.png, out/strip-final.png (17.8 s heavy landing)
Scores: hook 7 · phone readability 7 · motion 8 · variety 7 · composition 7 · brand 7 · sound sync 7
Checks: determinism — 18–21 s rendered twice, frame hashes identical; loudness −14.4 LUFS, TP −2.9 dBTP;
ffprobe h264 1920×1080 60 fps + AAC, 40.0 s.
Not yet 8+ everywhere (the article's stop rule). Open: composition (bottom-left mid-frame still empty),
variety in s02 (three identical fall-rest-gulp beats), belly labels are decor only (28 px).
Handed to the human for taste before more rounds.
