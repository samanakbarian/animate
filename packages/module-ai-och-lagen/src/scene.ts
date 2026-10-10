// Pyramiden med de fyra nivåerna, där varje nivå listar sina exempel och det
// valda exemplet lyser. Till höger (under på mobil): vad som gäller för det.

import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { EXAMPLES, GDPR_RIGHTS, type Level, TIERS, tierOf } from './rules';
import { GDPR } from './timeline';

const COLOR: Record<Level, readonly number[]> = {
  forbjuden: [214, 92, 74],
  hog: [200, 140, 63],
  begransad: [157, 182, 214],
  minimal: [120, 150, 130],
};

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wrap(text: string, maxW: number, size: number): string[] {
    ctx.font = `${size}px ${SANS}`;
    const out: string[] = [];
    let line = '';
    for (const w of text.split(' ')) {
      const next = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(next).width > maxW) {
        out.push(line);
        line = w;
      } else line = next;
    }
    if (line) out.push(line);
    return out;
  }

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const ex = EXAMPLES[Math.round(params.example)];
    const tier = tierOf(ex);
    const gdprFocus = mode === 'film' && t >= GDPR.start && t < GDPR.end;
    S.clear();

    // pyramiden: smalast upptill
    const cx = T ? W / 2 : W * 0.29;
    const maxW = T ? W * 0.8 : W * 0.5;
    const top = T ? H * 0.04 : H * 0.08;
    const th = T ? H * 0.085 : H * 0.15;
    const gap = 0.5 * s;
    TIERS.forEach((tr, i) => {
      const y0 = top + i * (th + gap);
      const w0 = maxW * (0.55 + 0.15 * i),
        w1 = maxW * (0.55 + 0.15 * (i + 1));
      const active = tr.id === tier.id;
      const col = COLOR[tr.id];
      ctx.fillStyle = rgba(col, active ? 0.32 : 0.1);
      ctx.beginPath();
      ctx.moveTo(cx - w0 / 2, y0);
      ctx.lineTo(cx + w0 / 2, y0);
      ctx.lineTo(cx + w1 / 2, y0 + th);
      ctx.lineTo(cx - w1 / 2, y0 + th);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = rgba(col, active ? 1 : 0.4);
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();
      ctx.lineWidth = 1;
      S.text(tr.name.toUpperCase(), cx, y0 + th * 0.32, (T ? 1.25 : 1.3) * s, active ? C.ink : rgba(col, 1), 'center');
      // exemplen på nivån
      const names = EXAMPLES.filter((e) => e.level === tr.id);
      ctx.font = `${(T ? 1.2 : 1.25) * s}px ${SANS}`;
      const parts = names.map((e) => e.short);
      const total = ctx.measureText(parts.join('  ·  ')).width;
      let x = cx - total / 2;
      names.forEach((e, j) => {
        const label = e.short;
        const wl = ctx.measureText(label).width;
        S.text(label, x, y0 + th * 0.7, (T ? 1.2 : 1.25) * s, e === ex ? C.ink : C.dim, 'left', SANS);
        if (e === ex) {
          ctx.fillStyle = rgba(col, 1);
          ctx.fillRect(x, y0 + th * 0.7 + 0.9 * s, wl, 0.25 * s);
        }
        x += wl;
        if (j < names.length - 1) {
          const sep = '  ·  ';
          S.text(sep, x, y0 + th * 0.7, (T ? 1.2 : 1.25) * s, C.dim, 'left', SANS);
          x += ctx.measureText(sep).width;
        }
      });
    });

    // panelen
    const px = T ? W * 0.06 : W * 0.6;
    const pw = T ? W * 0.88 : W * 0.35;
    let py = T ? top + 4 * (th + gap) + 2.5 * s : H * 0.1;
    const fs = (T ? 1.45 : 1.5) * s;
    const lh = (T ? 2.2 : 2.3) * s;
    for (const line of wrap(ex.name, pw, (T ? 1.7 : 1.9) * s)) {
      S.text(line, px, py, (T ? 1.7 : 1.9) * s, C.ink, 'left', SANS);
      py += (T ? 2.4 : 2.7) * s;
    }
    S.text(tier.name.toUpperCase(), px, py, 1.3 * s, rgba(COLOR[tier.id], 1));
    py += 2.8 * s;
    const lines = gdprFocus ? GDPR_RIGHTS : tier.rules;
    if (gdprFocus) {
      S.text('DINA RÄTTIGHETER ENLIGT GDPR', px, py, 1.2 * s, C.dim);
      py += 2.4 * s;
    }
    for (const r of lines) {
      for (const [i, line] of wrap(r, pw - 2 * s, fs).entries()) {
        if (i === 0) S.text('–', px, py, fs, C.dim, 'left', SANS);
        S.text(line, px + 2 * s, py, fs, C.ink, 'left', SANS);
        py += lh;
      }
    }
    if (!gdprFocus && ex.note) {
      py += 0.6 * s;
      for (const line of wrap(ex.note, pw, 1.3 * s)) {
        S.text(line, px, py, 1.3 * s, C.dim, 'left', SANS);
        py += 2 * s;
      }
    }
    if (!gdprFocus && ex.personal && !T) {
      py += 0.6 * s;
      S.text('Handlar om uppgifter om människor, så GDPR gäller också.', px, py, 1.3 * s, C.dim, 'left', SANS);
    }
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
