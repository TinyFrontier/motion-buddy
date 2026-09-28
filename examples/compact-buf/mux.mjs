// node mux.mjs [--format 16x9] → out/final-<format>.mp4
// Audio = out/audio.wav (+ TL.TRACK, + TL.VOICE files at their times), mixed in float, brought to
// −14 LUFS with a gain and a peak limiter set for that gain (true peak ≤ −1 dBTP), muxed with
// out/silent-<format>.mp4.
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = dirname(fileURLToPath(import.meta.url));
process.chdir(ROOT);
await import(join(ROOT, "timeline.js"));
const T = globalThis.TL;
const i = process.argv.indexOf("--format"), fmt = i > 0 ? process.argv[i + 1] : "16x9";
const video = `out/silent-${fmt}.mp4`, out = `out/final-${fmt}.mp4`;
const ff = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8" });
const must = (r) => { if (r.status) throw new Error(r.stderr); return r; };
const loud = (file, pre = "") => { const e = ff(["-i", file, "-af", `${pre}${pre ? "," : ""}loudnorm=I=-14:TP=-1:LRA=20:print_format=json`, "-f", "null", "-"]).stderr; return JSON.parse(e.slice(e.lastIndexOf("{"), e.lastIndexOf("}") + 1)); };

// 1. Premix every source in float (no clipping before the level is set).
const src = [{ file: "out/audio.wav", t: 0 }, ...(T.TRACK ? [{ file: T.TRACK, t: 0 }] : []), ...(T.VOICE || [])];
let audio = "out/audio.wav";
if (src.length > 1) {
  const chains = src.map((s, k) => `[${k}:a]aresample=48000,aformat=channel_layouts=mono${s.t ? `,adelay=${Math.round(s.t * 1000)}:all=1` : ""}[a${k}]`);
  must(ff(["-y", ...src.flatMap((s) => ["-i", s.file]), "-filter_complex", `${chains.join(";")};${src.map((_, k) => `[a${k}]`).join("")}amix=inputs=${src.length}:duration=first:normalize=0`,
    "-c:a", "pcm_f32le", "out/premix.wav"]));
  audio = "out/premix.wav";
}

// 2. Level: gain to −14 LUFS; a limiter just before it keeps peaks under −1.5 dBFS after the gain.
const chain = (gdb) => `alimiter=limit=${Math.max(0.0625, 10 ** (Math.min(0, -1.5 - gdb) / 20)).toFixed(4)}:level=0:attack=2:release=60,volume=${gdb.toFixed(2)}dB`;
let g = -14 - +loud(audio).input_i;
g += -14 - +loud(audio, chain(g)).input_i;              // the limiter shaves a little loudness: correct once

// 3. Mux.
must(ff(["-y", "-i", video, "-i", audio, "-af", `${chain(g)},aresample=48000`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-shortest", out]));
const f = loud(out);
console.log(`${out}: ${f.input_i} LUFS, true peak ${f.input_tp} dBTP${+f.input_tp > -0.9 ? "  (peak above −1 dBTP: lower the loudest cue)" : ""}`);
