// node sound.mjs → out/audio.wav: music bed (TL.MUSIC) + SFX (TL.CUES), synthesized from timeline.js.
// Closed-form voices and seeded noise, so the file is identical every run. With TL.TRACK set, only
// SFX are rendered here and mux.mjs lays them over the track.
// Add voices or change the arrangement per film; keep "every time comes from timeline.js".
import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = dirname(fileURLToPath(import.meta.url));
await import(join(ROOT, "timeline.js"));
const T = globalThis.TL;
const SR = 48000, N = Math.ceil(T.DUR * SR), mix = new Float32Array(N), TAU = 2 * Math.PI;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 42, prev = 0;
const noise = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
const hiss = () => { const n = noise(), v = n - prev; prev = n; return v; };          // crude high-pass noise
const sq = (ph, duty = 0.5) => (ph % 1 < duty ? 1 : -1);
const tri = (ph) => 4 * Math.abs((ph % 1) - 0.5) - 1;
// phase of a linear frequency glide f0 → f1 over d seconds
const glide = (t, f0, f1, d) => (t < d ? f0 * t + ((f1 - f0) * t * t) / (2 * d) : f0 * d + ((f1 - f0) * d) / 2 + f1 * (t - d));
function add(t0, dur, gain, fn) {
  const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) { const k = s0 + i; if (k >= 0 && k < N) mix[k] += gain * fn(i / SR, i / n); }
}

// ---- voices: V[type](t, gain?) ------------------------------------------------------------------
const V = {
  click: (t, g = 0.3) => add(t, 0.03, g, (x) => (hiss() * 0.7 + Math.sin(TAU * 2600 * x) * 0.3) * Math.exp(-x * 260)),
  tick: (t, g = 0.14) => add(t, 0.04, g, (x) => sq(1900 * x, 0.25) * Math.exp(-x * 120)),
  pop: (t, g = 0.35) => add(t, 0.12, g, (x) => Math.sin(TAU * glide(x, 420, 1300, 0.06)) * Math.exp(-x * 24)),
  thump: (t, g = 0.9) => add(t, 0.35, g, (x) => (Math.sin(TAU * glide(x, 140, 38, 0.18)) + noise() * 0.25 * Math.exp(-x * 40)) * Math.exp(-x * 11)),
  thud: (t, g = 1.0) => add(t, 0.6, g, (x) => (Math.sin(TAU * glide(x, 110, 36, 0.3)) + noise() * 0.3 * Math.exp(-x * 30)) * Math.exp(-x * 6)),
  whoosh: (t, g = 0.3, len = 0.35) => add(t - len, len + 0.08, g, (x, p) => hiss() * Math.sin(Math.PI * Math.min(1, p * 1.2)) * (0.3 + p)),
  whomp: (t, g = 0.8) => add(t, 0.7, g, (x) => Math.sin(TAU * glide(x, 170, 36, 0.45)) * Math.exp(-x * 5)),
  boing: (t, g = 0.3) => add(t, 0.3, g, (x) => sq(glide(x, 230, 760, 0.2), 0.25) * Math.exp(-x * 9)),
  beep: (t, g = 0.16) => add(t, 0.08, g, (x) => sq(1320 * x) * (x < 0.07 ? 1 : 0)),
  crack: (t, g = 0.35) => add(t, 0.12, g, (x) => noise() * (x % 0.02 < 0.006 ? 1 : 0.2) * Math.exp(-x * 22)),
  riser: (t, g = 0.22, len = 1) => add(t - len, len, g, (x, p) => (noise() * 0.5 + sq(glide(x, 180, 900, len), 0.25) * 0.5) * p * p),
  ding: (t, g = 0.1) => add(t, 1.2, g, (x) => Math.sin(TAU * mtof(84) * x) * Math.exp(-x * 3)),
  kick: (t, g = 0.8) => add(t, 0.22, g, (x) => Math.sin(TAU * glide(x, 150, 45, 0.12)) * Math.exp(-x * 16)),
  snare: (t, g = 0.3) => add(t, 0.16, g, (x) => (noise() * 0.8 + tri(190 * x) * 0.4) * Math.exp(-x * 26)),
  hat: (t, g = 0.1) => add(t, 0.05, g, (x) => hiss() * Math.exp(-x * 70)),
  bass: (t, m, d, g = 0.32) => add(t, d, g, (x) => tri(mtof(m) * x) * Math.min(1, x / 0.006) * Math.exp(-x * 5)),
  lead: (t, m, d, g = 0.05) => add(t, d, g, (x) => sq(mtof(m) * x, 0.25) * Math.min(1, x / 0.004) * Math.exp(-x * 18)),
  pad: (t, ms, d, g = 0.06) => ms.forEach((m) => add(t, d, g, (x, p) => (tri(mtof(m) * x) * 0.7 + sq(mtof(m) * x, 0.125) * 0.3) * Math.min(1, x / 0.08) * (1 - p) ** 1.5)),
};

