// Ett litet diffusionsliknande förlopp på ett rutnät med 48 × 36 pixlar.
// Bilden börjar som brus. För varje steg tas lite brus bort och bilden blir
// skarpare: först de stora formerna, sist detaljerna.
//
// Förenkling (står också på modulsidan): här finns målbilden redan i koden och
// visas fram. En riktig modell har ingen färdig bild, utan gissar i varje steg
// vilket brus som ska bort utifrån det den lärt sig av miljontals bilder.

import { clamp, fbm1, hash1, hash3, lerp } from '@nastasteg/engine/core/math';

export const GW = 48;
export const GH = 36;
export const STEPS = 20;
export const PROMPTS = ['en sol över berg', 'en båt på havet', 'ett hus och ett träd'] as const;

/** Bild som RGB i [0,1], rad för rad. */
export type Img = Float32Array;
type RGB = readonly [number, number, number];

const mix = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Färg i punkten (u, v), båda i [0,1], v nedåt. Fröet flyttar och formar motivet. */
function painter(prompt: number, seed: number): (u: number, v: number) => RGB {
  const r = (i: number) => hash3(seed, prompt, i);
  if (prompt === 0) {
    const sunX = 0.2 + 0.6 * r(1),
      sunY = 0.18 + 0.15 * r(2),
      sunR = 0.09 + 0.04 * r(3);
    const far = (u: number) => 0.5 + 0.12 * fbm1(u * 3, seed * 7 + 1);
    const near = (u: number) => 0.68 + 0.12 * fbm1(u * 4 + 9, seed * 7 + 2);
    return (u, v) => {
      if (v > near(u)) return [0.16, 0.2, 0.22];
      if (v > far(u)) return [0.34, 0.33, 0.44];
      const du = (u - sunX) * (GW / GH),
        dv = v - sunY;
      if (du * du + dv * dv < sunR * sunR) return [1, 0.86, 0.5];
      return mix([0.2, 0.26, 0.45], [0.93, 0.6, 0.42], clamp(v / 0.65));
    };
  }
  if (prompt === 1) {
    const horizon = 0.5 + 0.12 * r(1),
      boatX = 0.25 + 0.5 * r(2),
      left = r(3) < 0.5;
    return (u, v) => {
      const hull = horizon + 0.06;
      const hw = 0.13 - (v - hull) * 0.8;
      if (v > hull && v < hull + 0.06 && Math.abs(u - boatX) < hw) return [0.45, 0.26, 0.16];
      // seglet: en triangel på ena sidan om masten
      const sx = left ? boatX - u : u - boatX;
      if (v < hull && v > hull - 0.28 && sx > 0 && sx < ((v - (hull - 0.28)) / 0.28) * 0.12) return [0.96, 0.95, 0.9];
      if (v < hull && v > hull - 0.3 && Math.abs(u - boatX) < 0.006) return [0.3, 0.2, 0.15];
      if (v > horizon) {
        const wave = Math.sin(u * 40 + v * 90 + seed) > 0.85 ? 0.12 : 0;
        const c = mix([0.2, 0.42, 0.6], [0.06, 0.18, 0.32], clamp((v - horizon) / (1 - horizon)));
        return [c[0] + wave, c[1] + wave, c[2] + wave];
      }
      return mix([0.45, 0.65, 0.88], [0.82, 0.9, 0.96], clamp(v / horizon));
    };
  }
  const ground = 0.7 + 0.08 * r(1),
    swap = r(2) < 0.5,
    houseX = swap ? 0.62 + 0.1 * r(3) : 0.22 + 0.1 * r(3),
    treeX = swap ? 0.2 + 0.1 * r(4) : 0.72 + 0.1 * r(4);
  return (u, v) => {
    const hx = Math.abs(u - houseX);
    if (hx < 0.035 && v > ground - 0.12 && v < ground) return [0.25, 0.18, 0.14]; // dörr
    if (hx < 0.13 && v > ground - 0.22 && v < ground) return [0.72, 0.28, 0.22];
    if (v <= ground - 0.22 && v > ground - 0.42 && hx < 0.16 * (1 - (ground - 0.22 - v) / 0.2)) return [0.3, 0.22, 0.22];
    const tx = (u - treeX) * (GW / GH),
      ty = v - (ground - 0.3);
    if (tx * tx + ty * ty < 0.16 * 0.16) return [0.2, 0.5, 0.25];
    if (Math.abs(u - treeX) < 0.025 && v > ground - 0.2 && v < ground) return [0.4, 0.27, 0.16];
    if (v >= ground) return [0.32, 0.58, 0.28];
    return mix([0.45, 0.66, 0.9], [0.86, 0.92, 0.97], clamp(v / ground));
  };
}

