// Del 1: frågan och modellens svar som pratbubblor, och bredvid (under på mobil)
// sannolikheterna för kandidatsvaren. Svaret skrivs alltid lika säkert – det är
// bara staplarna som visar om modellen vet eller gissar.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { QUESTIONS, reply, tally } from './confidence';

export function createConfidenceScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wrap(text: string, maxW: number, size: number): string[] {
    ctx.font = `${size}px ${SANS}`;
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

  function bubble(text: string, x: number, y: number, maxW: number, size: number, right: boolean, fill: string) {
    const lines = wrap(text, maxW - 2.4 * size, size);
    ctx.font = `${size}px ${SANS}`;
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 2.4 * size;
    const h = lines.length * size * 1.35 + 1.4 * size;
    const bx = right ? x + maxW - w : x;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(bx, y, w, h, 8);
    ctx.fill();
    lines.forEach((l, i) => S.text(l, bx + 1.2 * size, y + 0.7 * size + size * 0.68 + i * size * 1.35, size, C.ink, 'left', SANS));
    return h;
  }

  return {
    resize: S.resize,
    render(_t: number, params: Params, _mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const q = QUESTIONS[Math.round(clamp(params.question, 0, QUESTIONS.length - 1))];
      const reveal = params.reveal >= 0.5;
      const threshold = clamp(params.threshold, 0, 0.9);
      const r = reply(q, threshold);
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- samtalet
      const lx = W * 0.05,
        colW = tall ? W * 0.9 : W * 0.46;
      let y = tall ? H * 0.04 : H * 0.1;
      const bs = (tall ? 1.8 : 1.7) * s;
      y += bubble(q.text, lx, y, colW, bs, true, rgba(C.cold, 0.16)) + 1.6 * s;
      S.text('MODELLEN', lx, y, 1.05 * s, C.dim);
      y += 1.6 * s;
      y += bubble(r.text, lx, y, colW, bs, false, rgba([255, 255, 255], 0.07)) + 1.8 * s;
      if (reveal) {
        const col = r.verdict === 'right' ? rgba(C.cold, 1) : r.verdict === 'wrong' ? rgba(C.warm, 1) : C.dim;
        const label = r.verdict === 'right' ? '✓ ' : r.verdict === 'wrong' ? '✗ ' : '– ';
        const truth =
          r.verdict === 'abstain'
            ? q.correct === 0
              ? `Modellen avstod, fast ${q.candidates[0].text} hade varit rätt.`
              : 'Bra. Modellen avstod i stället för att gissa.'
            : q.truth;
        const lines = wrap(label + truth, colW, 1.5 * s);
        lines.forEach((l, i) => S.text(l, lx, y + i * 1.5 * s * 1.35, 1.5 * s, col, 'left', SANS));
        y += lines.length * 1.5 * s * 1.35;
      }

      // --- staplarna
      const gx = tall ? lx : W * 0.57;
      const gw = tall ? W * 0.9 : W * 0.38;
      let gy = tall ? Math.max(y + 3 * s, H * 0.36) : H * 0.1;
      S.text('VAD MODELLEN RÄKNADE FRAM', gx, gy, 1.05 * s, C.dim);
      gy += 2.4 * s;
      const rowH = (tall ? 2.3 : 3) * s;
      const labelW = gw * 0.45;
      const barW = gw - labelW - 5 * s;
      q.candidates.forEach((c, i) => {
        const yy = gy + i * rowH;
        const picked = i === r.pick;
        const isCorrect = reveal && i === q.correct;
        S.text(c.text, gx + labelW - 1 * s, yy + rowH * 0.4, (tall ? 1.2 : 1.3) * s, picked ? C.ink : C.dim, 'right', SANS);
        ctx.fillStyle = rgba(C.cold, 0.1);
        ctx.fillRect(gx + labelW, yy + rowH * 0.15, barW, rowH * 0.5);
        ctx.fillStyle = picked ? rgba(C.warm, 0.95) : rgba(C.cold, 0.55);
        ctx.fillRect(gx + labelW, yy + rowH * 0.15, barW * c.p, rowH * 0.5);
        S.text(`${Math.round(c.p * 100)} %`, gx + labelW + barW + 0.8 * s, yy + rowH * 0.4, 1.15 * s, picked ? C.ink : C.dim);
        if (isCorrect) {
          ctx.strokeStyle = rgba(C.cold, 1);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(gx + labelW - 0.5, yy + rowH * 0.15 - 0.5, barW + 1, rowH * 0.5 + 1);
        }
      });
      // gränsen för ”vet inte”
      if (threshold > 0.001) {
        const tx = gx + labelW + barW * threshold;
        ctx.strokeStyle = C.ink;
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, gy - 0.6 * s);
        ctx.lineTo(tx, gy + q.candidates.length * rowH);
        ctx.stroke();
        ctx.setLineDash([]);
        S.text('”vet inte” under', tx, gy - 1.2 * s, 1.05 * s, C.ink, 'center');
      }
      gy += q.candidates.length * rowH + 1.6 * s;
      if (reveal) {
        S.text('ram = rätt svar', gx + labelW, gy, 1.05 * s, rgba(C.cold, 0.9));
        gy += 2.4 * s;
      }
      if (!tall || threshold > 0.001) {
        const tl = tally(threshold);
        S.text(
          `Alla sex frågor: ${tl.right} rätt · ${tl.wrong} fel · ${tl.abstain} vet inte`,
          gx,
          gy + 0.6 * s,
          1.3 * s,
          C.dim,
          'left',
          SANS,
        );
      }
    },
    dispose: S.dispose,
  };
}