// ---- music bed ------------------------------------------------------------------------------------
const CH = { Am: [45, [69, 72, 76]], F: [41, [65, 69, 72]], C: [48, [72, 76, 79]], G: [43, [67, 71, 74]], Dm: [50, [74, 77, 81]], Em: [52, [71, 76, 79]] };
if (!T.TRACK) for (const s of T.MUSIC) {
  const s16 = T.BEAT / 4;
  if (s.pad) { V.pad(s.from, CH[s.prog[0]][1].map((m) => m - 12), s.to - s.from, 0.06 * (s.gain ?? 1)); V.bass(s.from, CH[s.prog[0]][0], s.to - s.from, 0.32 * (s.gain ?? 1)); continue; }
  const g = s.gain ?? 1, gb = g * (s.bass ?? 1), gl = g * (s.lead ?? 1);
  // time from the integer step, never accumulated: floating error would put downbeats in the previous bar
  for (let i = 0; s.from + i * s16 < s.to - 1e-6; i++) {
    const t = s.from + i * s16, [root, tones] = CH[s.prog[Math.floor(i / 16) % s.prog.length]];
    const arpStep = 16 / (s.arp || 8);
    if (i % arpStep === 0) { const k = i / arpStep; V.lead(t, tones[[0, 1, 2, 1][k % 4]] + (k % 8 >= 4 ? 12 : 0), s16 * 1.6, 0.05 * gl); }
    if (i % 2 === 0) V.bass(t, root + ((i / 2) % 2 ? 12 : 0), T.BEAT, 0.32 * gb);
    if (s.kick && i % (4 * s.kick) === 0) V.kick(t, 0.8 * g);
    if (s.snare && i % 8 === 4) V.snare(t, 0.3 * g);
    if (s.hats && i % (4 / s.hats) === (s.hats === 1 ? 2 : 0)) V.hat(t, 0.1 * g);
  }
}

// ---- SFX ------------------------------------------------------------------------------------------
// Chapter files may add cues in chapters/*.cues.json: { shot, k, dt?, type, gain?, len? } — time = phrase k of
// that shot's voice line (+ dt), or { t, … } for an absolute time.
const extra = existsSync(join(ROOT, "chapters")) ? readdirSync(join(ROOT, "chapters")).filter((f) => f.endsWith(".cues.json")).flatMap((f) => JSON.parse(readFileSync(join(ROOT, "chapters", f), "utf8"))) : [];
const phraseT = (c) => { const s = T.SHOTS.find((x) => x.id === c.shot), l = (T.VO_LINES || []).find((v) => v.id === c.shot); return (s.vo ?? s.from) + ((l?.ph || [])[c.k || 0] || 0) + (c.dt || 0); };
for (const c of [...T.CUES, ...extra.map((c) => ({ ...c, t: c.t ?? phraseT(c) }))]) V[c.type](c.t, c.gain, c.len);

// ---- master: one-pole low-pass to tame square waves, soft clip, 16-bit mono WAV --------------------
let y = 0, peak = 0;
const a = 1 - Math.exp((-TAU * 9000) / SR);
for (let i = 0; i < N; i++) { y += a * (mix[i] - y); mix[i] = Math.tanh(y * 1.1); peak = Math.max(peak, Math.abs(mix[i])); }
const b = Buffer.alloc(44 + N * 2);
b.write("RIFF", 0); b.writeUInt32LE(36 + N * 2, 4); b.write("WAVEfmt ", 8);
b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28);
b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 2, 40);
// With a track, keep cue gains relative to it (no peak normalising); mux.mjs sets the final level.
const norm = T.TRACK || T.VOICE?.length ? 1 : 0.89 / Math.max(peak, 1e-9);
for (let i = 0; i < N; i++) b.writeInt16LE(Math.round(mix[i] * norm * 32767), 44 + i * 2);
mkdirSync(join(ROOT, "out"), { recursive: true });
writeFileSync(join(ROOT, "out/audio.wav"), b);
console.log(`out/audio.wav — ${T.DUR}s${T.TRACK ? " (SFX only, track mixed in mux)" : ""}`);
