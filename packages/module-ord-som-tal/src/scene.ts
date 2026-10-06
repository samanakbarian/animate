// Scenen: vänster – ett långt ord delat i tokens med nummer, och inbäddningarna
// för räkneexemplets ord som rader av färgade rutor. Höger – kartan där orden
// ligger, med pilarna a − b + c och svaret inringat.

import { clamp, smoothstep } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { ANALOGIES, DIMS, EMBEDDINGS, LONG_WORDS, WORDS, project, solve, tokenId, tokenize } from './embeddings';

const MONO = '"JetBrains Mono", monospace';

export function createEmbeddingScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;
  const pts = WORDS.map((w) => project(EMBEDDINGS[w]));
  const xsP = pts.map((p) => p[0]),
    ysP = pts.map((p) => p[1]);
  const bounds = { x0: Math.min(...xsP), x1: Math.max(...xsP), y0: Math.min(...ysP), y1: Math.max(...ysP) };

  function arrow(x0: number, y0: number, x1: number, y1: number, color: string, w: number) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0),
      h = 4 + w * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - h * Math.cos(a - 0.4), y1 - h * Math.sin(a - 0.4));
    ctx.lineTo(x1 - h * Math.cos(a + 0.4), y1 - h * Math.sin(a + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  return {
    resize: S.resize,
    render(t: number, params: Params, mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const word = LONG_WORDS[Math.round(clamp(params.long, 0, LONG_WORDS.length - 1))];
      const an = ANALOGIES[Math.round(clamp(params.analogy, 0, ANALOGIES.length - 1))];
      const prog = clamp(params.arrow);
      const sol = solve(an);
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;
      const film = mode === 'film';
      const em = (a: number, b: number) => (film ? 0.35 + 0.65 * smoothstep(a, b, t) : 1);

      // --- tokens
      const tx = W * 0.05,
        ty = tall ? H * 0.05 : H * 0.08;
      S.text(word, tx, ty, 2.4 * s, C.ink);
      let x = tx;
      for (const piece of tokenize(word)) {
        ctx.font = `${2 * s}px ${MONO}`;
        const w = ctx.measureText(piece).width + 1.8 * s;
        ctx.fillStyle = rgba(C.cold, 0.12);
        ctx.strokeStyle = rgba(C.cold, 0.6);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, ty + 2.4 * s, w, 3.4 * s, 3);
        ctx.fill();
        ctx.stroke();
        S.text(piece, x + 0.9 * s, ty + 4.1 * s, 2 * s, C.ink);
        S.text(String(tokenId(piece)), x + w / 2, ty + 7.2 * s, 1.3 * s, C.dim, 'center');
        x += w + 0.8 * s;
      }

      // --- inbäddningar som rutor
      const vx = W * 0.05,
        vy = tall ? H * 0.2 : H * 0.3;
      const cw = tall ? W * 0.075 : W * 0.042,
        ch = 2.6 * s;
      ctx.globalAlpha = em(17, 20);
      DIMS.forEach((d, i) => {
        ctx.save();
        ctx.translate(vx + 13 * s + i * cw + cw / 2, vy - 0.6 * s);
        ctx.rotate(-Math.PI / 5);
        S.text(d, 0, 0, 1.2 * s, C.dim);
        ctx.restore();
      });
      const rows: [string, number[], string][] = [
        [an.a, EMBEDDINGS[an.a], C.ink],
        [`− ${an.b}`, EMBEDDINGS[an.b], C.dim],
        [`+ ${an.c}`, EMBEDDINGS[an.c], C.dim],
        [`= ${sol.answer}?`, sol.vector, C.ink],
      ];
      rows.forEach(([label, v, col], r) => {
        const ry = vy + r * (ch + 0.9 * s) + (r === 3 ? 1.2 * s : 0);
        S.text(label, vx + 12 * s, ry + ch / 2, 1.7 * s, col, 'right');
        v.forEach((val, i) => {
          const a = clamp(Math.abs(val));
          ctx.fillStyle = val >= 0 ? rgba(C.cold, 0.1 + 0.85 * a) : rgba(C.warm, 0.1 + 0.85 * a);
          ctx.fillRect(vx + 13 * s + i * cw, ry, cw - 2, ch);
          if (!tall)
            S.text(
              formatNumber(Math.abs(val) < 0.05 ? 0 : val, 1),
              vx + 13 * s + i * cw + cw / 2,
              ry + ch / 2,
              1.1 * s,
              a > 0.6 ? C.bg : C.dim,
              'center',
            );
        });
      });
      ctx.globalAlpha = 1;

      // --- kartan
      const mx = tall ? W * 0.08 : W * 0.55,
        my = tall ? H * 0.49 : H * 0.1;
      const mw = tall ? W * 0.84 : W * 0.4,
        mh = tall ? H * 0.28 : H * 0.82;
      const X = (v: number) => mx + 2 * s + ((v - bounds.x0) / (bounds.x1 - bounds.x0)) * (mw - 4 * s);
      const Y = (v: number) => my + 2 * s + ((v - bounds.y0) / (bounds.y1 - bounds.y0)) * (mh - 4 * s);
      ctx.globalAlpha = em(29, 32);
      ctx.strokeStyle = C.line;
      ctx.strokeRect(mx + 0.5, my + 0.5, mw - 1, mh - 1);
      // etiketter: prova fyra lägen runt punkten och ta det första som inte krockar
      const placed: [number, number, number, number][] = [];
      const fsz = 1.55 * s;
      WORDS.forEach((w, i) => {
        const hi = w === an.a || w === an.b || w === an.c || w === sol.answer;
        const px = X(pts[i][0]),
          py = Y(pts[i][1]);
        ctx.fillStyle = hi ? C.ink : rgba(C.cold, 0.7);
        ctx.beginPath();
        ctx.arc(px, py, hi ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `${fsz}px ${MONO}`;
        const tw = ctx.measureText(w).width;
        const options: [number, number][] = [
          [px + 1 * s, py - 1.4 * s],
          [px + 1 * s, py + 1.6 * s],
          [px - 1 * s - tw, py - 1.4 * s],
          [px - 1 * s - tw, py + 1.6 * s],
        ];
        const hit = (x: number, y: number) => placed.some(([a, b, c, d]) => x < c && x + tw > a && y - fsz / 2 < d && y + fsz / 2 > b);
        const [lx, ly] = options.find(([x, y]) => !hit(x, y)) ?? options[0];
        placed.push([lx, ly - fsz / 2, lx + tw, ly + fsz / 2]);
        S.text(w, lx, ly, fsz, hi ? C.ink : C.dim);
      });
      ctx.globalAlpha = 1;
      // pilar: b → a (riktningen som dras bort), sedan c + (a − b) → svaret
      if (prog > 0) {
        const pa = project(EMBEDDINGS[an.a]),
          pb = project(EMBEDDINGS[an.b]),
          pc = project(EMBEDDINGS[an.c]);
        const pr = project(sol.vector);
        const k1 = smoothstep(0, 0.45, prog),
          k2 = smoothstep(0.5, 1, prog);
        arrow(X(pb[0]), Y(pb[1]), X(pb[0] + (pa[0] - pb[0]) * k1), Y(pb[1] + (pa[1] - pb[1]) * k1), rgba(C.cold, 0.6), 1.5);
        if (k2 > 0) arrow(X(pc[0]), Y(pc[1]), X(pc[0] + (pr[0] - pc[0]) * k2), Y(pc[1] + (pr[1] - pc[1]) * k2), rgba(C.warm, 0.95), 2.5);
        if (prog >= 1) {
          const wi = WORDS.indexOf(sol.answer);
          ctx.strokeStyle = rgba(C.warm, 1);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(X(pts[wi][0]), Y(pts[wi][1]), 3 * s, 0, Math.PI * 2);
          ctx.stroke();
          S.text(
            `${an.a} − ${an.b} + ${an.c} ≈ ${sol.answer}  (likhet ${formatNumber(sol.similarity)})`,
            mx + mw,
            my - 1.6 * s,
            1.5 * s,
            C.ink,
            'right',
          );
        }
      }
    },
    dispose: S.dispose,
  };
}
