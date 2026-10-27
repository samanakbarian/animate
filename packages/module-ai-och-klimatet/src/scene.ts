// Ett år av AI-användning. Vänster (överst på mobil): elen i siffror och som
// vardagssaker, och en stapel mot hushållselen i en lägenhet. Höger (under på
// mobil): koldioxid med tre sorters el, och träning jämfört med användning.
// I filmens första kapitel ritas ett datacenter, och i kapitlet om hjälp en lista.

import { hash2 } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { APARTMENT_KWH, GRIDS, TRAIN_MWH, USES, WORLD_ANSWERS, daysToTraining, fmt, fmtCo2, fmtWh, year } from './energy';
import { HELP_FROM, HELP_TO, TRAIN_FROM } from './timeline';

const INK: readonly number[] = [232, 235, 238];
const pct = (v: number) => `${fmt(v * 100)} %`;

const HELP: [string, string][] = [
  ['+', 'Väderprognoser på minuter i stället för timmar'],
  ['+', 'Förutsäga sol och vind så att elnätet räcker till'],
  ['+', 'Leta efter nya material till batterier'],
  ['−', 'Hitta mer olja och gas'],
];

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  /** Ett datacenter: rader av skåp med blinkande lampor och värme som stiger. */
  function drawDatacenter(t: number, s: number) {
    const W = S.width,
      H = S.height;
    const racks = S.tall ? 5 : 8;
    const rw = (S.tall ? 8 : 8.5) * s,
      rh = (S.tall ? 30 : 26) * s,
      gap = (S.tall ? 1.6 : 2.4) * s;
    const total = racks * rw + (racks - 1) * gap;
    const x0 = (W - total) / 2,
      y0 = H * (S.tall ? 0.12 : 0.14);
    for (let r = 0; r < racks; r++) {
      const x = x0 + r * (rw + gap);
      ctx.fillStyle = C.surface;
      ctx.fillRect(x, y0, rw, rh);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y0 + 0.5, rw - 1, rh - 1);
      for (let u = 0; u < 12; u++) {
        const uy = y0 + 1.2 * s + u * ((rh - 2.4 * s) / 12);
        ctx.fillStyle = rgba(INK, 0.06);
        ctx.fillRect(x + 0.8 * s, uy, rw - 1.6 * s, 1.3 * s);
        const on = hash2(r * 16 + u, Math.floor(t * 3 + r)) > 0.45;
        ctx.fillStyle = on ? rgba(C.cold, 0.95) : rgba(C.cold, 0.2);
        ctx.fillRect(x + rw - 2 * s, uy + 0.4 * s, 0.6 * s, 0.5 * s);
      }
      // värme som stiger
      for (let w = 0; w < 3; w++) {
        const k = (t * 0.35 + w / 3 + r * 0.13) % 1;
        const hx = x + rw * (0.25 + 0.25 * w);
        const hy = y0 - k * 6 * s;
        ctx.strokeStyle = rgba(C.warm, 0.55 * (1 - k));
        ctx.lineWidth = Math.max(1, 0.25 * s);
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(hx + 0.8 * s, hy - 1 * s, hx, hy - 2 * s);
        ctx.stroke();
      }
    }
    const ly = y0 + rh + 3 * s;
    S.text('el in', x0, ly, 1.3 * s, rgba(C.cold, 1), 'left', SANS);
    S.text('värme ut', x0 + total, ly, 1.3 * s, rgba(C.warm, 1), 'right', SANS);
  }

  function drawHelp(x: number, y: number, s: number, size: number) {
    S.text('AI KAN OCKSÅ HJÄLPA', x, y, 1.3 * s, C.dim);
    HELP.forEach(([sign, text], i) => {
      const yy = y + (3.2 + i * 2.9) * s;
      const color = sign === '+' ? rgba(C.cold, 1) : rgba(C.warm, 1);
      S.text(sign, x, yy, size * 1.1, color, 'left', SANS);
      S.text(text, x + 2.2 * s, yy, size, sign === '+' ? C.ink : C.dim, 'left', SANS);
    });
  }

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const film = mode === 'film';
    S.clear();

    if (film && t < 12) {
      drawDatacenter(t, s);
      return;
    }

    const use = USES[Math.round(params.use)];
    const perDay = Math.round(params.perDay);
    const gi = Math.round(params.grid);
    const r = year(use, perDay);
    const showTrain = !film || t >= TRAIN_FROM;
    const showHelp = film && t >= HELP_FROM && t < HELP_TO;
    const body = (T ? 1.3 : 1.4) * s;

    // elen under ett år
    const x0 = W * (T ? 0.06 : 0.05);
    const x1 = T ? W * 0.94 : W * 0.56;
    let y = T ? H * 0.04 : H * 0.08;
    S.text(use.title.toUpperCase(), x0, y, 1.4 * s, C.ink);
    S.text(`${perDay} per dag · ett år`, x1, y, 1.2 * s, C.dim, 'right');
    y += 2.8 * s;
    S.text(`${fmtWh(use.wh)} per gång`, x0, y, 1.2 * s, C.dim, 'left', SANS);
    y += (T ? 4 : 4.6) * s;
    S.text(fmtWh(r.kwh * 1000), x0, y, (T ? 3.6 : 4.2) * s, C.ink, 'left', SANS);
    y += (T ? 3.8 : 4.6) * s;
    const comps = [`som att ladda mobilen ${fmt(r.phones)} gånger`, `som att köra elbil ${fmt(r.evKm)} km`];
    // på mobil får bara två jämförelser plats
    if (!T) comps.push(`som att koka ${fmt(r.liters)} liter vatten`);
    for (const c of comps) {
      S.text(c, x0, y, body, C.dim, 'left', SANS);
      y += (T ? 2.3 : 2.5) * s;
    }
    y += 1 * s;
    S.text(`Andel av hushållselen i en lägenhet (${fmt(APARTMENT_KWH)} kWh per år)`, x0, y, 1.15 * s, C.dim, 'left', SANS);
    y += 1.4 * s;
    const barMax = x1 - x0 - 7 * s;
    const bh = 1.4 * s;
    ctx.fillStyle = rgba(INK, 0.12);
    ctx.fillRect(x0, y, barMax, bh);
    const fill = Math.min(1, r.apartment);
    ctx.fillStyle = rgba(r.apartment > 1 ? C.warm : C.cold, 0.95);
    ctx.fillRect(x0, y, Math.max(1, barMax * fill), bh);
    S.text(pct(r.apartment), x0 + barMax + 1 * s, y + bh / 2, 1.15 * s, r.apartment > 1 ? rgba(C.warm, 1) : C.dim);
    y += bh;

    // utsläpp, eller listan om hjälp
    const px = T ? x0 : W * 0.63;
    const pw = T ? x1 - x0 : W * 0.95 - px;
    let py = T ? y + 2.6 * s : H * 0.08;
    if (showHelp) {
      drawHelp(px, py, s, body);
      return;
    }
    S.text('KOLDIOXID PER ÅR', px, py, 1.3 * s, C.dim);
    py += (T ? 2.6 : 3.2) * s;
    const maxCo2 = r.co2[r.co2.length - 1];
    GRIDS.forEach((g, i) => {
      const on = i === gi;
      S.text(`${g.title}, ${g.g} g per kWh`, px, py, 1.2 * s, on ? C.ink : C.dim, 'left', SANS);
      S.text(fmtCo2(r.co2[i]), px + pw, py, (on ? 1.5 : 1.25) * s, on ? rgba(C.warm, 1) : C.dim, 'right', SANS);
      const by = py + 1.3 * s;
      ctx.fillStyle = on ? rgba(C.warm, 0.9) : rgba(INK, 0.18);
      ctx.fillRect(px, by, Math.max(1, (pw * r.co2[i]) / maxCo2), (T ? 0.7 : 1) * s);
      py += (T ? 3 : 4) * s;
    });

    if (!showTrain) return;
    py += (T ? 0.6 : 2) * s;
    S.text('TRÄNING OCH ANVÄNDNING', px, py, 1.3 * s, C.dim);
    py += (T ? 2.4 : 3) * s;
    const perDayMwh = (WORLD_ANSWERS * USES[0].wh) / 1e6;
    const rows: [string, number, string][] = [
      ['Träna GPT-3, en gång', TRAIN_MWH, rgba(C.cold, 0.95)],
      [`En miljard korta svar, varje dag`, perDayMwh, rgba(C.warm, 0.9)],
    ];
    for (const [label, mwh, color] of rows) {
      S.text(label, px, py, 1.2 * s, C.ink, 'left', SANS);
      S.text(`${fmt(mwh)} MWh`, px + pw, py, 1.2 * s, C.dim, 'right', SANS);
      ctx.fillStyle = color;
      ctx.fillRect(px, py + 1.2 * s, Math.max(1, (pw * mwh) / TRAIN_MWH), (T ? 0.7 : 1) * s);
      py += (T ? 2.9 : 3.6) * s;
    }
    S.text(`Efter ${fmt(daysToTraining())} dagar har svaren krävt mer el än träningen.`, px, py, 1.15 * s, C.dim, 'left', SANS);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
