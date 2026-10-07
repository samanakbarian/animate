// Del 1: scenen för ett vardagsbeslut. Sol och läxor till vänster, vikterna på
// ledningarna, summan i mitten och en lampa till höger. Under: en tallinje där
// allt över noll betyder ja. Allt ritas från (t, params).

import { clamp, fract, smoothstep } from '@nastasteg/engine/core/math';
import { PALETTE as C, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { decide } from './beslut';

const SUN = [240, 190, 90] as const;
const LAMP = [255, 214, 140] as const;
const one = (v: number) => formatNumber(v, 1);
const signed = (v: number) => (Math.abs(v) < 0.05 ? '' : v > 0 ? '+' : '') + one(Math.abs(v) < 0.05 ? 0 : v);
const RANGE = 5; // tallinjen går från −5 till 5

export function createDecisionScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wire(x0: number, y0: number, x1: number, y1: number, w: number, amount: number, t: number, seed: number, s: number) {
    const col = w >= 0 ? C.cold : C.warm;
    const strength = clamp(Math.abs(w) / 3);
    ctx.strokeStyle = rgba(col, 0.25 + 0.6 * strength);
    ctx.lineWidth = 1 + 5 * strength;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const u = fract(t * (0.25 + Math.abs(amount) * 0.25) + k / 3 + seed);
      ctx.fillStyle = rgba(col, 0.9 * clamp(Math.abs(amount)));
      ctx.beginPath();
      ctx.arc(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 1.1 * s * (0.5 + strength), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function sunIcon(x: number, y: number, r: number, a: number) {
    ctx.strokeStyle = ctx.fillStyle = rgba(SUN, a);
    ctx.lineWidth = Math.max(1.5, r * 0.18);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * r * 0.8, y + Math.sin(ang) * r * 0.8);
      ctx.lineTo(x + Math.cos(ang) * r * 1.05, y + Math.sin(ang) * r * 1.05);
      ctx.stroke();
    }
  }

  function booksIcon(x: number, y: number, r: number, a: number) {
    const w = r * 1.9,
      h = r * 0.45;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = rgba(i === 1 ? C.warm : C.cold, a);
      ctx.fillRect(x - w / 2 + (i === 1 ? r * 0.15 : 0), y + r * 0.7 - (i + 1) * (h + r * 0.08), w - r * 0.3, h);
    }
  }

  /** Ett kort med ikon, namn och värde. */
  function card(x: number, y: number, s: number, name: string, value: number, icon: 'sun' | 'books') {
    const r = 3.4 * s;
    ctx.fillStyle = C.surface;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - 6.5 * s, y - 5 * s, 13 * s, 12.5 * s, 1.2 * s);
    ctx.fill();
    ctx.stroke();
    if (icon === 'sun') sunIcon(x, y - 0.4 * s, r, 0.2 + 0.8 * value);
    else booksIcon(x, y - 0.4 * s, r, 0.2 + 0.8 * value);
    S.text(name, x, y + 4.2 * s, 1.8 * s, C.dim, 'center');
    S.text(one(value), x, y + 6.3 * s, 1.8 * s, C.ink, 'center');
  }

  function render(t: number, params: Params, mode: Mode) {
    const p = { sun: params.sun, homework: params.homework, wSun: params.wSun, wHomework: params.wHomework, b: params.b };
    const r = decide(p);
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 62 : Math.min(W, H * 1.78) / 100;
    S.clear();

    // stående: korten bredvid varandra överst och summan under; liggande: korten till vänster
    const inSun = { x: W * (T ? 0.25 : 0.12), y: H * (T ? 0.09 : 0.2) };
    const inHw = { x: W * (T ? 0.75 : 0.12), y: H * (T ? 0.09 : 0.52) };
    const sum = { x: W * (T ? 0.5 : 0.45), y: H * (T ? 0.36 : 0.36) };
    const lamp = { x: W * (T ? 0.84 : 0.78), y: sum.y };
    const sr = 5.4 * s;
    const outOf = (c: { x: number; y: number }) => (T ? { x: c.x, y: c.y + 7.5 * s } : { x: c.x + 6.5 * s, y: c.y });

    // ledningar in till summan
    const a1 = outOf(inSun),
      a2 = outOf(inHw);
    wire(a1.x, a1.y, sum.x, sum.y, p.wSun, r.sun, t, 0, s);
    wire(a2.x, a2.y, sum.x, sum.y, p.wHomework, r.homework, t, 0.17, s);
    // vikterna (×) nära korten och bidragen (+/−) nära summan, på var sin sida om ledningen
    const label = (a: { x: number; y: number }, w: number, part: number, side: number) => {
      const dx = sum.x - a.x,
        dy = sum.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const off = (T ? 3.6 : 2.8) * s;
      const nx = (-dy / len) * side * off,
        ny = (dx / len) * side * off;
      const col = rgba(w >= 0 ? C.cold : C.warm, 1);
      S.text(`× ${one(w)}`, a.x + dx * (T ? 0.22 : 0.3) + nx, a.y + dy * (T ? 0.22 : 0.3) + ny, 1.9 * s, col, 'center');
      S.text(signed(part), a.x + dx * (T ? 0.5 : 0.72) + nx, a.y + dy * (T ? 0.5 : 0.72) + ny, 2.2 * s, C.ink, 'center');
    };
    label(a1, p.wSun, r.sun, T ? 1 : -1);
    label(a2, p.wHomework, r.homework, T ? -1 : 1);
    card(inSun.x, inSun.y, s, 'sol', p.sun, 'sun');
    card(inHw.x, inHw.y, s, 'läxor', p.homework, 'books');

    // bias underifrån
    const biasY = sum.y + sr + (T ? 5 : 8) * s;
    ctx.strokeStyle = rgba(p.b >= 0 ? C.cold : C.warm, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sum.x, biasY - 1.5 * s);
    ctx.lineTo(sum.x, sum.y + sr);
    ctx.stroke();
    S.text(`bias ${signed(p.b)}`, sum.x, biasY, 1.9 * s, C.dim, 'center');

    // summan
    ctx.fillStyle = C.surface;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sum.x, sum.y, sr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    S.text('summa', sum.x, sum.y - 1.6 * s, 1.5 * s, C.dim, 'center');
    S.text(one(r.z), sum.x, sum.y + 1.3 * s, 2.6 * s, C.ink, 'center');

    // ledning till lampan
    ctx.strokeStyle = rgba(LAMP, 0.15 + 0.7 * r.lamp);
    ctx.lineWidth = 1 + 3 * r.lamp;
    ctx.beginPath();
    ctx.moveTo(sum.x + sr, sum.y);
    ctx.lineTo(lamp.x - 5 * s, lamp.y);
    ctx.stroke();

    // lampan
    const lr = 4.6 * s;
    const glow = ctx.createRadialGradient(lamp.x, lamp.y, lr * 0.3, lamp.x, lamp.y, lr * 3.2);
    glow.addColorStop(0, rgba(LAMP, 0.5 * r.lamp));
    glow.addColorStop(1, rgba(LAMP, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, lr * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgb(${20 + r.lamp * 235},${22 + r.lamp * 192},${26 + r.lamp * 114})`;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, lr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3a424b';
    ctx.fillRect(lamp.x - lr * 0.45, lamp.y + lr * 0.95, lr * 0.9, lr * 0.55);
    const verdict = r.yes ? 'JA, ut och spela!' : 'NEJ, stanna inne';
    const vx = T ? W * 0.5 : lamp.x;
    const vy = T ? H * 0.555 : lamp.y + lr + 4.5 * s;
    S.text(verdict, vx, vy, 2.3 * s, r.yes ? rgba(LAMP, 1) : C.dim, 'center');

    // tallinjen: allt över noll betyder ja
    const alpha = mode === 'explore' ? 1 : 0.15 + 0.85 * smoothstep(19, 22, t);
    ctx.save();
    ctx.globalAlpha = alpha;
    const lx0 = W * 0.1,
      lx1 = W * 0.9,
      ly = H * (T ? 0.64 : 0.72);
    const X = (v: number) => lx0 + ((clamp(v, -RANGE, RANGE) + RANGE) / (2 * RANGE)) * (lx1 - lx0);
    ctx.fillStyle = rgba(LAMP, 0.12);
    ctx.fillRect(X(0), ly - 1.6 * s, lx1 - X(0), 3.2 * s);
    ctx.strokeStyle = C.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx0, ly);
    ctx.lineTo(lx1, ly);
    for (let v = -RANGE; v <= RANGE; v++) {
      ctx.moveTo(X(v), ly - (v === 0 ? 2.4 : 0.8) * s);
      ctx.lineTo(X(v), ly + (v === 0 ? 2.4 : 0.8) * s);
    }
    ctx.stroke();
    S.text('0', X(0), ly + 3.6 * s, 1.8 * s, C.ink, 'center');
    S.text('nej', (lx0 + X(0)) / 2, ly + 3.6 * s, 1.7 * s, C.dim, 'center');
    S.text('ja', (X(0) + lx1) / 2, ly + 3.6 * s, 1.7 * s, rgba(LAMP, 0.9), 'center');
    const mx = X(r.z);
    ctx.fillStyle = r.yes ? rgba(LAMP, 1) : C.ink;
    ctx.beginPath();
    ctx.moveTo(mx, ly - 1.4 * s);
    ctx.lineTo(mx - 1.4 * s, ly - 3.6 * s);
    ctx.lineTo(mx + 1.4 * s, ly - 3.6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
