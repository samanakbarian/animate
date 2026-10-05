// Scenen: överst texten som token-rutor (med sina id-nummer), nedanför
// staplar med sannolikheten för de åtta mest troliga nästa tokens. Den token
// som dras markeras och glider in som nästa ruta.

import { clamp, smoothstep } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { PROMPTS } from './corpus';
import { MODEL, generate, tokenize } from './model';
import { MAX_TOKENS } from './timeline';

const TOP = 8;

export function createLanguageScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;
  const vocabIndex = new Map(MODEL.vocab.map((w, i) => [w, i]));

  function box(x: number, y: number, w: number, h: number, fill: string, stroke: string) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();
    ctx.stroke();
  }

  return {
    resize: S.resize,
    render(t: number, params: Params, mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const promptText = PROMPTS[Math.round(clamp(params.prompt, 0, PROMPTS.length - 1))];
      const stepsF = clamp(params.steps, 0, MAX_TOKENS);
      const n = Math.floor(stepsF + 1e-6);
      const frac = stepsF - n; // 0..1 medan nästa token ”dras” i filmen
      const temp = Math.round(params.temp * 20) / 20;
      const seed = Math.round(params.seed);
      const gen = generate(promptText, MAX_TOKENS, temp, seed);
      const promptLen = tokenize(promptText).length;
      const shown = gen.tokens.slice(0, promptLen + n);
      const dist = gen.dists[n];
      const next = n < MAX_TOKENS ? gen.tokens[promptLen + n] : null;

      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- texten som token-rutor
      const fs = 2.3 * s;
      const pad = 0.9 * s;
      const lineH = fs * 2.9;
      const x0 = W * 0.05,
        maxX = W * 0.95;
      let x = x0,
        y = tall ? H * 0.05 : H * 0.08;
      const showIds = mode === 'film' ? 1 - smoothstep(20, 24, t) * 0.6 : 0.4;
      const place = (tok: string) => {
        ctx.font = `${fs}px ${'"JetBrains Mono", monospace'}`;
        const w = ctx.measureText(tok).width + pad * 2;
        if (x + w > maxX) {
          x = x0;
          y += lineH;
        }
        const at = { x, y, w };
        x += w + 0.6 * s;
        return at;
      };
      shown.forEach((tok, i) => {
        const at = place(tok);
        const isPrompt = i < promptLen;
        const newest = !isPrompt && i === shown.length - 1;
        box(
          at.x,
          at.y,
          at.w,
          fs * 1.7,
          isPrompt ? C.surface : newest ? rgba(C.warm, 0.22) : rgba(C.cold, 0.1),
          isPrompt ? C.line : newest ? rgba(C.warm, 0.9) : rgba(C.cold, 0.45),
        );
        S.text(tok, at.x + pad, at.y + fs * 0.85, fs, isPrompt ? C.dim : C.ink);
        S.text(String(vocabIndex.get(tok) ?? '?'), at.x + at.w / 2, at.y + fs * 2.15, fs * 0.55, rgba([154, 165, 176], showIds), 'center');
      });
      // nästa token glider in medan den dras
      if (next && frac > 0) {
        const at = place(next);
        const a = smoothstep(0.35, 1, frac);
        ctx.globalAlpha = a;
        box(at.x, at.y + (1 - a) * fs, at.w, fs * 1.7, rgba(C.warm, 0.22), rgba(C.warm, 0.9));
        S.text(next, at.x + pad, at.y + (1 - a) * fs + fs * 0.85, fs, C.ink);
        ctx.globalAlpha = 1;
      } else {
        // markör
        const at = place('▌');
        if (Math.floor(t * 2) % 2 === 0 || mode === 'explore') S.text('▌', at.x + 0.2 * s, at.y + fs * 0.85, fs, rgba(C.warm, 0.9));
      }

      // --- staplarna
      // på bred yta: höger del, fritt från berättartexten nere till vänster
      const bx = tall ? W * 0.06 : W * 0.57;
      const bw = tall ? W * 0.88 : W * 0.38;
      const by = tall ? H * 0.43 : H * 0.42;
      const bh = tall ? H * 0.33 : H * 0.48;
      S.text('nästa token', bx, by, 1.6 * s, C.dim);
      S.text(`temperatur ${formatNumber(temp)} · frö ${seed}`, bx + bw, by, 1.6 * s, C.dim, 'right');
      const top = dist.slice(0, TOP);
      const rowH = (bh - 3 * s) / TOP;
      const labelW = bw * 0.26;
      const maxP = Math.max(0.25, top[0].p);
      top.forEach((c, i) => {
        const ry = by + 3 * s + i * rowH;
        const chosen = next !== null && c.token === next && (mode === 'explore' || frac > 0 || n === MAX_TOKENS);
        const len = (bw - labelW - 7 * s) * (c.p / maxP);
        ctx.fillStyle = chosen ? rgba(C.warm, 0.95) : rgba(C.cold, 0.55);
        ctx.fillRect(bx + labelW, ry + rowH * 0.18, Math.max(1, len), rowH * 0.64);
        S.text(c.token, bx + labelW - 1.2 * s, ry + rowH / 2, 1.9 * s, chosen ? C.ink : C.dim, 'right');
        S.text(`${Math.round(c.p * 1000) / 10} %`.replace('.', ','), bx + labelW + len + 1 * s, ry + rowH / 2, 1.6 * s, C.dim);
      });
      const rest = 1 - top.reduce((acc, c) => acc + c.p, 0);
      S.text(`övriga ${MODEL.vocab.length - TOP} tokens: ${Math.round(rest * 100)} %`, bx + labelW, by + bh + 1.2 * s, 1.5 * s, C.dim);
    },
    dispose: S.dispose,
  };
}
