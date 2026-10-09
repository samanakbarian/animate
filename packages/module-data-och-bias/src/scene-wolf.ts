// Del 1: planet med formen (vågrätt) och snön (lodrätt). Prickarna är bilder,
// linjen är modellens gräns. Till höger: andel rätt och hur mycket snön betyder.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { type Model, type Photo, accuracy, makePhotos, pWolf, snowShare, train, trickyTest } from './learn';

const cache = new Map<number, { photos: Photo[]; model: Model }>();
function trained(snowy: number) {
  const key = Math.round(snowy * 100);
  let v = cache.get(key);
  if (!v) {
    const photos = makePhotos(80, key / 100);
    v = { photos, model: train(photos) };
    cache.set(key, v);
  }
  return v;
}
const tricky = trickyTest().slice(0, 60);

export function createWolfScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function render(_t: number, params: Params, _mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const { photos, model } = trained(params.snowy);
    const showTest = params.test >= 0.5;
    const shown = showTest ? tricky : photos;
    S.clear();

    const size = T ? Math.min(W * 0.84, H * 0.42) : Math.min(H * 0.66, W * 0.42);
    const px = T ? (W - size) / 2 : W * 0.06;
    const py = T ? H * 0.06 : H * 0.1;
    const X = (shape: number) => px + ((shape + 1) / 2) * size;
    const Y = (snow: number) => py + (1 - snow) * size;
    // snöfältet överst, gräs nederst
    ctx.fillStyle = 'rgba(232,235,238,0.06)';
    ctx.fillRect(px, py, size, size / 2);
    ctx.fillStyle = 'rgba(111,163,90,0.08)';
    ctx.fillRect(px, py + size / 2, size, size / 2);
    ctx.strokeStyle = C.line;
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
    const lf = 1.3 * s;
    S.text('snö', px + 0.8 * s, py + 1.4 * s, lf, C.dim);
    S.text('gräs', px + 0.8 * s, py + size - 1.4 * s, lf, C.dim);
    S.text('← ser ut som hund', px, py + size + 1.8 * s, lf, C.dim);
    S.text('ser ut som varg →', px + size, py + size + 1.8 * s, lf, C.dim, 'right');

    // modellens gräns: wShape·x + wSnow·(2y−1) + b = 0
    const { wShape: a, wSnow: c, b } = model;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, size, size);
    ctx.clip();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (Math.abs(c) > Math.abs(a) * 0.01) {
      for (const x of [-1, 1]) {
        const y = (-(a * x + b) / c + 1) / 2;
        if (x === -1) ctx.moveTo(X(x), Y(y));
        else ctx.lineTo(X(x), Y(y));
      }
    } else {
      const x = -(b - c) / a;
      ctx.moveTo(X(x), py);
      ctx.lineTo(X(x), py + size);
    }
    ctx.stroke();
    ctx.restore();

    // bilderna: varg = orange, hund = blå; fel får en ring
    const r = Math.max(3, size * 0.012);
    for (const p of shown) {
      const right = pWolf(model, p) > 0.5 === p.wolf;
      const x = X(p.shape),
        y = Y(p.snow);
      ctx.fillStyle = rgba(p.wolf ? C.warm : C.cold, 1);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (!right) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // siffrorna
    const sx = T ? W * 0.08 : px + size + 5 * s,
      sy = T ? py + size + 5 * s : py + 1 * s;
    const fs = 1.6 * s,
      gap = T ? 3.4 * s : 4.4 * s;
    const bar = (label: string, v: number, y: number, warn: boolean) => {
      S.text(label, sx, y, fs, C.dim);
      S.text(`${Math.round(v * 100)} %`, sx + (T ? W * 0.84 : W * 0.38), y, fs, C.ink, 'right');
      const bw = T ? W * 0.84 : W * 0.38;
      ctx.fillStyle = C.line;
      ctx.fillRect(sx, y + 1.3 * s, bw, 0.8 * s);
      ctx.fillStyle = rgba(warn ? C.warm : C.cold, 0.9);
      ctx.fillRect(sx, y + 1.3 * s, bw * clamp(v), 0.8 * s);
    };
    bar('Rätt på träningsbilderna', accuracy(model, photos), sy, false);
    bar('Rätt på svåra testbilder', accuracy(model, tricky), sy + gap, accuracy(model, tricky) < 0.6);
    bar('Hur mycket snön avgör', snowShare(model), sy + gap * 2, snowShare(model) > 0.5);
    S.text(
      showTest ? 'Visar: svåra testbilder (hund i snö, varg på gräs)' : 'Visar: träningsbilder',
      sx,
      sy + gap * 3,
      1.4 * s,
      showTest ? rgba(C.warm, 1) : C.dim,
    );
    // förklaring av färgerna
    const ly = sy + gap * 3 + 2.4 * s;
    ctx.fillStyle = rgba(C.warm, 1);
    ctx.beginPath();
    ctx.arc(sx + 0.6 * s, ly, 0.6 * s, 0, Math.PI * 2);
    ctx.fill();
    let lx = sx + 1.8 * s + S.text('varg', sx + 1.8 * s, ly, 1.35 * s, C.dim) + 2 * s;
    ctx.fillStyle = rgba(C.cold, 1);
    ctx.beginPath();
    ctx.arc(lx + 0.6 * s, ly, 0.6 * s, 0, Math.PI * 2);
    ctx.fill();
    lx += 1.8 * s + S.text('hund', lx + 1.8 * s, ly, 1.35 * s, C.dim) + 2 * s;
    S.text('○ = fel', lx, ly, 1.35 * s, C.dim);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
