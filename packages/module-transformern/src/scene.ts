// Scenen: meningen två gånger – överst ordet som tittar, nederst orden det
// tittar på – med bågar vars tjocklek är uppmärksamheten. Till höger hela
// uppmärksamhetstabellen (varje rad är ett ord som tittar).

import { clamp, smoothstep } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { HEADS, SENTENCES, attention } from './attention';

export function createAttentionScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  return {
    resize: S.resize,
    render(t: number, params: Params, mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const sentence = SENTENCES[Math.round(clamp(params.sentence, 0, SENTENCES.length - 1))];
      const n = sentence.length;
      const focus = Math.round(clamp(params.focus, 0, n - 1));
      const head = Math.round(clamp(params.head, 0, HEADS.length - 1));
      const causal = Math.round(params.causal ?? 0) === 1;
      const A = attention(sentence, head, params.sharp, causal);
      const hidden = (i: number, j: number) => causal && j > i;
      const row = A[focus];
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- två rader med ord och bågar emellan
      const x0 = W * 0.05,
        x1 = tall ? W * 0.95 : W * 0.6;
      const yTop = tall ? H * 0.07 : H * 0.12;
      const yBot = tall ? H * 0.36 : H * 0.5;
      // placera orden efter sin bredd; krymp typsnittet om meningen inte får plats
      let fs = (tall ? 1.8 : 1.9) * s;
      const gap = 1.6 * s;
      ctx.font = `${fs}px "JetBrains Mono", monospace`;
      let widths = sentence.map((tok) => ctx.measureText(tok.text).width);
      let total = widths.reduce((a, b) => a + b, 0) + gap * (n - 1);
      if (total > x1 - x0) {
        const k = (x1 - x0) / total;
        fs *= k;
        widths = widths.map((w) => w * k);
        total = x1 - x0;
      }
      const xs: number[] = [];
      let cx = x0 + (x1 - x0 - total) / 2;
      for (const w of widths) {
        xs.push(cx + w / 2);
        cx += w + gap * (fs / ((tall ? 1.8 : 1.9) * s));
      }
      sentence.forEach((tok, i) => {
        if (hidden(focus, i)) return;
        const w = row[i];
        // båge från ordet som tittar
        ctx.strokeStyle = rgba(C.warm, 0.15 + 0.85 * clamp(w * 1.6));
        ctx.lineWidth = 0.5 + 12 * w;
        ctx.beginPath();
        ctx.moveTo(xs[focus], yTop + fs);
        ctx.bezierCurveTo(xs[focus], (yTop + yBot) / 2, xs[i], (yTop + yBot) / 2, xs[i], yBot - fs);
        ctx.stroke();
      });
      sentence.forEach((tok, i) => {
        const isFocus = i === focus;
        S.text(tok.text, xs[i], yTop, fs, isFocus ? C.ink : C.dim, 'center');
        if (isFocus) {
          ctx.strokeStyle = rgba(C.warm, 0.9);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(
            xs[i] - (ctx.measureText(tok.text).width / 2 + 0.8 * s),
            yTop - fs * 0.9,
            ctx.measureText(tok.text).width + 1.6 * s,
            fs * 1.8,
          );
        }
        const w = row[i];
        if (hidden(focus, i)) {
          // ord som inte skrivits än: en tom ruta i stället för ordet
          const tw = ctx.measureText(tok.text).width;
          ctx.strokeStyle = rgba([232, 235, 238], 0.25);
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(xs[i] - tw / 2, yBot - fs * 0.7, tw, fs * 1.4);
          ctx.setLineDash([]);
          S.text('dold', xs[i], yBot + fs * 1.4, fs * 0.72, C.dim, 'center');
          return;
        }
        S.text(tok.text, xs[i], yBot, fs, rgba([232, 235, 238], 0.35 + 0.65 * clamp(w * 2)), 'center');
        S.text(`${Math.round(w * 100)} %`, xs[i], yBot + fs * 1.4, fs * 0.72, C.dim, 'center');
      });
      S.text(`huvud: ${HEADS[head]} · ${causal ? 'bara bakåt (språkmodell)' : 'hela meningen'}`, x0, yTop - 3 * s, 1.5 * s, C.dim);

      // --- uppmärksamhetstabellen
      const emphasis = mode === 'film' ? 0.45 + 0.55 * smoothstep(60, 64, t) : 1;
      const size = tall ? Math.min(W * 0.5, H * 0.24) : Math.min(H * 0.62, W * 0.3);
      const mx = tall ? (W - size) / 2 + W * 0.08 : W * 0.66;
      const my = tall ? H * 0.47 : H * 0.12;
      const cell = size / n;
      ctx.globalAlpha = emphasis;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const w = A[i][j];
          if (hidden(i, j)) {
            // maskerad ruta: framtida ord
            ctx.strokeStyle = rgba(C.cold, 0.18);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mx + j * cell + 3, my + (i + 1) * cell - 3);
            ctx.lineTo(mx + (j + 1) * cell - 3, my + i * cell + 3);
            ctx.stroke();
            continue;
          }
          ctx.fillStyle = i === focus ? rgba(C.warm, 0.12 + 0.88 * clamp(w * 1.4)) : rgba(C.cold, 0.06 + 0.8 * clamp(w * 1.4));
          ctx.fillRect(mx + j * cell + 1, my + i * cell + 1, cell - 2, cell - 2);
        }
      const lf = Math.max(9, Math.min(cell * 0.32, 1.4 * s));
      sentence.forEach((tok, i) => {
        S.text(tok.text, mx - 0.8 * s, my + (i + 0.5) * cell, lf, i === focus ? C.ink : C.dim, 'right');
        ctx.save();
        ctx.translate(mx + (i + 0.5) * cell, my + size + 0.8 * s);
        ctx.rotate(Math.PI / 4);
        S.text(tok.text, 0, 0, lf, C.dim);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      S.text('rad = tittar · kolumn = tittas på', mx, my - 2 * s, 1.35 * s, C.dim);
    },
    dispose: S.dispose,
  };
}