/** Målbilden, med 2 × 2 delpixlar för mjuka kanter. */
export function target(prompt: number, seed: number): Img {
  const paint = painter(prompt, seed);
  const out = new Float32Array(GW * GH * 3);
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++)
      for (let sy = 0; sy < 2; sy++)
        for (let sx = 0; sx < 2; sx++) {
          const c = paint((x + 0.25 + sx * 0.5) / GW, (y + 0.25 + sy * 0.5) / GH);
          for (let ch = 0; ch < 3; ch++) out[(y * GW + x) * 3 + ch] += c[ch] / 4;
        }
  return out;
}

/** Lådoskärpa med radien r (i pixlar), först vågrätt och sedan lodrätt. */
export function blur(img: Img, r: number): Img {
  if (r <= 0) return img;
  const pass = (src: Img, dx: number, dy: number) => {
    const out = new Float32Array(src.length);
    for (let y = 0; y < GH; y++)
      for (let x = 0; x < GW; x++)
        for (let ch = 0; ch < 3; ch++) {
          let sum = 0;
          for (let k = -r; k <= r; k++) {
            const xx = Math.min(GW - 1, Math.max(0, x + k * dx)),
              yy = Math.min(GH - 1, Math.max(0, y + k * dy));
            sum += src[(yy * GW + xx) * 3 + ch];
          }
          out[(y * GW + x) * 3 + ch] = sum / (2 * r + 1);
        }
    return out;
  };
  return pass(pass(img, 1, 0), 0, 1);
}

/** Startbruset: en slumpad färg per pixel, alltid samma för samma frö. */
export function noise(seed: number): Img {
  const out = new Float32Array(GW * GH * 3);
  for (let i = 0; i < out.length; i++) out[i] = hash1(seed * 1_000_003 + i);
  return out;
}

const MAX_BLUR = 6;
const cache = new Map<string, { levels: Img[]; noise: Img }>();
function prepared(prompt: number, seed: number) {
  const key = `${prompt}:${seed}`;
  let v = cache.get(key);
  if (!v) {
    const t = target(prompt, seed);
    const levels: Img[] = [];
    for (let r = 0; r <= MAX_BLUR; r++) levels.push(r === 0 ? t : blur(levels[r - 1], 1));
    v = { levels, noise: noise(seed) };
    cache.set(key, v);
  }
  return v;
}

/** Hur långt förloppet har kvar efter `step` av STEPS steg (1 = början). */
const remaining = (step: number) => 1 - clamp(step / STEPS);

/** Hur mycket brus som finns kvar efter `step` steg (1 = bara brus). Mest brus försvinner tidigt. */
export const noiseLeft = (step: number) => Math.pow(remaining(step), 1.5);

/**
 * Bilden efter `step` steg (får vara ett decimaltal). Bruset minskar, och
 * oskärpan minskar också, så de stora formerna kommer före detaljerna.
 */
export function frame(prompt: number, seed: number, step: number): Img {
  const { levels, noise: n } = prepared(prompt, seed);
  const s = remaining(step);
  const r = s * MAX_BLUR,
    r0 = Math.floor(r),
    r1 = Math.min(MAX_BLUR, r0 + 1),
    f = r - r0;
  const a = levels[r0],
    b = levels[r1];
  const k = noiseLeft(step);
  const out = new Float32Array(a.length);
  for (let i = 0; i < out.length; i++) out[i] = lerp(lerp(a[i], b[i], f), n[i], k);
  return out;
}

/** Medelavvikelse mellan två bilder, i [0,1]. */
export function distance(a: Img, b: Img): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}
