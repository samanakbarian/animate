// Samtalet till vänster (under på mobil), rad för rad: frågan, modellens anrop,
// programmets resultat och svaret. Till höger (överst på mobil): modellen,
// programmet och verktygen, med en pil för det som händer just nu.

import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { ModuleScene, Params } from '@nastasteg/engine/module/types';
import { type Event, TOOLS, type ToolId, plan } from './tools';

const DIM: readonly number[] = [154, 165, 176];
const INK: readonly number[] = [232, 235, 238];

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  /** Delar texten i rader som ryms på `maxW` pixlar. */
  function wrap(text: string, maxW: number, size: number, font = SANS): string[] {
    ctx.font = `${size}px ${font}`;
    const lines: string[] = [];
    let line = '';
    for (const w of text.split(' ')) {
      const next = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(next).width > maxW) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  function box(x: number, y: number, w: number, h: number, label: string, size: number, state: 'on' | 'off' | 'active') {
    ctx.fillStyle = state === 'active' ? rgba(C.cold, 0.18) : C.surface;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = state === 'active' ? rgba(C.cold, 1) : state === 'off' ? rgba(DIM, 0.25) : C.line;
    ctx.lineWidth = state === 'active' ? 2 : 1;
    ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 1;
    S.text(label, x + w / 2, y + h / 2, size, state === 'off' ? rgba(DIM, 0.4) : C.ink, 'center', SANS);
  }

  function arrow(x0: number, y0: number, x1: number, y1: number, color: string) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0),
      h = 7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - h * Math.cos(a - 0.45), y1 - h * Math.sin(a - 0.45));
    ctx.lineTo(x1 - h * Math.cos(a + 0.45), y1 - h * Math.sin(a + 0.45));
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1;
  }

  function render(_t: number, params: Params) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const on = { rakna: params.rakna >= 0.5, vader: params.vader >= 0.5 };
    const all = plan(Math.round(params.question), on);
    const shown = all.slice(0, Math.max(1, Math.min(all.length, Math.round(params.step))));
    const now: Event = shown[shown.length - 1];
    S.clear();

    // diagrammet
    const activeTool: ToolId | null = now.kind === 'anrop' || now.kind === 'resultat' ? now.tool : null;
    const modelActive = now.kind === 'fraga' || now.kind === 'svar' || now.kind === 'anrop';
    const fs = (T ? 1.4 : 1.5) * s;
    let model: { x: number; y: number; w: number; h: number }, prog: typeof model, tools: (typeof model)[];
    if (T) {
      const y = H * 0.035,
        h = 3.6 * s,
        g = 3 * s;
      const w = (W * 0.88 - 3 * g) / 4;
      const x = W * 0.06;
      model = { x, y, w, h };
      prog = { x: x + w + g, y, w, h };
      tools = TOOLS.map((_, i) => ({ x: x + (w + g) * (2 + i), y, w, h }));
    } else {
      const x = W * 0.66,
        w = W * 0.28,
        h = 5 * s;
      model = { x, y: H * 0.1, w, h };
      prog = { x, y: H * 0.1 + 11 * s, w, h };
      const tw = (w - 2 * s) / 2;
      tools = TOOLS.map((_, i) => ({ x: x + i * (tw + 2 * s), y: H * 0.1 + 22 * s, w: tw, h }));
    }
    box(model.x, model.y, model.w, model.h, 'Modellen', fs, modelActive ? 'active' : 'on');
    box(prog.x, prog.y, prog.w, prog.h, 'Programmet', fs, activeTool ? 'active' : 'on');
    TOOLS.forEach((tool, i) => {
      const b = tools[i];
      box(
        b.x,
        b.y,
        b.w,
        b.h,
        on[tool.id] || T ? tool.name : `${tool.name} (av)`,
        (T ? 1.2 : 1.35) * s,
        activeTool === tool.id ? 'active' : on[tool.id] ? 'on' : 'off',
      );
    });
    // pilen för det som händer nu
    if (activeTool) {
      const b = tools[TOOLS.findIndex((x) => x.id === activeTool)];
      const going = now.kind === 'anrop';
      const col = going ? rgba(C.cold, 1) : rgba(C.warm, 1);
      if (T) {
        const y = model.y + model.h / 2;
        if (going) {
          arrow(model.x + model.w, y, prog.x, y, col);
        } else {
          arrow(prog.x, y, model.x + model.w, y, col);
        }
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(prog.x + prog.w / 2, prog.y + prog.h);
        ctx.lineTo(prog.x + prog.w / 2, prog.y + prog.h + 1.2 * s);
        ctx.lineTo(b.x + b.w / 2, prog.y + prog.h + 1.2 * s);
        ctx.lineTo(b.x + b.w / 2, b.y + b.h);
        ctx.stroke();
      } else {
        const cx = model.x + model.w / 2;
        if (going) {
          arrow(cx, model.y + model.h, cx, prog.y, col);
          arrow(cx, prog.y + prog.h, b.x + b.w / 2, b.y, col);
        } else {
          arrow(b.x + b.w / 2, b.y, cx, prog.y + prog.h, col);
          arrow(cx, prog.y, cx, model.y + model.h, col);
        }
      }
    }
    if (!T) {
      const note =
        now.kind === 'anrop'
          ? 'Modellen skriver ett anrop. Programmet läser det.'
          : now.kind === 'resultat'
            ? 'Programmet kör verktyget och lägger in resultatet.'
            : now.kind === 'svar'
              ? 'Modellen skriver svaret.'
              : 'Modellen läser frågan.';
      S.text(note, model.x, H * 0.1 + 31 * s, 1.35 * s, C.dim, 'left', SANS);
    }

    // samtalet
    const x0 = W * (T ? 0.06 : 0.05);
    const tagW = (T ? 9 : 12) * s;
    const maxW = (T ? W * 0.94 : W * 0.58) - x0 - tagW;
    const lh = (T ? 2.3 : 2.4) * s;
    let y = T ? H * 0.16 : H * 0.12;
    const tsize = (T ? 1.45 : 1.5) * s;
    shown.forEach((e, i) => {
      const last = i === shown.length - 1;
      const a = last ? 1 : 0.75;
      let tag: string, color: string, text: string, font: string;
      if (e.kind === 'fraga') [tag, color, text, font] = ['DU', rgba(DIM, 1), e.text, SANS];
      else if (e.kind === 'anrop') [tag, color, text, font] = ['ANROP', rgba(C.cold, 1), e.call, '"JetBrains Mono", monospace'];
      else if (e.kind === 'resultat') [tag, color, text, font] = ['RESULTAT', rgba(C.warm, 1), e.text, '"JetBrains Mono", monospace'];
      else [tag, color, text, font] = ['SVAR', rgba(DIM, 1), e.text, SANS];
      S.text(tag, x0, y, 1.15 * s, color);
      const ink = e.kind === 'svar' && !e.ok ? rgba(C.warm, 1) : rgba(INK, a);
      for (const line of wrap(text, maxW, tsize, font)) {
        S.text(line, x0 + tagW, y, tsize, ink, 'left', font);
        y += lh;
      }
      if (e.kind === 'svar' && e.note) {
        S.text(e.note, x0 + tagW, y, 1.3 * s, rgba(C.warm, 1), 'left', SANS);
        y += lh;
      }
      y += 0.9 * s;
    });
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
