// Bilden i pixlar, filtrets karta bredvid och under dem filtrets nio vikter.
// Till höger (under på mobil): hur mycket av varje sorts kant och modellens svar.

import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { SHOW } from './timeline';
import { FILTERS, N, SHAPES, classify, convolve, edgeProfile, picture } from './vision';

const SHAPE_WITH_ARTICLE = ['en kvadrat', 'en triangel', 'en cirkel', 'ett kryss'];

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const film = mode === 'film';
    const shape = Math.round(params.shape),
      f = Math.round(params.filter);
    const img = picture(shape, Math.round(params.noise * 20) / 20);
    const map = convolve(img, f);
    const shown = Math.round(params.scan * N * N);
    const showNumbers = film && t < SHOW.numbersUntil;
    const showEdges = !film || t >= SHOW.edgesFrom;
    const showAnswer = !film || t >= SHOW.answerFrom;
    S.clear();

    // på mobil visas bilden stor medan talen syns, annars går de inte att läsa
    const big = T && showNumbers;
    const A = big ? Math.min(W * 0.8, H * 0.6) : T ? W * 0.38 : Math.min(W * 0.26, H * 0.46);
    const cell = A / N;
    const x0 = big ? (W - A) / 2 : T ? W * 0.07 : W * 0.05;
    const x1 = T ? W * 0.53 : x0 + A + 4 * s;
    const top = T ? H * 0.06 : H * 0.14;
    S.text('BILDEN', x0, top - 2 * s, 1.3 * s, C.dim);
    if (!big)
      S.text(
        T ? FILTERS[f].short.toUpperCase() + '-FILTRETS SVAR' : `FILTER: ${FILTERS[f].name.toUpperCase()}`,
        x1,
        top - 2 * s,
        1.3 * s,
        C.dim,
      );

    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        const v = img[i];
        const g = Math.round(v * 232);
        ctx.fillStyle = `rgb(${g},${g},${Math.min(255, g + 6)})`;
        ctx.fillRect(x0 + x * cell, top + y * cell, cell + 0.5, cell + 0.5);
        if (showNumbers && cell > 1.4 * s)
          S.text(String(Math.round(v * 9)), x0 + (x + 0.5) * cell, top + (y + 0.5) * cell, cell * 0.55, v > 0.5 ? '#111' : C.dim, 'center');
        // kartan: varmt där svaret är positivt, kallt där det är negativt
        if (i < shown && !big) {
          const r = map[i];
          ctx.fillStyle = rgba(r >= 0 ? C.warm : C.cold, Math.min(1, Math.abs(r) / 2.5));
          ctx.fillRect(x1 + x * cell, top + y * cell, cell + 0.5, cell + 0.5);
        }
      }
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 - 0.5, top - 0.5, A + 1, A + 1);
    if (!big) ctx.strokeRect(x1 - 0.5, top - 0.5, A + 1, A + 1);

    // filtrets ruta där det är just nu
    if (shown > 0 && shown < N * N) {
      const cx = shown % N,
        cy = Math.floor(shown / N);
      ctx.strokeStyle = rgba(C.warm, 1);
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + (cx - 1) * cell, top + (cy - 1) * cell, cell * 3, cell * 3);
      ctx.strokeRect(x1 + cx * cell, top + cy * cell, cell, cell);
      ctx.lineWidth = 1;
    }

    if (big) return;

    // filtrets vikter
    const ky = top + A + (T ? 2 : 4) * s;
    const kc = T ? 2 * s : 2.8 * s;
    const kx = x1;
    if (!T) S.text('VIKTER', kx + kc * 3 + 1.5 * s, ky + kc * 1.5, 1.2 * s, C.dim);
    FILTERS[f].w.forEach((w, i) => {
      const cx = kx + (i % 3) * kc,
        cy = ky + Math.floor(i / 3) * kc;
      ctx.fillStyle = w === 0 ? C.surface : rgba(w > 0 ? C.warm : C.cold, 0.75);
      ctx.fillRect(cx, cy, kc - 1, kc - 1);
      S.text(w > 0 ? '+1' : w < 0 ? '−1' : '0', cx + kc / 2, cy + kc / 2, 1.1 * s, C.ink, 'center');
    });
    if (T) S.text('VIKTER', x0, ky + kc * 1.5, 1.2 * s, C.dim);

    // panelen
    const px = T ? x0 : x1 + A + 6 * s;
    const pw = T ? W * 0.86 : W * 0.95 - px;
    let py = T ? ky + kc * 3 + 2.5 * s : top;
    if (showEdges) {
      const prof = edgeProfile(img);
      S.text('HITTADE KANTER', px, py, 1.3 * s, C.dim);
      py += 2.6 * s;
      const colW = pw / 4;
      FILTERS.forEach((fl, i) => {
        const cx = px + i * colW;
        const bw = colW - 1.5 * s;
        ctx.fillStyle = C.line;
        ctx.fillRect(cx, py + 1.8 * s, bw, 1.2 * s);
        ctx.fillStyle = rgba(C.cold, i === f ? 1 : 0.6);
        ctx.fillRect(cx, py + 1.8 * s, bw * Math.min(1, prof[i] / 0.5), 1.2 * s);
        S.text(`${fl.short}  ${Math.round(prof[i] * 100)} %`, cx, py, (T ? 1.3 : 1.4) * s, i === f ? C.ink : C.dim);
      });
      py += (T ? 5.5 : 8) * s;
    }
    if (showAnswer) {
      const p = classify(img);
      const best = p.indexOf(Math.max(...p));
      S.text('SVAR', px, py, 1.3 * s, C.dim);
      const wrong = shape !== best ? `Fel! Det är ${SHAPE_WITH_ARTICLE[shape]}.` : '';
      // på mobil står felet på rubrikraden och svaren i fyra kolumner
      if (T && wrong) S.text(wrong, px + pw, py, 1.3 * s, rgba(C.warm, 1), 'right', 'Inter, sans-serif');
      py += (T ? 2.4 : 2.8) * s;
      const colW = T ? pw / 4 : pw;
      SHAPES.forEach((name, i) => {
        const cx = px + (T ? i * colW : 0),
          cy = py + (T ? 0 : i * 4 * s);
        const bw = colW - 1.5 * s;
        const isBest = i === best;
        const color = isBest ? C.ink : C.dim;
        if (T) S.text(`${name} ${Math.round(p[i] * 100)} %`, cx, cy, 1.25 * s, color);
        else {
          S.text(name, cx, cy, 1.5 * s, color, 'left', 'Inter, sans-serif');
          S.text(`${Math.round(p[i] * 100)} %`, cx + bw, cy, 1.5 * s, color, 'right');
        }
        ctx.fillStyle = C.line;
        ctx.fillRect(cx, cy + 1.6 * s, bw, 1 * s);
        ctx.fillStyle = rgba(isBest ? C.warm : C.cold, isBest ? 0.95 : 0.6);
        ctx.fillRect(cx, cy + 1.6 * s, bw * p[i], 1 * s);
      });
      if (!T && wrong) S.text(wrong, px, py + 16 * s, 1.4 * s, rgba(C.warm, 1), 'left', 'Inter, sans-serif');
    }
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
