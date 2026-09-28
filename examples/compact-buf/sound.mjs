// node sound.mjs → out/audio.wav. Chiptune score + SFX synthesized from the same timeline as the
// picture (timeline.js), so every hit sits on its event. Closed-form voices, seeded noise: identical every run.
import { writeFileSync, mkdirSync } from "node:fs";
await import("./timeline.js");
const T = globalThis.TL;
const SR = 48000, N = Math.ceil(T.DUR * SR), mix = new Float32Array(N);
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 42;
const noise = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
const sq = (ph, duty = 0.5) => (ph % 1 < duty ? 1 : -1);
const tri = (ph) => 4 * Math.abs((ph % 1) - 0.5) - 1;
const TAU = 2 * Math.PI;
// phase of a linear glide f0 → f1 over d seconds
const glide = (t, f0, f1, d) => (t < d ? f0 * t + ((f1 - f0) * t * t) / (2 * d) : f0 * d + ((f1 - f0) * d) / 2 + f1 * (t - d));

function add(t0, dur, gain, fn) {
  const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) { const k = s0 + i; if (k >= 0 && k < N) mix[k] += gain * fn(i / SR, i / n); }
}

// ---- voices -------------------------------------------------------------------------------------
const note = (t, d, m, g, duty = 0.5, rel = 12) => add(t, d, g, (x) => sq(mtof(m) * x, duty) * Math.min(1, x / 0.004) * Math.exp(-x * rel));
const bass = (t, d, m, g) => add(t, d, g, (x) => tri(mtof(m) * x) * Math.min(1, x / 0.006) * Math.exp(-x * 5));
const kick = (t, g = 0.9) => add(t, 0.22, g, (x) => Math.sin(TAU * glide(x, 150, 45, 0.12)) * Math.exp(-x * 16));
const snare = (t, g = 0.35) => add(t, 0.16, g, (x) => (noise() * 0.8 + tri(190 * x) * 0.4) * Math.exp(-x * 26));
let prev = 0;
const hat = (t, g = 0.12) => add(t, 0.05, g, (x) => { const n = noise(), v = n - prev; prev = n; return v * Math.exp(-x * 70); });
const click = (t, g = 0.18) => add(t, 0.03, g, (x) => { const n = noise(), v = n - prev; prev = n; return (v * 0.7 + Math.sin(TAU * 2600 * x) * 0.3) * Math.exp(-x * 260); });
const thud = (t, g = 0.9, big = false) => add(t, big ? 0.6 : 0.35, g, (x) => (Math.sin(TAU * glide(x, big ? 110 : 140, 38, big ? 0.3 : 0.18)) + noise() * 0.25 * Math.exp(-x * 40)) * Math.exp(-x * (big ? 6 : 11)));
const tick = (t, g = 0.14) => add(t, 0.04, g, (x) => sq(1900 * x, 0.25) * Math.exp(-x * 120));
const gulp = (t, g = 0.3) => add(t, 0.14, g, (x) => sq(glide(x, 720, 170, 0.12), 0.3) * Math.exp(-x * 14));
const whistle = (t0, t1, g = 0.07) => add(t0, t1 - t0, g, (x, p) => Math.sin(TAU * glide(x, 1500, 520, t1 - t0)) * Math.sin(Math.PI * p));
const crack = (t, g = 0.35) => add(t, 0.12, g, (x) => noise() * (x % 0.02 < 0.006 ? 1 : 0.2) * Math.exp(-x * 22));
const beep = (t, g = 0.16) => add(t, 0.08, g, (x) => sq(1320 * x) * (x < 0.07 ? 1 : 0));
const blip = (t, g = 0.12) => add(t, 0.1, g, (x) => Math.sin(TAU * 880 * x) * Math.exp(-x * 30));
const boing = (t, g = 0.3) => add(t, 0.3, g, (x) => sq(glide(x, 230, 760, 0.2), 0.25) * Math.exp(-x * 9));
const pop = (t, g = 0.35) => add(t, 0.12, g, (x) => Math.sin(TAU * glide(x, 420, 1300, 0.06)) * Math.exp(-x * 24));
const whomp = (t, g = 0.8) => add(t, 0.7, g, (x) => Math.sin(TAU * glide(x, 170, 36, 0.45)) * Math.exp(-x * 5));
const riser = (t0, t1, g = 0.22) => add(t0, t1 - t0, g, (x, p) => (noise() * 0.5 + sq(glide(x, 180, 900, t1 - t0), 0.25) * 0.5) * p * p);
const powerDown = (t, g = 0.35) => add(t, 0.45, g, (x, p) => sq(glide(x, 330, 40, 0.45), 0.5) * (1 - p));

