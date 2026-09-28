// The film as data. The picture (index.html) and the sound (sound.mjs) both read this file, so a
// hit always lands on the event that caused it: change a time here and both follow.
// Seconds everywhere. The grid starts at T0 (first downbeat) and runs at BPM; with a supplied track,
// copy bpm and t0 from beats.json (scripts/beats.py) into these two numbers.
(function () {
  const BPM = 120, T0 = 0, BEAT = 60 / BPM, BAR = 4 * BEAT, DUR = 12;

  // Voice-over (optional): docs/vo.json → `node voice.mjs` writes each line's file, length and phrase
  // onsets here. Then build SHOTS from the lines (a shot per line, starting on the beat before it) and set
  // VOICE = lines placed at their start times; mux.mjs ducks the music under them (BED_DB, default −9 LU).
  /* VO:BEGIN — written by voice.mjs */
  const VO_LINES = [];
  /* VO:END */

  // Canvases for this film: only the formats picked in the intake, master first. Every script renders
  // the first one unless given --format <key> (F=<key> for npm run).
  const FORMATS = { "16x9": [1920, 1080], "9x16": [1080, 1920], "1x1": [1080, 1080] };

  // Shots from docs/shotlist.md, on the bar grid. index.html draws one function per shot.
  const SHOTS = [
    { id: "hook", from: 0, to: 2 },
    { id: "build", from: 2, to: 8 },
    { id: "end", from: 8, to: DUR },
  ];

  // Sound cues: { t, type, gain?, len? } — type is a voice in sound.mjs (len: whoosh/riser length).
  // Derive times from SHOTS or other data where you can.
  const CUES = [
    { t: 0.0, type: "thump" },
    { t: 2.0, type: "whoosh" },
    { t: 4.0, type: "pop" }, { t: 5.0, type: "pop" }, { t: 6.0, type: "pop" },
    { t: 8.0, type: "whomp" },
  ];

  // Music bed per section (on the bar grid): chord per bar, arp notes per bar (4/8/16), kick every n beats,
  // hats per beat, snare on 2 and 4; level multipliers gain / bass / lead; pad: a held chord instead.
  // TRACK: a supplied track (no music is synthesized). VOICE: timed voice files [{ file, t }] mixed in by mux.mjs.
  const MUSIC = [
    { from: 0, to: 8, prog: ["Am", "F", "C", "G"], arp: 8, kick: 2, hats: 1 },
    { from: 8, to: DUR, prog: ["C"], pad: true },
  ];
  const TRACK = null; // e.g. "assets/track.wav"
  const VOICE = [];   // e.g. [{ file: "assets/vo-1.wav", t: 2.0 }]

  globalThis.TL = { BPM, T0, BEAT, BAR, DUR, FORMATS, SHOTS, CUES, MUSIC, TRACK, VOICE, VO_LINES };
})();
