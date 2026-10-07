// Spelytan för Gradientgolf: fellandskapet som karta, hålet i botten, bollen och
// dess spår. Under kartan ett reglage för steglängd och en knapp för att slå.

import { clamp, lerp } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { DOMAIN, gradient, loss } from '@nastasteg/module-traning/descent';
import { paintLandscape } from '@nastasteg/module-traning/landscape';
import { HOLE, HOLES, MAX_SHOTS, type Shot, shoot, starsFor } from './golf';

const STEP_TIME = 0.09;

export function startGolf(host: HTMLElement, level: number, api: GameApi): GameSession {
  const hole = HOLES[level];
  const S = createSurface(host);
  const { ctx } = S;
  const heat = document.createElement('canvas');
  let heatKey = '';

  const controls = document.createElement('div');
  controls.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;display:flex;gap:.8rem;align-items:center;padding:.6rem .8rem;background:rgba(7,9,11,.85);border-top:1px solid #222a32;font-size:.9rem';
  controls.innerHTML = `
    <label style="display:flex;gap:.6rem;align-items:center;flex:1;min-width:0">
      <span>Steglängd</span>
      <input type="range" min="0.02" max="0.7" step="0.01" value="0.15" style="flex:1;min-width:0;accent-color:#c8643f" />
      <output style="font-family:var(--g-mono);min-width:3.2em;text-align:right">0,15</output>
    </label>
    <button type="button" class="nsg-primary">Slå</button>`;
  host.appendChild(controls);
  const slider = controls.querySelector('input')!;
  const out = controls.querySelector('output')!;
  const btn = controls.querySelector('button')!;
  const lr = () => Number(slider.value);
  slider.addEventListener('input', () => (out.textContent = formatNumber(lr())));

  let pos: [number, number] = [...hole.start];
  let shots = 0;
  const trail: [number, number][] = [[...hole.start]];
  let anim: { shot: Shot; t0: number } | null = null;
  let finished = false;
  const score = () => api.setScore(`slag ${shots} · par ${hole.par}`);
  score();

  function fire() {
    if (anim || finished) return;
    shots++;
    score();
    anim = { shot: shoot(pos[0], pos[1], lr()), t0: performance.now() / 1000 };
    btn.disabled = true;
  }
  btn.addEventListener('click', fire);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && document.activeElement === slider) fire();
  };
  slider.addEventListener('keydown', onKey);

  function land(shot: Shot) {
    anim = null;
    btn.disabled = false;
    if (shot.outcome === 'out') {
      shots++;
      score();
      api.sound('bad');
      api.setStatus('Utanför kartan. Steget var för långt, så bollen läggs tillbaka (+1 slag).');
    } else {
      pos = shot.path.at(-1)!;
      for (const p of shot.path.slice(1)) trail.push(p);
      if (shot.outcome === 'in') {
        finished = true;
        api.sound('ok');
        const diff = shots - hole.par;
        const rel = diff < 0 ? `${-diff} under par` : diff === 0 ? 'på par' : `${diff} över par`;
        api.finish({ score: shots, stars: starsFor(shots, hole.par), message: `I hål på ${shots} slag, ${rel}. ${hole.lesson}` });
        return;
      }
      api.sound('tick');
      api.setStatus(`Felet är nu ${formatNumber(loss(pos[0], pos[1]))}. Hålet ligger där felet är lägst.`);
    }
    if (shots >= MAX_SHOTS) {
      finished = true;
      api.finish({ score: shots, stars: 1, message: `Bollen kom inte i hål på ${MAX_SHOTS} slag. ${hole.lesson}` });
    }
  }

  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const W = S.width,
      H = S.height;
    const tall = S.tall;
    S.clear();
    const s = tall ? W / 58 : Math.min(W, H * 1.78) / 100;
    const ctrlH = controls.offsetHeight || 48;
    const aspect = (DOMAIN.x1 - DOMAIN.x0) / (DOMAIN.y1 - DOMAIN.y0);
    let mw = W * 0.94,
      mh = mw / aspect;
    const availH = H - ctrlH - 2 * s;
    if (mh > availH) {
      mh = availH;
      mw = mh * aspect;
    }
    const mx = (W - mw) / 2,
      my = Math.max(s, (H - ctrlH - mh) / 2);
    const key = `${Math.round(mw / 2)}x${Math.round(mh / 2)}`;
    if (key !== heatKey) {
      heatKey = key;
      paintLandscape(heat, Math.max(2, Math.round(mw / 2)), Math.max(2, Math.round(mh / 2)));
    }
    ctx.drawImage(heat, mx, my, mw, mh);
    const X = (v: number) => mx + ((v - DOMAIN.x0) / (DOMAIN.x1 - DOMAIN.x0)) * mw;
    const Y = (v: number) => my + ((DOMAIN.y1 - v) / (DOMAIN.y1 - DOMAIN.y0)) * mh;

    // hålet med flagga
    const hx = X(HOLE.x),
      hy = Y(HOLE.y);
    // zonen där bollen räknas som i hål, och själva hålet
    ctx.strokeStyle = rgba([232, 235, 238], 0.35);
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(hx, hy, (HOLE.r / (DOMAIN.x1 - DOMAIN.x0)) * mw, (HOLE.r / (DOMAIN.y1 - DOMAIN.y0)) * mh, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(hx, hy, 1.2 * s, 0.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx, hy - 4 * s);
    ctx.stroke();
    ctx.fillStyle = rgba(C.warm, 1);
    ctx.beginPath();
    ctx.moveTo(hx, hy - 4 * s);
    ctx.lineTo(hx + 2.2 * s, hy - 3.3 * s);
    ctx.lineTo(hx, hy - 2.6 * s);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(mx, my, mw, mh);
    ctx.clip();
    // spåret
    ctx.strokeStyle = rgba(C.warm, 0.5);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    trail.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    // pågående slag
    let ball: [number, number] = pos;
    if (anim) {
      const path = anim.shot.path;
      const k = (performance.now() / 1000 - anim.t0) / STEP_TIME;
      const n = Math.min(path.length - 1, Math.floor(k));
      const f = clamp(k - n);
      for (let i = 1; i <= n; i++) ctx.lineTo(X(path[i][0]), Y(path[i][1]));
      if (n < path.length - 1) ball = [lerp(path[n][0], path[n + 1][0], f), lerp(path[n][1], path[n + 1][1], f)];
      else ball = path.at(-1)!;
      ctx.stroke();
      if (k >= path.length - 1 + 2) land(anim.shot);
    } else ctx.stroke();
    // lutningens riktning från bollen
    if (!anim && !finished) {
      const [gx, gy] = gradient(ball[0], ball[1]);
      const len = Math.hypot(gx, gy) || 1;
      const dx = (-gx / len) * 5 * s,
        dy = (gy / len) * 5 * s;
      const bx = X(ball[0]),
        by = Y(ball[1]);
      ctx.strokeStyle = rgba([232, 235, 238], 0.8);
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + dx, by + dy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    // bollen (ritas även precis utanför kartan)
    ctx.fillStyle = C.ink;
    ctx.strokeStyle = rgba(C.warm, 1);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(X(clamp(ball[0], DOMAIN.x0, DOMAIN.x1)), Y(clamp(ball[1], DOMAIN.y0, DOMAIN.y1)), 0.9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
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
