// Scenen (Canvas 2D): till vänster neuronen med insignaler, vikter och utsignal,
// till höger planet [-1, 1]² färgat efter hur starkt neuronen tänds, med
// beslutsgränsen som en linje. Allt ritas från (t, params).

import { clamp, fract, smoothstep } from '@nastasteg/engine/core/math';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { boundary, forward, type NeuronParams } from './neuron';

const C = {
  bg: '#07090b',
  line: '#222a32',
  ink: '#e8ebee',
  dim: '#9aa5b0',
  cold: [157, 182, 214] as const,
  warm: [200, 100, 63] as const,
};
const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const HEAT = 56; // upplösning för planets värmekarta

export function createNeuronScene(host: HTMLElement): ModuleScene {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const heat = document.createElement('canvas');
  heat.width = heat.height = HEAT;
  const hctx = heat.getContext('2d')!;
  const img = hctx.createImageData(HEAT, HEAT);
  let W = 1,
    H = 1;

  function resize(w: number, h: number, dpr: number) {
    W = w;
    H = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function text(s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') {
    ctx.font = `${size}px ${MONO}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  /** Stående bildyta (mobil): diagram överst, planet under, text längst ner. */
  const tall = () => H > W * 0.9;

  function drawPlane(p: NeuronParams, y: number, alpha: number) {
    const size = tall() ? Math.min(W * 0.78, H * 0.36) : Math.min(H * 0.74, W * 0.36);
    const px = tall() ? (W - size) / 2 : W * 0.95 - size;
    const py = tall() ? H * 0.45 : H * 0.1;
    // värmekarta: ljusare där neuronen tänds
    for (let j = 0; j < HEAT; j++)
      for (let i = 0; i < HEAT; i++) {
        const x1 = (i / (HEAT - 1)) * 2 - 1;
        const x2 = 1 - (j / (HEAT - 1)) * 2;
        const a = forward({ ...p, x1, x2 }).y;
        const o = (j * HEAT + i) * 4;
        img.data[o] = 9 + a * 120;
        img.data[o + 1] = 12 + a * 150;
        img.data[o + 2] = 16 + a * 185;
        img.data[o + 3] = 255;
      }
    hctx.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(heat, px, py, size, size);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
    // axlar
    ctx.strokeStyle = 'rgba(232,235,238,0.18)';
    ctx.beginPath();
    ctx.moveTo(px, py + size / 2);
    ctx.lineTo(px + size, py + size / 2);
    ctx.moveTo(px + size / 2, py);
    ctx.lineTo(px + size / 2, py + size);
    ctx.stroke();
    const fs = Math.max(10, size * 0.045);
    text('x₁', px + size - 4, py + size / 2 - fs, fs, C.dim, 'right');
    text('x₂', px + size / 2 + 6, py + fs, fs, C.dim);
    text('−1', px, py + size + fs, fs * 0.9, C.dim);
    text('1', px + size, py + size + fs, fs * 0.9, C.dim, 'right');
    // beslutsgränsen z = 0
    const l = boundary(p.w1, p.w2, p.b);
    if (l) {
      const sx = (v: number) => px + ((v + 1) / 2) * size;
      const sy = (v: number) => py + ((1 - v) / 2) * size;
      ctx.strokeStyle = rgba(C.warm, 0.95);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx(l[0]), sy(l[1]));
      ctx.lineTo(sx(l[2]), sy(l[3]));
      ctx.stroke();
    }
    // aktuell punkt
    const cx = px + ((p.x1 + 1) / 2) * size;
    const cy = py + ((1 - p.x2) / 2) * size;
    ctx.fillStyle = y > 0.5 ? C.bg : C.ink;
    ctx.strokeStyle = y > 0.5 ? C.bg : C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(4, size * 0.02), 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(8, size * 0.04), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawDiagram(t: number, p: NeuronParams, z: number, y: number) {
    const T = tall();
    const s = T ? W / 62 : Math.min(W, H * 1.78) / 100; // skala ~1 % av bredden
    const inputs = [
      { x: W * (T ? 0.12 : 0.09), y: H * (T ? 0.08 : 0.22), v: p.x1, w: p.w1, n: '₁' },
      { x: W * (T ? 0.12 : 0.09), y: H * (T ? 0.29 : 0.56), v: p.x2, w: p.w2, n: '₂' },
    ];
    const nx = W * (T ? 0.46 : 0.32),
      ny = H * (T ? 0.185 : 0.39),
      nr = 5.2 * s;
    const ox = W * (T ? 0.66 : 0.5);
    // ledningar med vikter
    for (const [i, inp] of inputs.entries()) {
      const col = inp.w >= 0 ? C.cold : C.warm;
      const strength = clamp(Math.abs(inp.w) / 2);
      ctx.strokeStyle = rgba(col, 0.25 + 0.6 * strength);
      ctx.lineWidth = 1 + 5 * strength;
      ctx.beginPath();
      ctx.moveTo(inp.x, inp.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      // pulser som färdas längs ledningen (snabbare med starkare signal)
      const amount = Math.abs(inp.v * inp.w);
      for (let k = 0; k < 3; k++) {
        const u = fract(t * (0.25 + amount * 0.5) + k / 3 + i * 0.17);
        ctx.fillStyle = rgba(col, 0.9 * clamp(amount * 1.5));
        ctx.beginPath();
        ctx.arc(inp.x + (nx - inp.x) * u, inp.y + (ny - inp.y) * u, 1.2 * s * (0.5 + strength), 0, Math.PI * 2);
        ctx.fill();
      }
      // vikt mitt på ledningen
      // etiketten närmare insignalen, ovanför den övre och under den nedre ledningen
      const along = T ? 0.33 : 0.45;
      const mx = inp.x + (nx - inp.x) * along,
        my = inp.y + (ny - inp.y) * along;
      text(`w${inp.n} = ${formatNumber(inp.w)}`, mx, my + (i === 0 ? -2.6 : 2.8) * s, 1.9 * s, rgba(col, 1), 'center');
      // insignal
      ctx.fillStyle = '#0e1216';
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(inp.x, inp.y, 3.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      text(`x${inp.n}`, inp.x, inp.y, 1.9 * s, C.dim, 'center');
      text(formatNumber(inp.v), inp.x, inp.y + 5.4 * s, 2 * s, C.ink, 'center');
    }
    // neuronen: glöder efter hur starkt den tänds
    const glow = ctx.createRadialGradient(nx, ny, nr * 0.2, nx, ny, nr * 2.6);
    glow.addColorStop(0, rgba(C.cold, 0.55 * y));
    glow.addColorStop(1, rgba(C.cold, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(nx, ny, nr * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgb(${14 + y * 130},${18 + y * 160},${22 + y * 190})`;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    text('Σ', nx, ny, 3.2 * s, y > 0.55 ? C.bg : C.ink, 'center');
    // bias: under neuronen (liggande) eller till höger under utsignalen (stående)
    if (T) text(`+ b = ${formatNumber(p.b)}`, nx + nr * 0.6, ny + nr + 2.4 * s, 1.9 * s, C.dim);
    else text(`+ b = ${formatNumber(p.b)}`, nx, ny + nr + 3 * s, 1.9 * s, C.dim, 'center');
    // utsignal
    ctx.strokeStyle = rgba(C.cold, 0.25 + 0.7 * y);
    ctx.lineWidth = 1 + 4 * y;
    ctx.beginPath();
    ctx.moveTo(nx + nr, ny);
    ctx.lineTo(ox, ny);
    ctx.stroke();
    text(`y = ${formatNumber(y)}`, ox + 1.5 * s, ny, 2.4 * s, C.ink);
    // formeln
    text(`z = w₁·x₁ + w₂·x₂ + b = ${formatNumber(z)}`, W * 0.05, H * (T ? 0.4 : 0.72), 1.9 * s, C.dim);
  }

  return {
    resize,
    render(t: number, params: Params, mode: Mode) {
      const p: NeuronParams = { x1: params.x1, x2: params.x2, w1: params.w1, w2: params.w2, b: params.b };
      const { z, y } = forward(p);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);
      const planeAlpha = mode === 'explore' ? 1 : 0.25 + 0.75 * smoothstep(31, 36, t);
      drawPlane(p, y, planeAlpha);
      drawDiagram(t, p, z, y);
    },
    dispose() {
      canvas.remove();
    },
  };
}
