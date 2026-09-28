// Motion helpers. Everything is a pure function of time, so window.seek(t) can paint any frame
// without simulating the ones before it.
(function () {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;

  // Closed-form damped spring from 0 to 1 (k stiffness, d damping, unit mass).
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t); // critical (z >= 1 treated as critical)
  }

  // Presets by mass: snappy UI, default containers, heavy type/big objects, playful (visible overshoot).
  const S = { snappy: [320, 30], base: [170, 26], heavy: [90, 20], playful: [220, 14], tick: [260, 18] };

  // A value with several targets: one spring per change, summed. keys = [[time, value], ...] sorted.
  function track(t, keys, [k, d] = S.base) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }

  // Last key at or before t (step function).
  function step(t, keys) {
    let v = keys[0][1];
    for (const [kt, kv] of keys) if (t >= kt) v = kv; else break;
    return v;
  }

  // Free fall from y0 to y1 between t0 and t1 (accelerating, lands at t1).
  const fall = (t, t0, t1, y0, y1) => lerp(y0, y1, clamp((t - t0) / (t1 - t0)) ** 2);
  // Ballistic hop of height h between t0 and t1 (0 at both ends).
  const hop = (t, t0, t1, h) => { const p = (t - t0) / (t1 - t0); return p <= 0 || p >= 1 ? 0 : 4 * h * p * (1 - p); };

  // Stop-motion clock: character poses change on twos at 24 fps (12 poses a second).
  const twos = (t) => Math.floor(t * 12 + 1e-6) / 12;
  const snap = (v, u) => Math.round(v / u) * u;

  // Seeded noise (mulberry32) — never Math.random: the render must be identical every run.
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  globalThis.M = { clamp, lerp, spring, S, track, step, fall, hop, twos, snap, rng };
})();
