// Scenen: till vänster loopen (tänk → agera → observera) med människan utanför
// och verktygen under, till höger agentens logg som skrivs fram rad för rad.

import { clamp, fract } from '@nastasteg/engine/core/math';
import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { TOOLS, loopCount, scenario, type AgentEvent, type EventKind } from './scenario';

const LABEL: Record<EventKind, string> = {
  goal: 'MÅL',
  think: 'TÄNK',
  act: 'AGERA',
  observe: 'SVAR',
  ask: 'FRÅGA',
  human: 'MÄNNISKA',
  done: 'KLART',
};
const DIM = [154, 165, 176] as const;
const INK = [232, 235, 238] as const;
const kindColor = (k: EventKind) =>
  k === 'act' || k === 'done' ? C.cold : k === 'ask' || k === 'human' ? C.warm : k === 'goal' ? INK : k === 'think' ? DIM : INK;

/** Vilken nod i loopen som lyser för en händelse. */
const NODE: Partial<Record<EventKind, number>> = { think: 0, act: 1, observe: 2 };

export function createAgentScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wrap(text: string, maxW: number, size: number, font: string): string[] {
    ctx.font = `${size}px ${font}`;
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(next).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawLoop(cx: number, cy: number, r: number, s: number, active: EventKind | null, t: number, loops: number, humanOn: boolean) {
    const names = ['tänk', 'agera', 'observera'];
    const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
    const activeNode = active ? NODE[active] : undefined;
    // cirkeln med pilar
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // puls som vandrar medurs mot aktiv nod
    if (activeNode !== undefined) {
      const a = angles[activeNode] - 0.9 + fract(t * 0.8) * 0.9;
      ctx.strokeStyle = rgba(C.cold, 0.9);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a - 0.35, a);
      ctx.stroke();
    }
    angles.forEach((a, i) => {
      const nx = cx + Math.cos(a) * r,
        ny = cy + Math.sin(a) * r;
      const on = activeNode === i;
      const nr = (S.tall ? 4.6 : 4.2) * s;
      if (on) {
        const g = ctx.createRadialGradient(nx, ny, nr * 0.3, nx, ny, nr * 2.4);
        g.addColorStop(0, rgba(C.cold, 0.5));
        g.addColorStop(1, rgba(C.cold, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(nx, ny, nr * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = on ? rgba(C.cold, 0.9) : C.surface;
      ctx.strokeStyle = on ? rgba(C.cold, 1) : C.dim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      S.text(names[i], nx, ny, (S.tall ? 1.35 : 1.7) * s, on ? C.bg : C.ink, 'center');
    });
    S.text(`varv ${loops}`, cx, cy, 1.8 * s, C.dim, 'center');
    // människan utanför loopen
    const hx = cx + r * 1.75,
      hy = cy - r * 0.9;
    const humanActive = active === 'ask' || active === 'human';
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = humanOn ? rgba(C.warm, humanActive ? 0.95 : 0.45) : 'rgba(154,165,176,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angles[0]) * r + 4.2 * s, cy + Math.sin(angles[0]) * r);
    ctx.lineTo(hx - 4 * s, hy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = humanActive ? rgba(C.warm, 0.85) : C.surface;
    ctx.strokeStyle = humanOn ? rgba(C.warm, 0.95) : 'rgba(154,165,176,0.3)';
    ctx.beginPath();
    ctx.roundRect(hx - 4.5 * s, hy - 2.2 * s, 13 * s, 4.4 * s, 4);
    ctx.fill();
    ctx.stroke();
    S.text(humanOn ? 'människa' : 'människa (av)', hx + 2 * s, hy, 1.6 * s, humanActive ? C.bg : humanOn ? C.ink : C.dim, 'center');
  }

  function drawTools(x: number, y: number, s: number, activeTool: string | undefined) {
    S.text('verktyg', x, y, 1.5 * s, C.dim);
    let cx = x;
    for (const tool of TOOLS) {
      ctx.font = `${1.7 * s}px ${'"JetBrains Mono", monospace'}`;
      const w = ctx.measureText(tool.label).width + 2.4 * s;
      const on = tool.id === activeTool;
      ctx.fillStyle = on ? rgba(C.cold, 0.25) : C.surface;
      ctx.strokeStyle = on ? rgba(C.cold, 1) : C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, y + 1.6 * s, w, 3.6 * s, 3);
      ctx.fill();
      ctx.stroke();
      S.text(tool.label, cx + 1.2 * s, y + 3.4 * s, 1.7 * s, on ? C.ink : C.dim);
      cx += w + 1 * s;
    }
  }

  function drawLog(events: AgentEvent[], n: number, frac: number, x: number, y: number, w: number, h: number, s: number) {
    ctx.fillStyle = C.surface;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    S.text('agentens logg', x + 1.6 * s, y + 2 * s, 1.5 * s, C.dim);
    const fs = 1.75 * s;
    const lineH = fs * 1.55;
    const labelW = 11 * s;
    const textW = w - labelW - 3.6 * s;
    // bygg rader (sista händelsen skrivs fram tecken för tecken)
    type Row = { label: string; text: string; kind: EventKind; first: boolean };
    const rows: Row[] = [];
    const visible = events.slice(0, n + (frac > 0 ? 1 : 0));
    visible.forEach((e, i) => {
      let text = e.text;
      if (i === n) text = text.slice(0, Math.floor(text.length * clamp(frac * 1.4)));
      const font = e.kind === 'act' ? '"JetBrains Mono", monospace' : SANS;
      wrap(text || ' ', textW, fs, font).forEach((line, j) =>
        rows.push({ label: j === 0 ? LABEL[e.kind] : '', text: line, kind: e.kind, first: j === 0 }),
      );
    });
    const maxRows = Math.floor((h - 5 * s) / lineH);
    let start = Math.max(0, rows.length - maxRows);
    // börja aldrig mitt i en radbruten händelse
    while (start > 0 && start < rows.length && !rows[start].first) start++;
    rows.slice(start).forEach((r, i) => {
      const ry = y + 4.6 * s + i * lineH;
      const col = kindColor(r.kind);
      if (r.label) S.text(r.label, x + 1.6 * s, ry, 1.35 * s, rgba(col, 0.9));
      S.text(
        r.text,
        x + labelW,
        ry,
        fs,
        rgba(col, r.kind === 'think' ? 0.85 : 1),
        'left',
        r.kind === 'act' ? '"JetBrains Mono", monospace' : SANS,
      );
    });
  }

  return {
    resize: S.resize,
    render(t: number, params: Params, _mode: Mode) {
      const W = S.width,
        H = S.height,
        tall = S.tall;
      const failure = params.failure >= 0.5,
        approval = params.approval >= 0.5;
      const events = scenario({ failure, approval });
      const stepsF = clamp(params.steps, 0, events.length);
      const n = Math.floor(stepsF + 1e-6);
      const frac = n < events.length ? stepsF - n : 0;
      const current = frac > 0 ? events[n] : events[n - 1];
      const active = current ? current.kind : null;
      const loops = loopCount(events, n + (frac > 0 && events[n]?.kind === 'act' ? 1 : 0));
      S.clear();
      const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;
      if (tall) {
        drawLoop(W * 0.36, H * 0.16, H * 0.095, s, active, t, loops, approval);
        drawTools(W * 0.06, H * 0.31, s, current?.kind === 'act' ? current.tool : undefined);
        drawLog(events, n, frac, W * 0.04, H * 0.42, W * 0.92, H * 0.38, s);
      } else {
        drawLoop(W * 0.19, H * 0.36, H * 0.19, s, active, t, loops, approval);
        drawTools(W * 0.05, H * 0.67, s, current?.kind === 'act' ? current.tool : undefined);
        drawLog(events, n, frac, W * 0.5, H * 0.06, W * 0.46, H * 0.88, s);
      }
    },
    dispose: S.dispose,
  };
}
