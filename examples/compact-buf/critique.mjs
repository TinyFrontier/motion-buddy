// Pictures to look at before anyone else does. Open the PNGs with Read and judge them.
// Every output carries the format in its name, so a second format never overwrites the master's sheets.
//   node critique.mjs contact [--format 16x9] [--every <s>] [--phase 0.9]  a stamped frame per beat, taken
//        from the page (no render needed), late in each beat so moves have settled → out/contact-<fmt>.png
//   node critique.mjs phone [--format 16x9]         the same frames at 360 px wide → out/phone-<fmt>.png
//   node critique.mjs strip <t> [--n 12] [--w 320]  n consecutive frames centred on t, from the render → out/strip-<fmt>-<t>.png
//   node critique.mjs wave [--format 16x9]          waveform with bar lines and a tick per cue → out/wave-<fmt>.png
//   node critique.mjs poster <t>                    → out/poster-<fmt>.png
//   node critique.mjs loop                          final played twice → out/loop_check-<fmt>.mp4 + out/seam-<fmt>.png
//   node critique.mjs det [--from a --to b]         render twice (default: whole film up to 30 s); frames must match
import { spawnSync, execFileSync } from "node:child_process";
import { rmSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = dirname(fileURLToPath(import.meta.url));
process.chdir(ROOT);
await import(join(ROOT, "timeline.js"));
const T = globalThis.TL;
const [cmd, pos] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const fmt = arg("format", "16x9"), [W] = T.FORMATS?.[fmt] ?? [1920, 1080], FPS = 60;
const run = (bin, args) => { const r = spawnSync(bin, args, { stdio: "inherit" }); if (r.status) process.exit(r.status); };
const ff = (args) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const silent = `out/silent-${fmt}.mp4`, final = existsSync(`out/final-${fmt}.mp4`) ? `out/final-${fmt}.mp4` : silent;
const need = (f) => { if (!existsSync(f)) { console.error(`${f} missing — render first (node render.mjs --format ${fmt})`); process.exit(1); } };
const beatsDir = `out/beats-${fmt}`;

// Stamped stills, one per beat (or --every), late in the beat (--phase) so what we judge has settled.
function stills() {
  const every = +arg("every", T.BEAT), phase = +arg("phase", 0.9), times = [];
  for (let t = (T.T0 ?? 0) % every + every * phase; t < T.DUR; t += every) times.push(t.toFixed(2));
  rmSync(beatsDir, { recursive: true, force: true });
  run("node", ["render.mjs", "--format", fmt, "--at", times.join(","), "--outdir", beatsDir, "--stamp"]);
  return times.length;
}
const grid = (n, w) => { const c = Math.max(1, Math.min(n, Math.floor(1920 / w))); return [c, Math.ceil(n / c)]; };

if (cmd === "contact") {
  const n = stills(), [c, r] = grid(n, 192);
  ff(["-pattern_type", "glob", "-i", `${beatsDir}/t*.png`, "-vf", `scale=192:-1,tile=${c}x${r}:padding=2`, "-frames:v", "1", `out/contact-${fmt}.png`]);
  console.log(`out/contact-${fmt}.png — ${n} frames, time stamped`);
} else if (cmd === "phone") {
  const n = stills(), pick = Math.max(1, Math.ceil(n / 15)), k = Math.ceil(n / pick), [c, r] = grid(k, 364);
  ff(["-pattern_type", "glob", "-i", `${beatsDir}/t*.png`, "-vf", `select='not(mod(n\\,${pick}))',scale=360:-1,tile=${c}x${r}:padding=4:color=white`, "-frames:v", "1", `out/phone-${fmt}.png`]);
  console.log(`out/phone-${fmt}.png — ${k} frames at 360 px wide (canvas ×${(360 / W).toFixed(2)}: ${W}px canvas text of 36px reads as ${(36 * 360 / W).toFixed(1)}px)`);
} else if (cmd === "strip") {
  if (pos === undefined || isNaN(+pos)) { console.error("usage: node critique.mjs strip <t> [--n 12] [--w 320]"); process.exit(1); }
  need(silent);
  const n = +arg("n", 12), w = +arg("w", 320), [c, r] = grid(n, w + 2);
  const ss = Math.max(0, Math.min(T.DUR - n / FPS, +pos - n / 2 / FPS));
  const out = `out/strip-${fmt}-${pos}.png`;
  ff(["-ss", ss.toFixed(3), "-i", silent, "-vf", `scale=${w}:-1,tile=${c}x${r}:padding=2`, "-frames:v", "1", out]);
  need(out);
  console.log(`${out} — ${n} consecutive frames from ${ss.toFixed(2)}s (render fps)`);
} else if (cmd === "wave") {
  need(final);
  const BAR = T.BAR ?? 4 * T.BEAT, px = 1920 / T.DUR, bar = (BAR * px).toFixed(2), off = (((T.T0 ?? 0) % BAR) * px).toFixed(1);
  const ticks = (T.CUES || []).map((c) => `drawbox=x=${Math.round(c.t * px)}:y=0:w=2:h=24:color=0xE8643C:t=fill`).join(",");
  ff(["-i", final, "-filter_complex", `[0:a]showwavespic=s=1920x240:colors=0x9fd8cb,drawgrid=x=${off}:w=${bar}:h=240:t=1:c=white@0.3${ticks ? "," + ticks : ""}[w]`, "-map", "[w]", "-frames:v", "1", `out/wave-${fmt}.png`]);
  console.log(`out/wave-${fmt}.png — white lines = bars, orange ticks = TL.CUES; hits should sit on the ticks`);
} else if (cmd === "poster") {
  need(final);
  ff(["-ss", String(pos ?? T.DUR / 2), "-i", final, "-frames:v", "1", `out/poster-${fmt}.png`]);
  console.log(`out/poster-${fmt}.png`);
} else if (cmd === "loop") {
  need(final);
  ff(["-stream_loop", "1", "-i", final, "-c", "copy", `out/loop_check-${fmt}.mp4`]);
  ff(["-ss", (T.DUR - 6 / FPS).toFixed(3), "-i", `out/loop_check-${fmt}.mp4`, "-vf", "scale=320:-1,tile=6x2:padding=2", "-frames:v", "1", `out/seam-${fmt}.png`]);
  console.log(`out/loop_check-${fmt}.mp4, out/seam-${fmt}.png — 12 frames across the seam; no jump between the 6th and 7th`);
} else if (cmd === "det") {
  const from = arg("from", "0"), to = arg("to", String(Math.min(30, T.DUR)));
  const hash = (f) => execFileSync("ffmpeg", ["-loglevel", "error", "-i", f, "-f", "framemd5", "-"]).toString().split("\n").filter((l) => l && !l.startsWith("#")).join("\n");
  for (const f of ["a", "b"]) run("node", ["render.mjs", "--format", fmt, "--fps", "30", "--sub", "1", "--from", from, "--to", to, "--out", `out/det-${f}.mp4`]);
  const same = hash("out/det-a.mp4") === hash("out/det-b.mp4");
  rmSync("out/det-a.mp4"); rmSync("out/det-b.mp4");
  console.log(same ? `deterministic: ${from}–${to}s rendered twice, identical frames` : "NOT deterministic: frames differ between two renders (Math.random? timers? carried state?)");
  process.exitCode = same ? 0 : 1;
} else {
  console.log("usage: node critique.mjs contact|phone|strip <t>|wave|poster <t>|loop|det [--format 16x9]");
}