// ---- music --------------------------------------------------------------------------------------
const B = T.BEAT, S16 = B / 4;
const CH = { Am: [45, [69, 72, 76]], F: [41, [65, 69, 72]], C: [48, [72, 76, 79]], G: [43, [67, 71, 74]], Dm: [50, [74, 77, 81]] };
const bar = (t) => Math.floor(t / 2);
function section(from, to, prog, { arp = 8, bassRate = 2, kickEvery = 2, hats = 0, snare2 = false, lift = 0, g = 1 }) {
  for (let t = from; t < to - 1e-6; t += S16) {
    const [root, tones] = CH[prog[(bar(t) - bar(from)) % prog.length]];
    const i16 = Math.round((t - from) / S16);
    if (i16 % (16 / arp) === 0) { const k = Math.floor(i16 / (16 / arp)); note(t, S16 * 1.6, tones[[0, 1, 2, 1][k % 4]] + lift + (k % 8 >= 4 ? 12 : 0), 0.05 * g, 0.25, 18); }
    if (i16 % (4 / bassRate) === 0) bass(t, B, root + (Math.floor(i16 / (4 / bassRate)) % 2 ? 12 : 0), 0.32 * g);
    if (i16 % (4 * kickEvery) === 0) kick(t, 0.8 * g);
    if (snare2 && i16 % 8 === 4) snare(t, 0.3 * g);
    if (hats && i16 % (4 / hats) === (hats === 1 ? 2 : 0)) hat(t, 0.1 * g);
  }
}
section(0.5, 4, ["Am"], { arp: 4, bassRate: 1, kickEvery: 4, g: 0.8 });
section(4, 10, ["Am", "F", "C"], { arp: 8, bassRate: 2, kickEvery: 2, hats: 1 });
section(10, 16, ["Am", "F", "C"], { arp: 16, bassRate: 2, kickEvery: 1, hats: 4, snare2: true });
section(16, 22, ["F", "G", "Am"], { arp: 16, bassRate: 4, kickEvery: 1, hats: 4, snare2: true, lift: 12 });
powerDown(22.0);
section(26, 30.5, ["Am", "F", "C"], { arp: 8, bassRate: 2, kickEvery: 1, hats: 2, g: 0.9 });
section(30.5, 32, ["C"], { arp: 4, bassRate: 1, kickEvery: 4, g: 0.6 }); // relief bed under the pop, no dead air
section(32, 36, ["C", "G"], { arp: 8, bassRate: 2, kickEvery: 2, hats: 1, g: 0.9 });
for (const m of [60, 64, 67, 72]) add(36.5, 3.5, 0.07, (x, p) => (tri(mtof(m) * x) * 0.7 + sq(mtof(m) * x, 0.125) * 0.3) * Math.min(1, x / 0.05) * (1 - p) ** 1.5);
bass(36.5, 3.0, 36, 0.3);

// ---- SFX from the timeline ------------------------------------------------------------------------
for (const p of [...T.PROMPTS, T.SIGN]) for (let i = 0; i < p.text.length; i++) if (p.text[i] !== " ") click(p.at + i * (p.dt || T.TYPE_DT), p === T.SIGN ? 0.14 : 0.18);
const enter = T.PROMPTS.find((p) => p.enter).enter;
add(enter, 0.08, 0.5, (x) => noise() * Math.exp(-x * 60)); thud(enter, 0.35);
thud(T.FALL_IN[1], 0.9);
for (const c of T.CHIPS) {
  if (c.pair !== 1) whistle(c.tf, c.tl, c.heavy ? 0.09 : 0.06);
  if (c.heavy) { thud(c.tl, 1.0, true); crack(c.tl + 0.02, 0.3); } else if (c.err) crack(c.tl); else tick(c.tl);
  if (c.ts && c.pair !== 1) gulp(c.ts);
  if (c.drop) gulp(c.drop, 0.22);
}
for (const d of T.RAIN) tick(d.tl, 0.05);
for (let t = 19.0; t < 22.0 - 1e-6; t += B) beep(t);
for (const t of [24.0, 24.5, 25.0, 25.5]) blip(t);
riser(25.0, 26.0);
const arp = [69, 72, 74, 76, 79, 81, 84, 86];
T.CLEAR.forEach((t, i) => { note(t, 0.3, arp[i], 0.14, 0.5, 8); hat(t, 0.12); });
whomp(T.CLEAR[7] + T.FLASH);
pop(T.SUMMARY);
for (const [a, b] of T.HOPS) { boing(a); thud(b, 0.35); }
add(T.SIGN.at + (T.SIGN.text.length - 1) * T.SIGN.dt + 0.15, 1.2, 0.1, (x) => Math.sin(TAU * mtof(84) * x) * Math.exp(-x * 3)); // ding

// ---- master: one-pole lowpass to tame the squares, soft clip, 16-bit WAV --------------------------
let y = 0, peak = 0;
const a = 1 - Math.exp((-TAU * 9000) / SR);
for (let i = 0; i < N; i++) { y += a * (mix[i] - y); mix[i] = Math.tanh(y * 1.1); peak = Math.max(peak, Math.abs(mix[i])); }
const b = Buffer.alloc(44 + N * 2);
b.write("RIFF", 0); b.writeUInt32LE(36 + N * 2, 4); b.write("WAVEfmt ", 8);
b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28);
b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) b.writeInt16LE(Math.round((mix[i] / Math.max(peak, 1e-9)) * 0.89 * 32767), 44 + i * 2);
mkdirSync("out", { recursive: true });
writeFileSync("out/audio.wav", b);
console.log(`out/audio.wav — ${T.DUR}s, peak before normalise ${peak.toFixed(2)}`);
