// Fellandskapet som höjdkarta (bandad, med höjdlinjer). Delas av modulens scen
// och spelet Gradientgolf.

import { clamp, fract, lerp } from '@nastasteg/engine/core/math';
import { PALETTE as C } from '@nastasteg/engine/module/canvas';
import { DOMAIN, loss } from './descent';

const BG = [7, 9, 11];

/** Ritar landskapet i `canvas` med storleken w × h pixlar. */
export function paintLandscape(canvas: HTMLCanvasElement, w: number, h: number) {
  canvas.width = w;
  canvas.height = h;
  const hc = canvas.getContext('2d')!;
  const img = hc.createImageData(w, h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const x = lerp(DOMAIN.x0, DOMAIN.x1, (i + 0.5) / w);
      const y = lerp(DOMAIN.y1, DOMAIN.y0, (j + 0.5) / h);
      const v = Math.sqrt(Math.max(loss(x, y) + 0.4, 0)) / 3.8;
      const band = Math.floor(clamp(v) * 14) / 14;
      const edge = fract(v * 14) < 0.07 ? 0.12 : 0;
      const m = 0.04 + 0.42 * band + edge;
      const o = (j * w + i) * 4;
      for (let c = 0; c < 3; c++) img.data[o + c] = lerp(BG[c], C.cold[c], m);
      img.data[o + 3] = 255;
    }
  }
  hc.putImageData(img, 0, 0);
}
