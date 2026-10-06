// Scenen: tre skeden som en kedja överst, frågan i en pratbubbla och de fyra
// kandidatsvaren med sannolikhetsstaplar (det troligaste är inramat). Till höger
// (under på mobil) återkopplingen: belöning per sort och de senaste jämförelserna.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { KINDS, MAX_ROUNDS, PROMPTS, REWARDS, STAGES, comparison, probabilities } from './stages';

export function createAssistantScene(host: HTMLElement): ModuleScene {
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
      const pi = Math.round(clamp(params.prompt, 0, PROMPTS.length - 1));
      const stage = Math.round(clamp(params.stage, 0, STAGES.length - 1));
      const rounds = Math.floor(clamp(params.rounds, 0, MAX_ROUNDS));
      const prompt = PROMPTS[pi];
      const probs = probabilities(stage, rounds);
      const top = probs.indexOf(Math.max(...probs));
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;
      const lx = W * 0.05,
        colW = tall ? W * 0.9 : W * 0.52;

      // --- skedena
      let y = tall ? H * 0.04 : H * 0.07;
      const sw = (colW - 2 * 2.4 * s) / 3;
      STAGES.forEach((name, i) => {
        const x = lx + i * (sw + 2.4 * s);
        const on = i === stage;
        ctx.fillStyle = on ? rgba(C.warm, 0.18) : rgba(C.cold, 0.06);
        ctx.strokeStyle = on ? rgba(C.warm, 0.9) : C.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y - 1.6 * s, sw, 3.2 * s, 3);
        ctx.fill();
        ctx.stroke();
        S.text(name, x + sw / 2, y, 1.35 * s, on ? C.ink : C.dim, 'center');
        if (i < 2) S.text('→', x + sw + 1.2 * s, y, 1.3 * s, C.dim, 'center');
      });
      y += 4.6 * s;

      // --- frågan
      const qs = (tall ? 1.8 : 1.6) * s;
      const qLines = wrap(prompt.text, colW * 0.8, qs, SANS);
      ctx.font = `${qs}px ${SANS}`;
      const qw = Math.max(...qLines.map((l) => ctx.measureText(l).width)) + 2.4 * s;
      const qh = qLines.length * qs * 1.35 + 1.6 * s;
      ctx.fillStyle = rgba(C.cold, 0.16);
      ctx.beginPath();
      ctx.roundRect(lx + colW - qw, y, qw, qh, 8);
      ctx.fill();
      qLines.forEach((l, i) => S.text(l, lx + colW - qw + 1.2 * s, y + 0.8 * s + qs * 0.68 + i * qs * 1.35, qs, C.ink, 'left', SANS));
      y += qh + 2.4 * s;

      // --- kandidatsvaren
      S.text('MODELLENS TÄNKBARA SVAR', lx, y, 1.15 * s, C.dim);
      y += 2.2 * s;
      const as = (tall ? 1.5 : 1.4) * s;
      prompt.answers.forEach((ans, i) => {
        const lines = wrap(ans, colW - 10 * s, as, SANS);
        const lastY = y + as * 0.6 + (lines.length - 1) * as * 1.3;
        const rowH = lastY - y + as * 0.6 + 2.4 * s;
        const isTop = i === top;
        if (isTop) {
          ctx.strokeStyle = rgba(C.warm, 0.9);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(lx - 0.8 * s, y - 0.6 * s, colW + 1.6 * s, rowH, 5);
          ctx.stroke();
        }
        lines.forEach((l, j) => S.text(l, lx + 9 * s, y + as * 0.6 + j * as * 1.3, as, isTop ? C.ink : C.dim, 'left', SANS));
        S.text(`${Math.round(probs[i] * 100)} %`, lx + 7.4 * s, y + as * 0.6, 1.6 * s, isTop ? C.ink : C.dim, 'right');
        S.text(KINDS[i], lx + 9 * s, lastY + as * 0.6 + 0.9 * s, 1.05 * s, isTop ? rgba(C.warm, 1) : rgba(C.cold, 0.7));
        // stapel
        ctx.fillStyle = rgba(C.cold, 0.15);
        ctx.fillRect(lx, y + as * 1.4, 7.4 * s, 0.5 * s);
        ctx.fillStyle = isTop ? rgba(C.warm, 0.95) : rgba(C.cold, 0.6);
        ctx.fillRect(lx, y + as * 1.4, 7.4 * s * probs[i], 0.5 * s);
        y += rowH + 0.6 * s;
      });

      // --- återkopplingen
      const fb = stage === 2;
      let fx: number, fy: number, fw: number;
      if (tall) {
        fx = lx;
        fw = colW;
        fy = y + 2 * s;
      } else {
        fx = W * 0.64;
        fw = W * 0.31;
        fy = H * 0.07;
      }
      ctx.globalAlpha = fb ? 1 : 0.35;
      const title = fb ? `ÅTERKOPPLING · ${rounds} jämförelser` : 'ÅTERKOPPLING · inte än';
      if (tall) {
        // på mobil räcker en rad – staplarna får inte plats ovanför berättartexten
        S.text(
          fb ? `${title} · högst belöning: ${KINDS[REWARDS[rounds].indexOf(Math.max(...REWARDS[rounds]))]}` : title,
          fx,
          fy,
          1.2 * s,
          C.dim,
        );
        ctx.globalAlpha = 1;
        return;
      }
      S.text(title, fx, fy, 1.2 * s, C.dim);
      fy += 2.8 * s;
      const rw = REWARDS[fb ? rounds : 0];
      const bh = (tall ? 1.6 : 1.9) * s,
        mid = fx + fw * 0.62,
        span = fw * 0.36;
      ctx.strokeStyle = C.line;
      ctx.beginPath();
      ctx.moveTo(mid, fy - 1.2 * s);
      ctx.lineTo(mid, fy + 4 * (bh + 0.7 * s));
      ctx.stroke();
      KINDS.forEach((name, i) => {
        const yy = fy + i * (bh + 0.7 * s);
        S.text(name, mid - span - 1 * s, yy + bh / 2, 1.15 * s, C.dim, 'right');
        const v = clamp(rw[i] / 2.5, -1, 1);
        ctx.fillStyle = v >= 0 ? rgba(C.cold, 0.7) : rgba(C.warm, 0.7);
        ctx.fillRect(v >= 0 ? mid : mid + v * span, yy, Math.abs(v) * span, bh);
      });
      fy += 4 * (bh + 0.7 * s) + 1.6 * s;
      S.text('← lägre belöning   högre →', mid, fy, 1.05 * s, C.dim, 'center');
      fy += 3.2 * s;
      if (!tall && fb) {
        S.text('SENASTE JÄMFÖRELSER', fx, fy, 1.1 * s, C.dim);
        fy += 2.4 * s;
        for (let r = rounds; r > Math.max(0, rounds - 5); r--) {
          const c = comparison(r);
          const loser = c.winner === c.a ? c.b : c.a;
          let x = fx;
          x += S.text(`${r}. `, x, fy, 1.2 * s, C.dim);
          x += S.text(KINDS[c.winner], x, fy, 1.2 * s, C.ink, 'left', SANS);
          S.text(` före ${KINDS[loser]}`, x, fy, 1.2 * s, C.dim, 'left', SANS);
          fy += 2.1 * s;
        }
      }
      ctx.globalAlpha = 1;
    },
    dispose: S.dispose,
  };
}
