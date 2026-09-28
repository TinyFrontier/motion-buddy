// The film's timeline as data — read by the picture (index.html) and the sound (sound.mjs), so every
// hit lands on the event that caused it. Times in seconds; 120 BPM: beat 0.5 s, bar 2 s. U = 30 px.
// Story and timing follow docs/shotlist.md (the pilot's storyboard).
(function () {
  const BPM = 120, BEAT = 60 / BPM, DUR = 40, U = 30, TYPE_DT = 0.045;
  const FORMATS = { "16x9": [1920, 1080] }, TRACK = null;

  // Prompt line: each text is typed at `at` (dt per char) and erased at `erase`.
  const PROMPTS = [
    { text: "fix the login bug", at: 1.0, erase: 10.0 },
    { text: "read the whole repo", at: 10.25, erase: 16.0 },
    { text: "paste the full log", at: 16.25, erase: 22.0 },
    { text: "/compact", at: 22.75, dt: 0.14, enter: 24.0, erase: 32.0 },
    { text: "back to the login bug", at: 32.25, erase: 36.0 },
  ];
  const SIGN = { text: "claude code", at: 37.6, dt: 0.07 };

  // What Buf swallows, bottom row first, and its body (w × h units) for n rows (0..8).
  const ROWS = [["src/auth.ts"], ["login.tsx"], ["auth.test.ts"], ["package.json", "src/"], ["README.md", "api.ts"], ["utils.ts", "db.ts"], ["node_modules/"], ["full log (12k lines)"]];
  const BODY = [[12, 8], [12, 8], [12, 10], [12, 12], [14, 14], [16, 16], [16, 18], [18, 20], [18, 23]];

  // Chips: fall at tf, land at tl, sink into the head at ts (row added at ts + SINK).
  // pair 0/1 = left/right of a two-chip row. stuck chips wedge on the full head and drop at `drop`.
  const SINK = 0.2;
  const CHIPS = [
    { text: "src/auth.ts", tf: 4.0, tl: 4.5, ts: 5.75, row: 1 },
    { text: "login.tsx", tf: 6.0, tl: 6.5, ts: 7.75, row: 2 },
    { text: "auth.test.ts", tf: 8.0, tl: 8.5, ts: 9.75, row: 3 },
    { text: "package.json", tf: 11.0, tl: 11.4, ts: 11.75, row: 4, pair: 0 },
    { text: "src/", tf: 11.12, tl: 11.5, ts: 11.75, row: 4, pair: 1 },
    { text: "README.md", tf: 12.0, tl: 12.4, ts: 12.75, row: 5, pair: 0 },
    { text: "api.ts", tf: 12.12, tl: 12.5, ts: 12.75, row: 5, pair: 1 },
    { text: "utils.ts", tf: 13.0, tl: 13.4, ts: 13.75, row: 6, pair: 0 },
    { text: "db.ts", tf: 13.12, tl: 13.5, ts: 13.75, row: 6, pair: 1 },
    { text: "node_modules/", tf: 14.25, tl: 14.75, ts: 15.25, row: 7, heavy: true },
    { text: "full log (12k lines)", tf: 17.25, tl: 17.9, ts: 18.75, row: 8, heavy: true },
    { text: "error.log", tf: 19.5, tl: 19.9, stuck: true, err: true, pair: 0, drop: 26.0 },
    { text: "diff --git", tf: 20.0, tl: 20.4, stuck: true, pair: 1, drop: 26.12 },
  ];

  // Line clear (the signature): one row per beat, top row first; each flashes, then is gone.
  const CLEAR = Array.from({ length: 8 }, (_, i) => 26.5 + i * BEAT); // flash times, row 8 → row 1
  const FLASH = 0.25;

  // Rows held and context %, as keys [[time, value], ...].
  const rowKeys = [[0, 0]], meterKeys = [[0, 0]];
  const pct = [0, 8, 16, 24, 40, 48, 56, 72, 98];
  for (const c of CHIPS) if (c.row && c.pair !== 1) { rowKeys.push([c.ts + SINK, c.row]); meterKeys.push([c.ts + SINK, pct[c.row]]); }
  const afterClear = [86, 74, 62, 50, 38, 26, 18, 12];
  CLEAR.forEach((t, i) => { rowKeys.push([t + FLASH, 7 - i]); meterKeys.push([t + FLASH, afterClear[i]]); });

  // Buf's own moves.
  const FALL_IN = [-0.25, 0.5];                // already falling at frame 0 (the hook), lands on the beat
  const WOBBLE = [20.5, 22.0];                  // strains under the load, 1 U on each beat
  const SUMMARY = 30.5;                         // summary.md pops out of the head
  const HOPS = [[32.6, 33.0], [33.6, 34.0]];    // two happy hops, landing on the beats
  const EXIT = 36.0;                            // well, meter, prompt leave
  const RISE = [36.5, 37.5];                    // Buf climbs to centre stage

  // Texture rain in s03: small tokens falling into the head (seeded, same every run).
  const RAIN = [];
  let s = 7;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 26; i++) {
    const tf = 10.6 + i * 0.14 + rnd() * 0.08;
    RAIN.push({ tf, tl: tf + 0.35 + rnd() * 0.15, dx: (rnd() - 0.5) * 8, size: rnd() < 0.3 ? 1 : 0.5 });
  }

  globalThis.TL = { FORMATS, TRACK, BPM, BEAT, DUR, U, TYPE_DT, PROMPTS, SIGN, ROWS, BODY, SINK, CHIPS, CLEAR, FLASH, rowKeys, meterKeys, FALL_IN, WOBBLE, SUMMARY, HOPS, EXIT, RISE, RAIN };
})();
