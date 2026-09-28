// node voice.mjs [--force] — synthesize docs/vo.json line by line with fish.audio, trim the silence,
// measure each line and write the list into timeline.js between the VO markers.
// .env: FISH_AUDIO_KEY, VOICE_ID (a fish.audio voice), optional FISH_MODEL (default s2.1-pro-free),
// optional FISH_SPEED (0.5–2). Lines whose text didn't change are not re-synthesized. Each line gets its
// length and phrase onsets `ph` (where speech resumes after a pause) — key picture events to them.
// s2.1-pro-free works without API credit; paid models need credit on the fish.audio developer account.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = dirname(fileURLToPath(import.meta.url));
process.chdir(ROOT);
if (!existsSync(".env")) { console.error("voice.mjs: put FISH_AUDIO_KEY and VOICE_ID in .env (see the skill, step 5b)"); process.exit(1); }
const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const KEY = env.FISH_AUDIO_KEY, VOICE = env.VOICE_ID, MODEL = env.FISH_MODEL || "s2.1-pro-free", SPEED = +(env.FISH_SPEED || 1);
if (!KEY || !VOICE) { console.error("voice.mjs: .env needs FISH_AUDIO_KEY and VOICE_ID"); process.exit(1); }
const force = process.argv.includes("--force");
if (!existsSync("docs/vo.json")) { console.error('voice.mjs: write docs/vo.json first: [{ "id": "hook", "ch": 1, "text": "…" }, …]'); process.exit(1); }
const lines = JSON.parse(readFileSync("docs/vo.json", "utf8"));
mkdirSync("assets/vo/raw", { recursive: true });

const out = [];
for (const [i, l] of lines.entries()) {
  const raw = `assets/vo/raw/${l.id}.wav`, wav = `assets/vo/${l.id}.wav`, stamp = `assets/vo/raw/${l.id}.txt`;
  if (force || !existsSync(raw) || !existsSync(stamp) || readFileSync(stamp, "utf8") !== l.text) {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", model: MODEL },
      body: JSON.stringify({ text: l.text, reference_id: VOICE, format: "wav", prosody: { speed: SPEED } }),
    });
    if (!res.ok) throw new Error(`fish.audio ${res.status} on "${l.id}": ${(await res.text()).slice(0, 200)}`);
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    writeFileSync(stamp, l.text);
    console.log(`synthesized ${l.id}`);
  }
  // trim leading/trailing silence, 48 kHz mono
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", raw, "-af",
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse",
    "-ar", "48000", "-ac", "1", wav]);
  const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString();
  // phrase onsets: where speech resumes after a pause (commas, full stops) — sync points for the picture
  const err = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${wav}" -af silencedetect=noise=-38dB:d=0.14 -f null - 2>&1`]).toString(); // silencedetect logs to stderr
  const ph = [0, ...[...err.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +(+m[1]).toFixed(2)).filter((x) => x < dur - 0.2)];
  out.push({ id: l.id, ch: l.ch, file: wav, dur: +dur.toFixed(3), ph });
}

const block = `/* VO:BEGIN — written by voice.mjs */\n  const VO_LINES = ${JSON.stringify(out, null, 0).replace(/\},\{/g, "},\n    {")};\n  /* VO:END */`;
const tl = readFileSync("timeline.js", "utf8");
if (!/\/\* VO:BEGIN[\s\S]*?VO:END \*\//.test(tl)) throw new Error("timeline.js has no /* VO:BEGIN */ … /* VO:END */ block");
writeFileSync("timeline.js", tl.replace(/\/\* VO:BEGIN[\s\S]*?VO:END \*\//, block));
const total = out.reduce((s, l) => s + l.dur, 0);
console.log(out.map((l) => `${l.id.padEnd(10)} ${l.dur.toFixed(2)}s`).join("\n"));
console.log(`${out.length} lines, ${total.toFixed(1)}s of speech → timeline.js`);
