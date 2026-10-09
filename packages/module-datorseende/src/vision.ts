// Ett litet faltningsnätverk som går att räkna för hand. En bild på 16 × 16
// pixlar, fyra kantfilter på 3 × 3 och ett sista steg som jämför hur mycket
// av varje sorts kant bilden har med hur det brukar se ut för varje form.
//
// Förenkling (står också på modulsidan): filtren är handskrivna och svaret
// jämförs med fyra förebilder. I ett riktigt nätverk lärs filtren in, och det
// finns många lager och tusentals filter.

import { clamp, hash2 } from '@nastasteg/engine/core/math';

export const N = 16;
export const SHAPES = ['kvadrat', 'triangel', 'cirkel', 'kryss'] as const;

/** Varje filter är 3 × 3 vikter, rad för rad. */
export const FILTERS = [
  { name: 'lodräta kanter', short: '|', w: [-1, 0, 1, -1, 0, 1, -1, 0, 1] },
  { name: 'vågräta kanter', short: '—', w: [-1, -1, -1, 0, 0, 0, 1, 1, 1] },
  { name: 'sneda kanter \\', short: '\\', w: [0, 1, 1, -1, 0, 1, -1, -1, 0] },
  { name: 'sneda kanter /', short: '/', w: [1, 1, 0, 1, 0, -1, 0, -1, -1] },
] as const;

/** Gråskalebild, rad för rad, 0 = svart och 1 = vit. */
export type Gray = Float32Array;

function inside(shape: number, x: number, y: number): boolean {
  // x, y i [0,1]
  const cx = x - 0.5,
    cy = y - 0.5;
  if (shape === 0) return Math.abs(cx) < 0.3 && Math.abs(cy) < 0.3;
  if (shape === 1) return y > 0.24 && y < 0.74 && Math.abs(cx) < ((y - 0.24) / 0.5) * 0.44;
  if (shape === 2) return cx * cx + cy * cy < 0.33 * 0.33;
  const w = 0.09;
  return Math.abs(cx) < 0.36 && Math.abs(cy) < 0.36 && (Math.abs(cx - cy) < w || Math.abs(cx + cy) < w);
}

/** Formen med mjuka kanter (4 × 4 delpunkter per pixel) och eventuellt brus. */
export function picture(shape: number, noise = 0): Gray {
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let v = 0;
      for (let sy = 0; sy < 4; sy++)
        for (let sx = 0; sx < 4; sx++) v += inside(shape, (x + (sx + 0.5) / 4) / N, (y + (sy + 0.5) / 4) / N) ? 1 : 0;
      v /= 16;
      if (noise > 0) v = clamp(v + noise * (hash2(x + 31 * shape, y + 97) * 2 - 1));
      out[y * N + x] = v;
    }
  return out;
}

/** Filtrets svar i varje pixel. Utanför bilden räknas som svart. */
export function convolve(img: Gray, f: number): Float32Array {
  const w = FILTERS[f].w;
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let s = 0;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const xx = x + i,
            yy = y + j;
          if (xx >= 0 && yy >= 0 && xx < N && yy < N) s += img[yy * N + xx] * w[(j + 1) * 3 + (i + 1)];
        }
      out[y * N + x] = s;
    }
  return out;
}

/**
 * Hur mycket av varje sorts kant bilden har, som andelar som summerar till 1.
 * Varje pixel räknas bara till det filter som svarar starkast där.
 */
export function edgeProfile(img: Gray): number[] {
  const maps = FILTERS.map((_, f) => convolve(img, f));
  const e = FILTERS.map(() => 0);
  for (let i = 0; i < N * N; i++) {
    let best = 0;
    for (let f = 1; f < maps.length; f++) if (Math.abs(maps[f][i]) > Math.abs(maps[best][i])) best = f;
    e[best] += Math.abs(maps[best][i]);
  }
  const sum = e.reduce((a, b) => a + b, 0) || 1;
  return e.map((v) => v / sum);
}

/** Hur skarpt modellen skiljer på formerna. Högre ger säkrare svar. */
const SHARPNESS = 80;
const PROTOTYPES = SHAPES.map((_, s) => edgeProfile(picture(s)));

/** Hur säker modellen är på varje form (summerar till 1). */
export function classify(img: Gray): number[] {
  const p = edgeProfile(img);
  const scores = PROTOTYPES.map((q) => -SHARPNESS * q.reduce((a, v, i) => a + (v - p[i]) ** 2, 0));
  const m = Math.max(...scores);
  const ex = scores.map((s) => Math.exp(s - m));
  const sum = ex.reduce((a, b) => a + b, 0);
  return ex.map((v) => v / sum);
}
