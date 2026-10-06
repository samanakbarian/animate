// Del 2: varje förfrågan är en prick på en axel efter spärrens riskvärde.
// Skadliga ovanför axeln, ofarliga under. Allt till höger om gränsen nekas.
// Bredvid (under på mobil) tre exempel med text och hur det går för dem.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { EXAMPLES, N_HARMFUL, REQUESTS, score, stats } from './filter';

const BINS = 40;

export function createFilterScene(host: HTMLElement): ModuleScene {
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

  return {
    resize: S.resize,
    render(_t: number, params: Params, _mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const threshold = clamp(params.threshold, 0.2, 0.95);
      const jb = clamp(params.jailbreak);
      const retrained = params.retrained >= 0.5;
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- axeln
      const ax = W * 0.05,
        aw = tall ? W * 0.9 : W * 0.55;
      const ay = tall ? H * 0.21 : H * 0.38;
      const half = tall ? H * 0.15 : H * 0.27;
      const X = (v: number) => ax + v * aw;
      // nekas-område
      ctx.fillStyle = rgba(C.warm, 0.08);
      ctx.fillRect(X(threshold), ay - half, aw - (X(threshold) - ax), half * 2);
      S.text('besvaras', X(threshold) - 1 * s, ay - half + 1.2 * s, 1.15 * s, C.dim, 'right');
      S.text('nekas', X(threshold) + 1 * s, ay - half + 1.2 * s, 1.15 * s, rgba(C.warm, 1));
      // prickar i staplar
      const binW = aw / BINS;
      const rDot = Math.min(binW * 0.42, (half - 2 * s) / 22);
      const up = new Array(BINS).fill(0),
        down = new Array(BINS).fill(0);
      for (const r of REQUESTS) {
        const v = score(r, jb, retrained);
        const b = Math.min(BINS - 1, Math.floor(v * BINS));
        const cx = ax + (b + 0.5) * binW;
        const refused = v >= threshold;
        if (r.harmful) {
          const cy = ay - 1.2 * s - up[b]++ * rDot * 2.1 - rDot;
          ctx.fillStyle = refused ? rgba(C.warm, 0.95) : rgba(C.warm, 0.95);
          ctx.beginPath();
          ctx.arc(cx, cy, rDot, 0, Math.PI * 2);
          ctx.fill();
          if (!refused) {
            ctx.strokeStyle = C.ink;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        } else {
          const cy = ay + 1.2 * s + down[b]++ * rDot * 2.1 + rDot;
          ctx.fillStyle = refused ? rgba(C.cold, 0.35) : rgba(C.cold, 0.8);
          ctx.beginPath();
          ctx.arc(cx, cy, rDot, 0, Math.PI * 2);
          ctx.fill();
          if (refused) {
            ctx.strokeStyle = C.ink;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + aw, ay);
      ctx.stroke();
      S.text('skadliga frågor', ax, ay - half + 1.2 * s, 1.15 * s, rgba(C.warm, 0.9));
      S.text('ofarliga frågor', ax, ay + half - 0.6 * s, 1.15 * s, rgba(C.cold, 0.9));
      S.text('riskvärde enligt spärren →', ax + aw, ay + half + 1.6 * s, 1.1 * s, C.dim, 'right');
      S.text('vit ring = fel beslut', ax, ay + half + 1.6 * s, 1.1 * s, C.dim);
      // gränsen
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(threshold), ay - half);
      ctx.lineTo(X(threshold), ay + half);
      ctx.stroke();
      // exemplen som numrerade markeringar på axeln
      EXAMPLES.forEach((e, i) => {
        const v = score(e, jb, retrained);
        const px = X(v);
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.moveTo(px, ay + (e.harmful ? -0.2 : 0.2) * s);
        ctx.lineTo(px - 0.7 * s, ay + (e.harmful ? -1.1 : 1.1) * s);
        ctx.lineTo(px + 0.7 * s, ay + (e.harmful ? -1.1 : 1.1) * s);
        ctx.closePath();
        ctx.fill();
        S.text(String(i + 1), px, ay + (e.harmful ? -2 : 2) * s, 1.1 * s, C.ink, 'center');
      });

      // --- exemplen och siffrorna
      const ex = tall ? ax : W * 0.65;
      const ew = tall ? W * 0.9 : W * 0.31;
      let ey = tall ? ay + half + 4.4 * s : H * 0.1;
      const es = (tall ? 1.4 : 1.35) * s;
      EXAMPLES.forEach((e, i) => {
        const v = score(e, jb, retrained);
        const refused = v >= threshold;
        const good = refused === e.harmful;
        S.text(`${i + 1}`, ex, ey + es * 0.6, 1.2 * s, C.ink);
        const lines = wrap(`”${e.text}”`, ew - 3 * s, es);
        lines.forEach((l, j) => S.text(l, ex + 2 * s, ey + es * 0.6 + j * es * 1.3, es, C.ink, 'left', SANS));
        ey += lines.length * es * 1.3 + 0.3 * s;
        const verdict = `${e.harmful ? 'skadlig' : 'ofarlig'} · ${refused ? 'nekas' : 'besvaras'}`;
        S.text(verdict, ex + 2 * s, ey + 0.5 * s, 1.1 * s, good ? rgba(C.cold, 1) : rgba(C.warm, 1));
        ey += (tall ? 2.6 : 3.4) * s;
      });
      const st = stats(threshold, jb, retrained);
      ey += tall ? 0.4 * s : 1.4 * s;
      S.text(
        `Skadliga som slank igenom: ${st.leaked} av ${N_HARMFUL}`,
        ex,
        ey,
        1.3 * s,
        st.leaked > 0 ? rgba(C.warm, 1) : C.ink,
        'left',
        SANS,
      );
      ey += 2.3 * s;
      S.text(
        `Ofarliga som nekades: ${st.overRefused} av ${REQUESTS.length - N_HARMFUL}`,
        ex,
        ey,
        1.3 * s,
        st.overRefused > 0 ? rgba(C.warm, 1) : C.ink,
        'left',
        SANS,
      );
    },
    dispose: S.dispose,
  };
}
