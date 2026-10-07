// Spelytan för Dra gränsen: prickarna i ett kvadratiskt plan, linjen med två
// handtag som spelaren drar, och den blå sidan svagt markerad. Under planet:
// knappar för att byta sida och lämna in.

import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, type Line, accuracy, bestAccuracy, blueSide, makePoints, starsFor } from './boundary';

export function startBoundary(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const points = makePoints(level);
  const best = bestAccuracy(points);
  const S = createSurface(host);
  const { ctx, canvas } = S;
  canvas.style.touchAction = 'none';
  const line: Line = { p1: [-0.8, -0.6], p2: [0.8, -0.2], flip: false };

  const controls = document.createElement('div');
  controls.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;display:flex;gap:.6rem;justify-content:flex-end;align-items:center;padding:.6rem .8rem;background:rgba(7,9,11,.85);border-top:1px solid #222a32';
  controls.innerHTML = `<span class="acc" style="margin-right:auto;font-family:var(--g-mono);font-size:.9rem"></span>
    <button type="button" data-act="flip">Byt sida</button>
    <button type="button" class="nsg-primary" data-act="done">Klar</button>`;
  host.appendChild(controls);
  const accEl = controls.querySelector<HTMLSpanElement>('.acc')!;
  let finished = false;
  controls.querySelector('[data-act=flip]')!.addEventListener('click', () => {
    line.flip = !line.flip;
    api.sound('tick');
  });
  controls.querySelector('[data-act=done]')!.addEventListener('click', () => {
    if (finished) return;
    finished = true;
    const acc = accuracy(points, line);
    const stars = starsFor(acc, best);
    const ok = Math.round(acc * points.length);
    const bestN = Math.round(best * points.length);
    const vs = ok >= bestN ? 'Bättre går inte med en rak linje.' : `Den bästa raka linjen får ${bestN} rätt.`;
    api.finish({ score: Math.round(acc * 100), stars, message: `${ok} av ${points.length} rätt. ${vs} ${L.lesson}` });
  });

  // geometri: kvadratiskt plan ovanför knapparna
  let px = 0,
    py = 0,
    size = 1;
  const layout = () => {
    const ctrlH = controls.offsetHeight || 48;
    const W = S.width,
      H = S.height - ctrlH;
    size = Math.min(W, H) * 0.9;
    px = (W - size) / 2;
    py = (H - size) / 2;
  };
  const toScreen = (x: number, y: number): [number, number] => [px + ((x + 1) / 2) * size, py + ((1 - y) / 2) * size];
  const toWorld = (sx: number, sy: number): [number, number] => [((sx - px) / size) * 2 - 1, 1 - ((sy - py) / size) * 2];

  // dra i handtagen
  let dragging: 'p1' | 'p2' | null = null;
  const local = (e: PointerEvent): [number, number] => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (finished) return;
    const [mx, my] = local(e);
    const d = (p: [number, number]) => {
      const [sx, sy] = toScreen(p[0], p[1]);
      return Math.hypot(sx - mx, sy - my);
    };
    const d1 = d(line.p1),
      d2 = d(line.p2);
    const hit = Math.max(18, size * 0.05);
    if (Math.min(d1, d2) > hit) return;
    dragging = d1 <= d2 ? 'p1' : 'p2';
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) {
      canvas.style.cursor = 'default';
      return;
    }
    const [wx, wy] = toWorld(...local(e));
    const c = (v: number) => Math.max(-1, Math.min(1, v));
    line[dragging] = [c(wx), c(wy)];
  });
  const up = () => {
    if (dragging) api.sound('tick');
    dragging = null;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  let lastOk = -1;
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    layout();
    S.clear();
    const [ax, ay] = line.p1,
      [bx, by] = line.p2;
    // planet: mörk sida överallt, sedan den blå sidan som ett halvplan (klippt till planet)
    ctx.fillStyle = rgba(C.warm, 0.06);
    ctx.fillRect(px, py, size, size);
    {
      const dx = bx - ax,
        dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len,
        uy = dy / len;
      // vänster normal = blå sida (höger om flip)
      const sgn = line.flip ? -1 : 1;
      const nx = -uy * sgn,
        ny = ux * sgn;
      const far = 6;
      const poly: [number, number][] = [
        [ax - ux * far, ay - uy * far],
        [bx + ux * far, by + uy * far],
        [bx + ux * far + nx * far, by + uy * far + ny * far],
        [ax - ux * far + nx * far, ay - uy * far + ny * far],
      ];
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, size, size);
      ctx.clip();
      ctx.fillStyle = rgba(C.cold, 0.13);
      ctx.beginPath();
      poly.forEach(([x, y], i) => (i ? ctx.lineTo(...toScreen(x, y)) : ctx.moveTo(...toScreen(x, y))));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = C.line;
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
    // linjen, förlängd över hela planet
    const dx = bx - ax,
      dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const [e1x, e1y] = toScreen(ax - (dx / len) * 3, ay - (dy / len) * 3);
    const [e2x, e2y] = toScreen(bx + (dx / len) * 3, by + (dy / len) * 3);
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, size, size);
    ctx.clip();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e1x, e1y);
    ctx.lineTo(e2x, e2y);
    ctx.stroke();
    ctx.restore();
    // prickarna: fel sida får en ring
    const r = Math.max(3.5, size * 0.012);
    let ok = 0;
    for (const p of points) {
      const [sx, sy] = toScreen(p.x, p.y);
      const right = blueSide(line, p.x, p.y) === (p.label === 1);
      if (right) ok++;
      ctx.fillStyle = p.label === 1 ? rgba(C.cold, 1) : rgba(C.warm, 1);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      if (!right) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // handtagen
    for (const p of [line.p1, line.p2]) {
      const [sx, sy] = toScreen(p[0], p[1]);
      ctx.fillStyle = C.bg;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(8, size * 0.022), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (ok !== lastOk) {
      lastOk = ok;
      const text = `${ok} av ${points.length} rätt`;
      accEl.textContent = text;
      api.setScore(text);
    }
  }
  api.setStatus(L.goal);
  raf = requestAnimationFrame(frame);

  return {
    resize: S.resize,
    dispose() {
      cancelAnimationFrame(raf);
      S.dispose();
      controls.remove();
    },
  };
}
