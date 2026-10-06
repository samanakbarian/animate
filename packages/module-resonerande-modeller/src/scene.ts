// Scenen: uppgiften och modellens tankekedja (skrivna steg, kontroller, steg i
// huvudet och svaret). Bredvid (under på mobil) andel rätt mot antal tankesteg
// på hundra testuppgifter.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { ACCURACY, MAX_BUDGET, PROBLEMS, solve } from './solver';

export function createReasoningScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wrap(text: string, maxW: number, size: number, font: string): string[] {
    ctx.font = `${size}px ${font}`;
    const out: string[] = [];
    let line = '';
    for (const w of text.split(' ')) {
      const next = line ? `${line} ${w}` : w;
      if (ctx.measureText(next).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = next;
    }
    if (line) out.push(line);
    return out;
  }

  return {
    resize: S.resize,
    render(_t: number, params: Params, _mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const p = PROBLEMS[Math.round(clamp(params.problem, 0, PROBLEMS.length - 1))];
      const budget = Math.floor(clamp(params.budget, 0, MAX_BUDGET));
      const a = solve(p, budget);
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- uppgiften
      const lx = W * 0.05,
        colW = tall ? W * 0.9 : W * 0.5;
      let y = tall ? H * 0.04 : H * 0.07;
      S.text('UPPGIFT', lx, y, 1.2 * s, C.dim);
      y += 2.6 * s;
      const fs = (tall ? 1.85 : 1.65) * s;
      for (const l of wrap(p.text, colW, fs, SANS)) {
        S.text(l, lx, y, fs, C.ink, 'left', SANS);
        y += fs * 1.35;
      }
      y += 1.6 * s;

      // --- tankekedjan
      S.text(budget > 0 ? `TANKESTEG (${budget})` : 'INGA TANKESTEG – SVARAR DIREKT', lx, y, 1.2 * s, C.dim);
      y += 2.6 * s;
      const ls = (tall ? 1.6 : 1.5) * s,
        lh = ls * 1.65;
      const box = (yy: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(lx, yy - lh / 2 + 1, 0.35 * s, lh - 2);
      };
      a.lines.forEach((l, i) => {
        box(y, rgba(C.cold, 0.6));
        let x = lx + 1.4 * s;
        x += S.text(`${i + 1}. ${l.expr} = `, x, y, ls, C.ink);
        const wrong = l.written !== l.correct;
        const ww = S.text(String(l.written), x, y, ls, wrong ? rgba(C.warm, 1) : C.ink);
        if (wrong && l.fixed) {
          ctx.strokeStyle = rgba(C.warm, 1);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 1, y);
          ctx.lineTo(x + ww + 1, y);
          ctx.stroke();
          x += ww + 0.8 * s;
          x += S.text(String(l.correct), x, y, ls, C.ink);
        } else x += ww;
        if (!tall) S.text(p.steps[l.step].label, x + 1.6 * s, y, 1.25 * s, C.dim, 'left', SANS);
        y += lh;
      });
      // kontroller som hittar fel får en egen rad, resten slås ihop
      a.checks.forEach((c, i) => {
        if (c < 0) return;
        box(y, rgba(C.warm, 0.9));
        S.text(`kontroll ${i + 1}: steg ${c + 1} var fel – rättat`, lx + 1.4 * s, y, ls * 0.92, rgba(C.warm, 1));
        y += lh;
      });
      const clean = a.checks.filter((c) => c < 0).length;
      if (clean > 0) {
        box(y, rgba(C.warm, 0.35));
        const msg = clean === 1 ? '1 kontroll: räknar om … stämmer' : `${clean} kontroller: räknar om … stämmer`;
        S.text(msg, lx + 1.4 * s, y, ls * 0.92, C.dim);
        y += lh;
      }
      if (a.headSteps > 0) {
        box(y, rgba(C.cold, 0.15));
        const n = a.headSteps;
        S.text(`(${n} steg i huvudet, direkt i svaret)`, lx + 1.4 * s, y, ls * 0.92, C.dim);
        y += lh;
      }
      y += 0.8 * s;
      const as = 2.2 * s;
      let x = lx;
      x += S.text('Svar: ', x, y, as, C.ink, 'left', SANS);
      x += S.text(String(a.answer), x, y, as, a.ok ? C.ink : rgba(C.warm, 1), 'left', SANS);
      S.text(a.ok ? '  ✓ rätt' : `  ✗ fel (rätt svar ${a.truth})`, x, y, 1.6 * s, a.ok ? rgba(C.cold, 1) : rgba(C.warm, 1), 'left', SANS);

      // --- diagrammet
      let gx: number, gy: number, gw: number, gh: number;
      if (tall) {
        gx = W * 0.12;
        gw = W * 0.82;
        gh = H * 0.12;
        gy = Math.max(y + 7 * s, H * 0.53);
      } else {
        gx = W * 0.64;
        gw = W * 0.31;
        gy = H * 0.14;
        gh = H * 0.42;
      }
      S.text('andel rätt på 100 uppgifter', gx, gy - 2.4 * s, 1.3 * s, C.dim);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      for (const v of [0, 50, 100]) S.text(`${v} %`, gx - 0.8 * s, gy + gh - (v / 100) * gh, 1.1 * s, C.dim, 'right');
      const bw = gw / (MAX_BUDGET + 1);
      ACCURACY.forEach((acc, b) => {
        const hh = acc * gh;
        const cur = b === budget;
        ctx.fillStyle = cur ? rgba(C.warm, 0.95) : rgba(C.cold, 0.35);
        ctx.fillRect(gx + b * bw + bw * 0.18, gy + gh - hh, bw * 0.64, hh);
        S.text(String(b), gx + b * bw + bw / 2, gy + gh + 1.6 * s, 1.15 * s, cur ? C.ink : C.dim, 'center');
        if (cur) S.text(`${Math.round(acc * 100)} %`, gx + b * bw + bw / 2, gy + gh - hh - 1.4 * s, 1.3 * s, C.ink, 'center');
      });
      S.text('tankesteg →', gx + gw, gy + gh + 3.6 * s, 1.2 * s, C.dim, 'right');
    },
    dispose: S.dispose,
  };
}
