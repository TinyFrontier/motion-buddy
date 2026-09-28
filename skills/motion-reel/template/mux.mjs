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
const i = process.argv.indexOf("--format"), fmt = i > 0 ? process.argv[i + 1] : Object.keys(T.FORMATS)[0];
const video = `out/silent-${fmt}.mp4`, out = `out/final-${fmt}.mp4`;
const ff = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8" });
const must = (r) => { if (r.status) throw new Error(r.stderr); return r; };
const loud = (file, pre = "") => { const e = ff(["-i", file, "-af", `${pre}${pre ? "," : ""}loudnorm=I=-14:TP=-1:LRA=20:print_format=json`, "-f", "null", "-"]).stderr; return JSON.parse(e.slice(e.lastIndexOf("{"), e.lastIndexOf("}") + 1)); };

// 1. Premix in float (no clipping before the level is set). Music bed = out/audio.wav (+ TL.TRACK);
//    with voice lines, the bed is ducked under the voice (sidechain) and the voice sits on top.
const bed = [{ file: "out/audio.wav", t: 0 }, ...(T.TRACK ? [{ file: T.TRACK, t: 0 }] : [])], voice = T.VOICE || [];
const src = [...bed, ...voice];
let audio = "out/audio.wav";
if (src.length > 1) {
  const chains = src.map((s, k) => `[${k}:a]aresample=48000,aformat=channel_layouts=mono${s.t ? `,adelay=${Math.round(s.t * 1000)}:all=1` : ""}[a${k}]`);
  const lab = (from, n) => Array.from({ length: n }, (_, k) => `[a${from + k}]`).join("");
  const mixBed = bed.length > 1 ? `${lab(0, bed.length)}amix=inputs=${bed.length}:duration=first:normalize=0[bed]` : `[a0]anull[bed]`;
  // The bed sits TL.BED_DB (default −9 LU) below the voice in loudness, then ducks further while anyone speaks.
  let bedGain = 0;
  if (voice.length) {
    const voOnly = `${chains.slice(bed.length).map((c, k) => c.replace(`[${bed.length + k}:a]`, `[${k}:a]`).replace(`[a${bed.length + k}]`, `[v${k}]`)).join(";")};` +
      `${voice.map((_, k) => `[v${k}]`).join("")}amix=inputs=${voice.length}:duration=longest:normalize=0`;
    must(ff(["-y", ...voice.flatMap((s) => ["-i", s.file]), "-filter_complex", voOnly, "-c:a", "pcm_f32le", "out/voice.wav"]));
    const bedFile = bed.length > 1 ? (must(ff(["-y", ...bed.flatMap((s) => ["-i", s.file]), "-filter_complex", `amix=inputs=${bed.length}:duration=first:normalize=0`, "-c:a", "pcm_f32le", "out/bed.wav"])), "out/bed.wav") : bed[0].file;
    bedGain = +loud("out/voice.wav").input_i + (T.BED_DB ?? -9) - +loud(bedFile).input_i;
  }
  const graph = voice.length
    ? `${chains.join(";")};${mixBed.replace("[bed]", `,volume=${bedGain.toFixed(2)}dB[bed]`).replace("anull,", "")};${lab(bed.length, voice.length)}amix=inputs=${voice.length}:duration=longest:normalize=0,apad,asplit=2[vo][key];` +
      `[bed][key]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=450[duck];[duck][vo]amix=inputs=2:duration=first:normalize=0`
    : `${chains.join(";")};${lab(0, src.length)}amix=inputs=${src.length}:duration=first:normalize=0`;
  must(ff(["-y", ...src.flatMap((s) => ["-i", s.file]), "-filter_complex", graph, "-c:a", "pcm_f32le", "out/premix.wav"]));
  audio = "out/premix.wav";
}

// 2. Level: gain to −14 LUFS; a limiter just before it keeps peaks under −1.5 dBFS after the gain.
const chain = (gdb) => `alimiter=limit=${Math.max(0.0625, 10 ** (Math.min(0, -1.5 - gdb) / 20)).toFixed(4)}:level=0:attack=2:release=60,volume=${gdb.toFixed(2)}dB`;
let g = -14 - +loud(audio).input_i;
for (let k = 0; k < 2; k++) g += -14 - +loud(audio, chain(g)).input_i; // the limiter shaves a little loudness: correct twice

// 3. Mux.
must(ff(["-y", "-i", video, "-i", audio, "-af", `${chain(g)},aresample=48000`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-shortest", out]));
const f = loud(out);
console.log(`${out}: ${f.input_i} LUFS, true peak ${f.input_tp} dBTP${+f.input_tp > -0.9 ? "  (peak above −1 dBTP: lower the loudest cue)" : ""}`);
