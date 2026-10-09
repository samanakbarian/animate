// Del 2: tre staplar – stockholmska, skånska och snittet – och en rad som visar
// hur träningen fördelas. Snittet ser bra ut även när skånska förstås sämre.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { TOTAL_HOURS, speechResult } from './speech';

export function createSpeechScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const share = params.share;
    const r = speechResult(share);
    // i första kapitlet syns bara snittet
    const split = mode === 'explore' || t >= 12 ? 1 : 0;
    S.clear();

    // träningens fördelning
    const x0 = W * 0.08,
      x1 = W * 0.92,
      y0 = H * (T ? 0.07 : 0.1);
    S.text('TRÄNINGEN', x0, y0, 1.3 * s, C.dim);
    const bw = x1 - x0;
    const hB = TOTAL_HOURS * share;
    ctx.fillStyle = rgba(C.cold, 0.8);
    ctx.fillRect(x0, y0 + 1.6 * s, bw * (1 - share), 2.2 * s);
    ctx.fillStyle = rgba(C.warm, 0.9);
    ctx.fillRect(x0 + bw * (1 - share), y0 + 1.6 * s, bw * share, 2.2 * s);
    S.text(`${Math.round(TOTAL_HOURS - hB)} h stockholmska`, x0, y0 + 6 * s, 1.5 * s, rgba(C.cold, 1));
    S.text(`${Math.round(hB)} h skånska`, x1, y0 + 6 * s, 1.5 * s, rgba(C.warm, 1), 'right');

    // staplar: andel rätt
    const top = y0 + (T ? 12 : 13) * s;
    const bottom = H * (T ? 0.62 : 0.78);
    const hMax = bottom - top;
    const cols = [
      { label: 'Snitt', v: r.average, color: [232, 235, 238] as readonly number[], show: 1 },
      { label: 'Stockholmska', v: r.a, color: C.cold, show: split },
      { label: 'Skånska', v: r.b, color: C.warm, show: split },
    ];
    const colW = (x1 - x0) / 3;
    cols.forEach((c, i) => {
      if (!c.show) return;
      const cx = x0 + colW * (i + 0.5);
      const w = colW * 0.45;
      // skalan börjar på 50 % så att skillnaderna syns, och det står tydligt
      const h = hMax * clamp((c.v - 0.5) / 0.5);
      ctx.fillStyle = rgba(c.color, i === 0 ? 0.75 : 0.85);
      ctx.fillRect(cx - w / 2, bottom - h, w, h);
      S.text(`${Math.round(c.v * 100)} %`, cx, bottom - h - 1.6 * s, 2 * s, C.ink, 'center');
      S.text(c.label, cx, bottom + 2 * s, 1.5 * s, C.dim, 'center');
    });
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    ctx.lineTo(x1, bottom);
    ctx.stroke();
    S.text('andel rätt (skalan börjar på 50 %)', x0, bottom + 4.6 * s, 1.25 * s, C.dim);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
