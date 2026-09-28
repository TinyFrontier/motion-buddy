// Render index.html frame by frame: seek(t) → screenshot → ffmpeg.
//   node render.mjs [--format 16x9] [--fps 60 --sub 4] [--from 0 --to <dur>] [--out out/silent-16x9.mp4]
//   node render.mjs --at 1,2.5,7 [--format 9x16] [--outdir out/stills] [--stamp]   stills, one PNG per time (--stamp prints t on it)
// A partial range (--from/--to) writes out/part-<fmt>-<from>-<to>.mp4 and leaves the full film alone.
// --sub N blends N subframes per frame (motion blur). Drafts: --fps 30 --sub 1.
// Browser: Playwright's Chromium, else the installed Google Chrome; CHROME=<path> overrides both.
import { chromium } from "playwright";
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
await import(join(ROOT, "timeline.js"));
const TL = globalThis.TL;
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const FMT = arg("format", "16x9"), [W, H] = TL.FORMATS?.[FMT] ?? [1920, 1080];
const FPS = +arg("fps", 60), SUB = +arg("sub", 4), FROM = +arg("from", 0), TO = +arg("to", TL.DUR);
const PART = FROM !== 0 || TO !== TL.DUR;
const OUT = arg("out", PART ? `out/part-${FMT}-${FROM}-${TO}.mp4` : `out/silent-${FMT}.mp4`), AT = arg("at"), OUTDIR = arg("outdir", "out/stills");
const STAMP = process.argv.includes("--stamp");

// Fonts and images don't load over file://, so serve the folder.
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css",
  ".ttf": "font/ttf", ".otf": "font/otf", ".woff": "font/woff", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm" };
const server = http.createServer((req, res) => {
  const p = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": MIME[extname(p).toLowerCase()] || "application/octet-stream" }).end(readFileSync(p));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));

// Software rasterisation: GPU canvas anti-aliasing varies run to run, which breaks determinism.
const args = ["--disable-gpu", "--disable-accelerated-2d-canvas", "--force-color-profile=srgb", "--font-render-hinting=none"];
const launch = async () => {
  if (process.env.CHROME) return chromium.launch({ executablePath: process.env.CHROME, args });
  try { return await chromium.launch({ args }); } catch { return chromium.launch({ channel: "chrome", args }); }
};
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => { console.error("page error:", e.message); process.exitCode = 1; });
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?f=${FMT}`, { waitUntil: "load" });
await page.evaluate(() => window.ready);
// Grab the canvas itself: faster than a page screenshot and exactly the film's pixels.
const shot = async (t, stamp = false) => Buffer.from(await page.evaluate(([t, stamp]) => {
  window.seek(t);
  let c = document.querySelector("canvas");
  if (stamp) { // a copy with the time in the corner, for review sheets only
    const k = document.createElement("canvas"); k.width = c.width; k.height = c.height;
    const x = k.getContext("2d"), px = Math.round(Math.min(c.width, c.height) / 14);
    x.drawImage(c, 0, 0); x.font = `700 ${px}px monospace`; x.fillStyle = "#000c"; x.fillRect(0, 0, px * 4.2, px * 1.4);
    x.fillStyle = "#ff0"; x.textBaseline = "top"; x.fillText(t.toFixed(2), px * 0.25, px * 0.2); c = k;
  }
  return c.toDataURL("image/png").split(",")[1];
}, [t, stamp]), "base64");

if (AT) {
  mkdirSync(join(ROOT, OUTDIR), { recursive: true });
  for (const t of AT.split(",").map(Number)) writeFileSync(join(ROOT, OUTDIR, `t${t.toFixed(2).padStart(6, "0")}.png`), await shot(t, STAMP));
  console.log(`stills → ${OUTDIR}`);
} else {
  mkdirSync(dirname(join(ROOT, OUT)), { recursive: true });
  // tmix averages SUB consecutive subframes; select keeps one per group.
  const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB` : "null";
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS * SUB), "-i", "-",
    "-vf", vf, "-r", String(FPS), "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", join(ROOT, OUT)], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round((TO - FROM) * FPS * SUB), t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const png = await shot(FROM + i / (FPS * SUB));
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i && i % (FPS * SUB * 5) === 0) console.log(`${(i / (FPS * SUB)).toFixed(0)}s / ${TO - FROM}s  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(`${OUT}: ${W}x${H} ${FPS} fps ×${SUB}, ${total} captures in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
server.close();
