// Jobbets vecka: en rad per uppgift, där stapelns längd är hur stor del av
// veckan uppgiften tar och den kalla delen är det AI gör. Under: den nya
// uppgiften att granska. Till höger (överst på mobil): veckan i siffror.

import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { JOBS, type Kind, week } from './jobs';
import { CHECK_FROM } from './timeline';

const KIND_LABEL: Record<Kind, string> = { text: 'text', manniska: 'möten', hand: 'händer' };
const pct = (v: number) => `${Math.round(v * 100)} %`;
const MAX_TASK = Math.max(...JOBS.flatMap((j) => j.tasks.map((t) => t.share)));

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const job = JOBS[Math.round(params.job)];
    const w = week(job, params.ability);
    const showCheck = (mode === 'explore' || t >= CHECK_FROM) && w.aiTotal > 0.005;
    S.clear();

    const x0 = W * (T ? 0.06 : 0.05);
    const x1 = T ? W * 0.94 : W * 0.6;
    let y = T ? H * 0.2 : H * 0.1;
    S.text(job.title.toUpperCase(), x0, y, 1.5 * s, C.ink);
    S.text('andel av veckan', x1, y, 1.2 * s, C.dim, 'right');
    y += (T ? 3.4 : 3.8) * s;

    const barX = x0;
    // skalan: den största uppgiften i något jobb fyller raden, med plats för procenten
    const barMax = x1 - x0 - 5 * s;
    const scale = barMax / MAX_TASK;
    const rowH = (T ? 4.4 : 4.6) * s;
    job.tasks.forEach((task, i) => {
      S.text(task.name, x0, y, (T ? 1.4 : 1.45) * s, C.ink, 'left', SANS);
      S.text(KIND_LABEL[task.kind], x1, y, 1.15 * s, C.dim, 'right');
      const by = y + 1.4 * s,
        bh = 1.4 * s;
      const full = scale * task.share;
      ctx.fillStyle = rgba([232, 235, 238], 0.75);
      ctx.fillRect(barX, by, full, bh);
      const aiW = scale * w.ai[i];
      if (aiW > 0.5) {
        ctx.fillStyle = rgba(C.cold, 0.95);
        ctx.fillRect(barX + full - aiW, by, aiW, bh);
      }
      S.text(pct(task.share), barX + full + 1 * s, by + bh / 2, 1.15 * s, C.dim);
      y += rowH;
    });
    if (showCheck) {
      S.text('Ny uppgift: granska det AI gör', x0, y, (T ? 1.4 : 1.45) * s, rgba(C.warm, 1), 'left', SANS);
      const by = y + 1.4 * s;
      ctx.fillStyle = rgba(C.warm, 0.85);
      ctx.fillRect(barX, by, scale * w.check, 1.4 * s);
      S.text(pct(w.check), barX + scale * w.check + 1 * s, by + 0.7 * s, 1.15 * s, C.dim);
    }

    // veckan i siffror
    const rows: [string, number, string][] = [
      ['AI gör', w.aiTotal, rgba(C.cold, 1)],
      ...(showCheck ? ([['Granska', w.check, rgba(C.warm, 1)]] as [string, number, string][]) : []),
      ['Tid över', showCheck ? w.freed : w.aiTotal, C.ink],
    ];
    if (T) {
      const yy = H * 0.05;
      S.text('VECKAN', x0, yy, 1.3 * s, C.dim);
      const colW = (x1 - x0 - 8 * s) / 3;
      rows.forEach(([label, v, color], i) => {
        const cx = x0 + 8 * s + i * colW;
        S.text(label, cx, yy, 1.2 * s, C.dim, 'left', SANS);
        S.text(pct(v), cx, yy + 2.6 * s, 2 * s, color, 'left', SANS);
      });
      // färgförklaring
      ctx.fillStyle = rgba([232, 235, 238], 0.75);
      ctx.fillRect(x0, yy + 5.4 * s, 1.4 * s, 1.1 * s);
      S.text('människa', x0 + 2 * s, yy + 5.95 * s, 1.15 * s, C.dim);
      ctx.fillStyle = rgba(C.cold, 0.95);
      ctx.fillRect(x0 + 11 * s, yy + 5.4 * s, 1.4 * s, 1.1 * s);
      S.text('AI', x0 + 13 * s, yy + 5.95 * s, 1.15 * s, C.dim);
      return;
    }
    const px = W * 0.68;
    let py = H * 0.1;
    S.text('VECKAN', px, py, 1.3 * s, C.dim);
    py += 4 * s;
    rows.forEach(([label, v, color]) => {
      S.text(label, px, py, 1.5 * s, C.dim, 'left', SANS);
      S.text(pct(v), W * 0.95, py, 2.2 * s, color, 'right', SANS);
      py += 4.2 * s;
    });
    py += 1.5 * s;
    ctx.fillStyle = rgba([232, 235, 238], 0.75);
    ctx.fillRect(px, py - 0.6 * s, 1.6 * s, 1.2 * s);
    S.text('människa gör', px + 2.4 * s, py, 1.25 * s, C.dim, 'left', SANS);
    ctx.fillStyle = rgba(C.cold, 0.95);
    ctx.fillRect(px + 14 * s, py - 0.6 * s, 1.6 * s, 1.2 * s);
    S.text('AI gör', px + 16.4 * s, py, 1.25 * s, C.dim, 'left', SANS);
    S.text('Siffrorna är påhittade för att visa idén.', px, py + 4 * s, 1.2 * s, C.dim, 'left', SANS);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
