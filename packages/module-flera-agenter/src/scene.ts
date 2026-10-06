// Scenen: en tabell med rapportens tolv delar. Kolumner: vilken agent som gjorde
// delen, om den blev rätt, vad den granskande agenten och människan hittade, och
// slutresultatet. Bredvid (under på mobil) tid och antal fel som blev kvar.

import { clamp } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { PARTS, T_HUMAN, TRICKY, run } from './team';

const AGENT_COLORS: (readonly number[])[] = [C.cold, [150, 200, 170], [210, 190, 120], [190, 150, 210]];

export function createTeamScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function mark(x: number, y: number, r: number, kind: 'ok' | 'bad' | 'found') {
    ctx.lineWidth = 1.8;
    if (kind === 'ok') {
      ctx.strokeStyle = rgba(C.cold, 0.9);
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x - r * 0.3, y + r * 0.7);
      ctx.lineTo(x + r, y - r * 0.7);
      ctx.stroke();
    } else if (kind === 'bad') {
      ctx.strokeStyle = rgba(C.warm, 1);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, y - r * 0.8);
      ctx.lineTo(x + r * 0.8, y + r * 0.8);
      ctx.moveTo(x + r * 0.8, y - r * 0.8);
      ctx.lineTo(x - r * 0.8, y + r * 0.8);
      ctx.stroke();
    } else {
      ctx.strokeStyle = rgba(C.warm, 1);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  return {
    resize: S.resize,
    render(_t: number, params: Params, _mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const workers = Math.round(clamp(params.workers, 1, 4));
      const review = params.review >= 0.5;
      const human = params.human >= 0.5;
      const p = clamp(params.progress);
      const o = run(workers, review, human);
      const rounds = Math.ceil(PARTS.length / workers);
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;

      // --- tabellen
      const tx = W * 0.04;
      const tw = tall ? W * 0.92 : W * 0.6;
      const ty = tall ? H * 0.05 : H * 0.1;
      const rh = tall ? H * 0.037 : H * 0.051;
      const fs = (tall ? 1.35 : 1.3) * s;
      const cols = tall
        ? { part: tx, agent: tx + tw * 0.5, work: tx + tw * 0.62, rev: tx + tw * 0.74, hum: tx + tw * 0.86, res: tx + tw * 0.97 }
        : { part: tx, agent: tx + tw * 0.44, work: tx + tw * 0.56, rev: tx + tw * 0.7, hum: tx + tw * 0.84, res: tx + tw * 0.96 };
      const head = (label: string, x: number, on = true) =>
        S.text(label, x, ty - 1.8 * s, (tall ? 0.95 : 1.1) * s, on ? C.dim : rgba([154, 165, 176], 0.35), 'center');
      S.text('DEL AV RAPPORTEN', cols.part, ty - 1.8 * s, 1.1 * s, C.dim);
      head('agent', cols.agent);
      head('arbete', cols.work);
      head('granskare', cols.rev, review);
      head('människa', cols.hum, human);
      head('resultat', cols.res);

      const workDone = (i: number) => p >= (0.6 * (Math.floor(i / workers) + 1)) / rounds - 1e-6;
      const revDone = (i: number) => p >= 0.6 + (0.2 * (i + 1)) / PARTS.length - 1e-6;
      const humDone = p >= 0.8 + 0.2 - 1e-6;
      const humPartial = (i: number) => p >= 0.8 + (0.2 * (i + 1)) / PARTS.length - 1e-6;

      PARTS.forEach((name, i) => {
        const y = ty + i * rh + rh / 2;
        if (i % 2 === 0) {
          ctx.fillStyle = rgba(C.cold, 0.04);
          ctx.fillRect(tx - 0.6 * s, y - rh / 2, tw + 1.2 * s, rh);
        }
        S.text(name, cols.part, y, fs, C.ink, 'left', SANS);
        if (TRICKY.has(i)) {
          ctx.font = `${fs}px ${SANS}`;
          S.text('knepig', cols.part + ctx.measureText(name).width + 0.9 * s, y, 1.05 * s, rgba(C.warm, 0.8));
        }
        const done = workDone(i);
        // agent som gjorde delen
        const ac = AGENT_COLORS[o.worker[i]];
        ctx.fillStyle = rgba(ac, done ? 0.85 : 0.25);
        ctx.beginPath();
        ctx.roundRect(cols.agent - 1.6 * s, y - 0.9 * s, 3.2 * s, 1.8 * s, 3);
        ctx.fill();
        S.text(`A${o.worker[i] + 1}`, cols.agent, y, 1.1 * s, C.bg, 'center');
        if (!done) return;
        const r = 0.65 * s;
        mark(cols.work, y, r, o.wrong[i] ? 'bad' : 'ok');
        // granskare
        const f = o.fate[i];
        if (!review) S.text('–', cols.rev, y, 1.1 * s, rgba([154, 165, 176], 0.3), 'center');
        if (!human) S.text('–', cols.hum, y, 1.1 * s, rgba([154, 165, 176], 0.3), 'center');
        if (review && revDone(i)) {
          if (f === 'caught-agent') mark(cols.rev, y, r, 'found');
          else S.text('·', cols.rev, y, 1.4 * s, C.dim, 'center');
        }
        if (human && humPartial(i)) {
          if (f === 'caught-human') mark(cols.hum, y, r, 'found');
          else S.text('·', cols.hum, y, 1.4 * s, C.dim, 'center');
        }
        // slutresultat så långt som granskningen hunnit
        let caught = false;
        if (f === 'caught-agent' && review && revDone(i)) caught = true;
        if (f === 'caught-human' && human && humPartial(i)) caught = true;
        mark(cols.res, y, r, o.wrong[i] && !caught ? 'bad' : 'ok');
      });

      // --- siffror
      const ended = p >= 1 - 1e-6 || (!review && !human && p >= 0.6 - 1e-6) || (!human && p >= 0.8 - 1e-6);
      const left = ended
        ? o.errorsLeft
        : o.fate.filter(
            (f, i) => o.wrong[i] && !((f === 'caught-agent' && review && revDone(i)) || (f === 'caught-human' && human && humPartial(i))),
          ).length;
      void humDone;
      const sx = tall ? tx : W * 0.69;
      let sy = tall ? ty + PARTS.length * rh + 3.4 * s : H * 0.14;
      const maxT = 12 + 3 + T_HUMAN;
      const bw = tall ? W * 0.5 : W * 0.17;
      S.text('TID', sx, sy, 1.15 * s, C.dim);
      if (!tall) sy += 2.6 * s;
      const bx = tall ? sx + 6 * s : sx;
      ctx.fillStyle = rgba(C.cold, 0.12);
      ctx.fillRect(bx, sy - 0.7 * s, bw, 1.4 * s);
      ctx.fillStyle = rgba(C.cold, 0.75);
      ctx.fillRect(bx, sy - 0.7 * s, (bw * o.time) / maxT, 1.4 * s);
      S.text(`${formatNumber(o.time, o.time % 1 ? 2 : 0)} enheter`, bx + bw + 1.2 * s, sy, 1.4 * s, C.ink);
      sy += tall ? 3.2 * s : 5 * s;
      const big = tall ? 2.2 * s : 3.4 * s;
      S.text(tall ? 'FEL KVAR I RAPPORTEN' : 'FEL KVAR', sx, sy, 1.15 * s, C.dim);
      if (tall) S.text(String(left), sx + 20 * s, sy, big, left > 0 ? rgba(C.warm, 1) : C.ink);
      else {
        sy += 4 * s;
        S.text(String(left), sx, sy, big, left > 0 ? rgba(C.warm, 1) : C.ink);
        sy += 5 * s;
        S.text(
          `${o.caughtByAgent} hittade av granskande agent`,
          sx,
          sy,
          1.3 * s,
          review ? C.dim : rgba([154, 165, 176], 0.4),
          'left',
          SANS,
        );
        sy += 2.4 * s;
        S.text(`${o.caughtByHuman} hittade av människan`, sx, sy, 1.3 * s, human ? C.dim : rgba([154, 165, 176], 0.4), 'left', SANS);
        sy += 4.4 * s;
        S.text(`${workers} ${workers === 1 ? 'agent' : 'agenter'} arbetar samtidigt`, sx, sy, 1.3 * s, C.dim, 'left', SANS);
      }
    },
    dispose: S.dispose,
  };
}
