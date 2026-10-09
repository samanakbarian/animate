// Scenen: till vänster frågan (prompten) med sina delar, till höger svaret där det
// påhittade, det allmänna och fyllnaden är markerade. Under svaret en mätare för hur
// nära svaret är det du ville ha. Stående (mobil): frågan överst, svaret under.

import { clamp, smoothstep } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { BASE, PIECES, type SegmentKind, answer, closeness, flagsFrom } from './prompt';
import { CHAPTERS } from './timeline';

const INK = [232, 235, 238] as const;
const DIM = [154, 165, 176] as const;
const STYLE: Record<SegmentKind, { color: readonly number[]; label?: string; italic?: boolean }> = {
  ok: { color: INK },
  vague: { color: DIM, label: 'allmänt', italic: true },
  invented: { color: C.warm, label: 'påhittat' },
  extra: { color: DIM, label: 'fyllnad' },
  placeholder: { color: C.cold, label: 'lucka' },
};

export function createPromptScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wrap(text: string, maxW: number, size: number): string[] {
    ctx.font = `${size}px ${SANS}`;
    const lines: string[] = [];
    let cur = '';
    for (const w of text.split(' ')) {
      const next = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(next).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const f = flagsFrom(params);
    S.clear();

    // --- frågan
    const px = W * 0.05,
      py = H * (T ? 0.04 : 0.08),
      pw = T ? W * 0.9 : W * 0.38;
    const fs = 1.6 * s;
    const lh = fs * 1.35;
    S.text('DIN FRÅGA', px, py, 1.3 * s, C.dim);
    let y = py + 2.6 * s;
    const lines: { text: string; on: boolean; base?: boolean }[] = [{ text: BASE, on: true, base: true }];
    for (const p of PIECES) lines.push({ text: p.text, on: f[p.id] });
    const boxTop = y - fs;
    for (const l of lines) {
      if (!l.on) {
        // saknad del: en tunn platsmarkering med delens namn
        const name = PIECES.find((p) => p.text === l.text)!.name.toLowerCase();
        S.text(`+ ${name} saknas`, px + 1.2 * s, y, fs * 0.85, rgba(DIM, 0.55), 'left', SANS);
        y += lh * 1.15;
        continue;
      }
      for (const row of wrap(l.text, pw - 2.4 * s, fs)) {
        S.text(row, px + 1.2 * s, y, fs, l.base ? rgba(INK, 1) : rgba(C.cold, 1), 'left', SANS);
        y += lh;
      }
      y += lh * 0.15;
    }
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px, boxTop - 0.6 * s, pw, y - boxTop, 1.2 * s);
    ctx.stroke();

    // --- svaret: ord för ord med stil per del, skrivs fram efter varje kapitelbyte
    const ax = T ? px : W * 0.48,
      ay = T ? y + 3.2 * s : py,
      aw = T ? W * 0.9 : W * 0.47;
    const afs = 1.6 * s;
    const alh = afs * 1.55;
    S.text('SVARET', ax, ay, 1.3 * s, C.dim);
    let chapterStart = 0;
    for (const c of CHAPTERS) if (t >= c.start) chapterStart = c.start;
    const shown = mode === 'film' ? Math.floor((t - chapterStart) * 60) : Infinity;
    const segs = answer(f);
    let cx = ax + 1.2 * s,
      cy = ay + 2.8 * s,
      typed = 0;
    const right = ax + aw - 1.2 * s;
    const present = new Set<SegmentKind>();
    for (const seg of segs) {
      const st = STYLE[seg.kind];
      ctx.font = `${st.italic ? 'italic ' : ''}${afs}px ${SANS}`;
      const space = ctx.measureText(' ').width;
      seg.text.split(' ').forEach((w) => {
        const ww = ctx.measureText(w).width;
        if (cx + ww > right && cx > ax + 1.2 * s) {
          cx = ax + 1.2 * s;
          cy += alh;
        }
        const visible = typed < shown;
        typed += w.length + 1;
        if (visible) {
          ctx.fillStyle = rgba(st.color, 1);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(w, cx, cy);
          if (seg.kind === 'invented' || seg.kind === 'placeholder') {
            // understrykning: vågig för påhittat, streckad för lucka
            ctx.strokeStyle = rgba(st.color, 0.9);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            const uy = cy + afs * 0.62;
            if (seg.kind === 'invented') {
              for (let x = 0; x <= ww; x += 2) ctx.lineTo(cx + x, uy + Math.sin((cx + x) * 0.5) * 1.3);
            } else {
              ctx.setLineDash([3, 3]);
              ctx.moveTo(cx, uy);
              ctx.lineTo(cx + ww, uy);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        cx += ww + space;
      });
      if (typed - seg.text.length - 1 < shown) present.add(seg.kind);
    }
    const ansBottom = cy + alh * 0.8;
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.roundRect(ax, ay + 1.2 * s, aw, ansBottom - (ay + 1.2 * s), 1.2 * s);
    ctx.stroke();
    // förklaring under svaret, bara för det som syns
    let lx = ax;
    const ly = ansBottom + 2.2 * s;
    for (const kind of ['invented', 'vague', 'extra', 'placeholder'] as SegmentKind[]) {
      if (!present.has(kind)) continue;
      const st = STYLE[kind];
      ctx.fillStyle = rgba(st.color, 1);
      ctx.fillRect(lx, ly - 0.45 * s, 1.6 * s, 0.9 * s);
      lx += 2.2 * s + S.text(st.label!, lx + 2.2 * s, ly, 1.35 * s, rgba(st.color, 1), 'left') + 2.4 * s;
    }

    // --- mätaren
    const done = mode === 'film' ? smoothstep(0, 1.5, (t - chapterStart) * 1) : 1;
    const v = closeness(f) * done;
    const my = ansBottom + (present.size > 1 || !present.has('ok') ? 6.2 : 3.6) * s;
    const mw = aw;
    S.text('Hur nära det du ville ha', ax, my, 1.4 * s, C.dim);
    S.text(`${Math.round(closeness(f) * 100)} %`, ax + mw, my, 1.6 * s, C.ink, 'right');
    ctx.fillStyle = C.line;
    ctx.fillRect(ax, my + 1.6 * s, mw, 1 * s);
    ctx.fillStyle = rgba(v > 0.8 ? C.cold : v > 0.4 ? INK : C.warm, 0.9);
    ctx.fillRect(ax, my + 1.6 * s, mw * clamp(v), 1 * s);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
