// Scenen: fellandskapet som höjdkarta med en boll som rullar nedför, banan den
// tagit och nästa steg som pil. Bredvid (under på mobil) felkurvan per steg.

import { clamp, fract, lerp, smoothstep } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { DOMAIN, MAX_STEPS, STARTS, gradient, loss, run } from './descent';

const LOSS_MAX = 8;
const BG = [7, 9, 11];

export function createDescentScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;
  const heat = document.createElement('canvas');
  let heatKey = '';

  // Höjdkartan räknas om bara när kartans storlek ändras.
  function paintHeat(w: number, h: number) {
    const key = `${w}x${h}`;
    if (key === heatKey) return;
    heatKey = key;
    heat.width = w;
    heat.height = h;
    const hc = heat.getContext('2d')!;
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

  return {
    resize: S.resize,
    render(t: number, params: Params, mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const lr = clamp(params.lr, 0.01, 0.7);
      const start = Math.round(clamp(params.start, 0, STARTS.length - 1));
      const steps = clamp(params.steps, 0, MAX_STEPS);
      const r = run(start, lr);
      const n = Math.floor(steps),
        f = steps - n;
      const film = mode === 'film';
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- layout
      const aspect = (DOMAIN.x1 - DOMAIN.x0) / (DOMAIN.y1 - DOMAIN.y0);
      let mx: number, my: number, mw: number, mh: number;
      let gx: number, gy: number, gw: number, gh: number;
      if (tall) {
        mx = W * 0.08;
        mw = W * 0.84;
        mh = mw / aspect;
        my = H * 0.03;
        gx = W * 0.14;
        gw = W * 0.78;
        gy = my + mh + 11 * s;
        gh = H * 0.11;
      } else {
        mh = H * 0.64;
        mw = Math.min(mh * aspect, W * 0.56);
        mh = mw / aspect;
        mx = W * 0.04;
        my = H * 0.06;
        gx = W * 0.63;
        gw = W * 0.33;
        gy = H * 0.12;
        gh = H * 0.42;
      }
      paintHeat(Math.max(2, Math.round(mw / 2)), Math.max(2, Math.round(mh / 2)));
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(heat, mx, my, mw, mh);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx + 0.5, my + 0.5, mw - 1, mh - 1);
      const X = (v: number) => mx + ((v - DOMAIN.x0) / (DOMAIN.x1 - DOMAIN.x0)) * mw;
      const Y = (v: number) => my + ((DOMAIN.y1 - v) / (DOMAIN.y1 - DOMAIN.y0)) * mh;
      S.text('vikt w₁ →', mx + mw - 0.8 * s, my + mh - 1.4 * s, 1.3 * s, C.dim, 'right');
      ctx.save();
      ctx.translate(mx + 1.4 * s, my + mh - 0.8 * s);
      ctx.rotate(-Math.PI / 2);
      S.text('vikt w₂ →', 0, 0, 1.3 * s, C.dim);
      ctx.restore();
      // markeringar: lägsta felet och gropen
      const mark = (x: number, y: number, label: string) => {
        ctx.strokeStyle = rgba(C.cold, 0.8);
        ctx.lineWidth = 1;
        const px = X(x),
          py = Y(y),
          d = 0.7 * s;
        ctx.beginPath();
        ctx.moveTo(px - d, py - d);
        ctx.lineTo(px + d, py + d);
        ctx.moveTo(px + d, py - d);
        ctx.lineTo(px - d, py + d);
        ctx.stroke();
        S.text(label, px + 1.2 * s, py + 1.6 * s, 1.25 * s, C.dim);
      };
      mark(0, 0, 'lägst fel');
      mark(-2.08, -0.5, 'grop');

      // --- banan
      ctx.save();
      ctx.beginPath();
      ctx.rect(mx, my, mw, mh);
      ctx.clip();
      const pos = (i: number): [number, number] => r.path[Math.min(i, MAX_STEPS)];
      const cur: [number, number] = n < MAX_STEPS ? [lerp(pos(n)[0], pos(n + 1)[0], f), lerp(pos(n)[1], pos(n + 1)[1], f)] : pos(n);
      ctx.strokeStyle = rgba(C.warm, 0.55);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(pos(0)[0]), Y(pos(0)[1]));
      for (let i = 1; i <= n; i++) ctx.lineTo(X(pos(i)[0]), Y(pos(i)[1]));
      ctx.lineTo(X(cur[0]), Y(cur[1]));
      ctx.stroke();
      ctx.fillStyle = rgba(C.warm, 0.8);
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.arc(X(pos(i)[0]), Y(pos(i)[1]), 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // nästa steg som pil: −steglängd · gradient
      const diverged = r.divergedAt >= 0 && n >= r.divergedAt;
      if (!diverged && n < MAX_STEPS) {
        const [ggx, ggy] = gradient(cur[0], cur[1]);
        const nx = cur[0] - lr * ggx,
          ny = cur[1] - lr * ggy;
        const a = film ? 0.25 + 0.75 * smoothstep(12, 15, t) : 1;
        const x0 = X(cur[0]),
          y0 = Y(cur[1]),
          x1 = X(nx),
          y1 = Y(ny);
        ctx.strokeStyle = rgba([232, 235, 238], 0.85 * a);
        ctx.fillStyle = rgba([232, 235, 238], 0.85 * a);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        const ang = Math.atan2(y1 - y0, x1 - x0),
          hd = 7;
        if (Math.hypot(x1 - x0, y1 - y0) > hd) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 - hd * Math.cos(ang - 0.4), y1 - hd * Math.sin(ang - 0.4));
          ctx.lineTo(x1 - hd * Math.cos(ang + 0.4), y1 - hd * Math.sin(ang + 0.4));
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.fillStyle = rgba(C.warm, 1);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(X(cur[0]), Y(cur[1]), 0.9 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // --- felkurvan
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      S.text('fel', gx, gy - 1.8 * s, 1.4 * s, C.dim);
      S.text('steg →', gx + gw, gy - 1.8 * s, 1.3 * s, C.dim, 'right');
      for (const v of [0, 4, 8]) S.text(String(v), gx - 0.8 * s, gy + gh - (v / LOSS_MAX) * gh, 1.2 * s, C.dim, 'right');
      if (!tall) for (const v of [0, 30, 60]) S.text(String(v), gx + (v / MAX_STEPS) * gw, gy + gh + 1.8 * s, 1.2 * s, C.dim, 'center');
      const LX = (i: number) => gx + (i / MAX_STEPS) * gw;
      const LY = (v: number) => gy + gh - clamp(v / LOSS_MAX) * gh;
      ctx.strokeStyle = rgba(C.warm, 0.95);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(LX(0), LY(r.losses[0]));
      for (let i = 1; i <= n; i++) ctx.lineTo(LX(i), LY(r.losses[i]));
      if (n < MAX_STEPS) ctx.lineTo(LX(n + f), LY(lerp(r.losses[n], r.losses[n + 1], f)));
      ctx.stroke();

      // --- siffror
      const curLoss = loss(cur[0], cur[1]);
      const tx = tall ? mx : gx,
        ty = tall ? my + mh + 2.6 * s : gy + gh + 6 * s;
      S.text(`steg ${n} · fel ${formatNumber(curLoss)} · steglängd ${formatNumber(lr)}`, tx, ty, (tall ? 1.6 : 1.45) * s, C.ink);
      let note = '';
      if (diverged) note = `Bollen flög iväg i steg ${r.divergedAt}.`;
      else if (n >= 30 && Math.hypot(cur[0] + 2.08, cur[1] + 0.5) < 0.35) note = 'Fast i gropen – dalens botten har fel 0.';
      else if (n >= 30 && curLoss < 0.05) note = 'Framme vid dalens botten.';
      else if (n >= 40 && lr <= 0.04) note = 'För korta steg – det går långsamt.';
      else if (n >= 10 && lr >= 0.45) note = 'För långa steg – bollen studsar över dalen.';
      if (note) S.text(note, tx, ty + 2.6 * s, 1.5 * s, rgba(C.warm, 1), 'left', '"Inter", sans-serif');
    },
    dispose: S.dispose,
  };
}
