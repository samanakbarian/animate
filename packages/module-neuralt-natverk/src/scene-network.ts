// Del 2: scenen för ett nätverk som tränas. Till vänster nätverket 2 → H → 1
// (ledningarnas tjocklek och färg = vikterna), till höger planet med datapunkter,
// nätverkets svar och beslutsgränsen, och under den felkurvan.

import { clamp } from '@nastasteg/engine/core/math';
import { formatNumber } from '@nastasteg/engine/module/params';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { DATA, MAX_STEPS, predict, trainingRun, type Weights } from './network';
import { boundary } from './neuron';

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
const N = 72; // värmekartans upplösning

export function createNetworkScene(host: HTMLElement): ModuleScene {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const heat = document.createElement('canvas');
  heat.width = heat.height = N;
  const hctx = heat.getContext('2d')!;
  const img = hctx.createImageData(N, N);
  const grid = new Float64Array(N * N);
  let W = 1,
    H = 1;
  const tall = () => H > W * 0.9;

  function text(s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') {
    ctx.font = `${size}px ${MONO}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  function layout() {
    if (tall()) {
      const size = Math.min(W * 0.74, H * 0.34);
      return {
        s: W / 62,
        diag: { x: W * 0.06, y: H * 0.03, w: W * 0.88, h: H * 0.27 },
        plane: { x: (W - size) / 2, y: H * 0.33, size },
        curve: { x: W * 0.1, y: H * 0.33 + size + H * 0.035, w: W * 0.8, h: H * 0.07 },
      };
    }
    const size = Math.min(H * 0.7, W * 0.36);
    return {
      s: Math.min(W, H * 1.78) / 100,
      diag: { x: W * 0.05, y: H * 0.06, w: W * 0.44, h: H * 0.5 },
      plane: { x: W * 0.95 - size, y: H * 0.06, size },
      curve: { x: W * 0.05, y: H * 0.62, w: W * 0.4, h: H * 0.12 },
    };
  }

  function drawPlane(w: Weights, showLines: boolean, L: ReturnType<typeof layout>) {
    const { x: px, y: py, size } = L.plane;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) grid[j * N + i] = predict(w, (i / (N - 1)) * 2 - 1, 1 - (j / (N - 1)) * 2);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const y = grid[j * N + i];
        const k = Math.abs(y - 0.5) * 2; // säkerhet 0..1
        const col = y > 0.5 ? C.cold : C.warm;
        const o = (j * N + i) * 4;
        const a = 0.12 + 0.3 * k;
        img.data[o] = 7 + col[0] * a;
        img.data[o + 1] = 9 + col[1] * a;
        img.data[o + 2] = 11 + col[2] * a;
        img.data[o + 3] = 255;
      }
    hctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(heat, px, py, size, size);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
    const sx = (v: number) => px + ((v + 1) / 2) * size;
    const sy = (v: number) => py + ((1 - v) / 2) * size;
    // beslutsgränsen (y = 0,5) som mjuk vektorlinje via marching squares
    const cell = size / (N - 1);
    const gx = (i: number) => px + i * cell;
    const gy = (j: number) => py + j * cell;
    const lerpT = (a: number, b: number) => (0.5 - a) / (b - a);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let j = 0; j < N - 1; j++)
      for (let i = 0; i < N - 1; i++) {
        const a = grid[j * N + i],
          b = grid[j * N + i + 1],
          c = grid[(j + 1) * N + i + 1],
          d = grid[(j + 1) * N + i];
        const pts: [number, number][] = [];
        if (a > 0.5 !== b > 0.5) pts.push([gx(i + lerpT(a, b)), gy(j)]);
        if (b > 0.5 !== c > 0.5) pts.push([gx(i + 1), gy(j + lerpT(b, c))]);
        if (d > 0.5 !== c > 0.5) pts.push([gx(i + lerpT(d, c)), gy(j + 1)]);
        if (a > 0.5 !== d > 0.5) pts.push([gx(i), gy(j + lerpT(a, d))]);
        for (let q = 0; q + 1 < pts.length; q += 2) {
          ctx.moveTo(pts[q][0], pts[q][1]);
          ctx.lineTo(pts[q + 1][0], pts[q + 1][1]);
        }
      }
    ctx.stroke();
    // de dolda neuronernas egna linjer
    if (showLines) {
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(232,235,238,0.55)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < w.hidden; i++) {
        const l = boundary(w.h[i * 3], w.h[i * 3 + 1], w.h[i * 3 + 2]);
        if (!l) continue;
        ctx.beginPath();
        ctx.moveTo(sx(l[0]), sy(l[1]));
        ctx.lineTo(sx(l[2]), sy(l[3]));
        ctx.stroke();
      }
      ctx.restore();
    }
    // datapunkterna; felklassade får en vit ring
    const r = Math.max(2.5, size * 0.012);
    for (const p of DATA) {
      const y = predict(w, p.x1, p.x2);
      const wrong = (y > 0.5 ? 1 : 0) !== p.label;
      ctx.fillStyle = rgba(p.label ? C.cold : C.warm, 1);
      ctx.beginPath();
      ctx.arc(sx(p.x1), sy(p.x2), r, 0, Math.PI * 2);
      ctx.fill();
      if (wrong) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx(p.x1), sy(p.x2), r * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawNetwork(w: Weights, L: ReturnType<typeof layout>) {
    const { x, y, w: dw, h: dh } = L.diag;
    const s = L.s;
    const inX = x + dw * 0.08,
      hidX = x + dw * 0.5,
      outX = x + dw * 0.9;
    const ins = [y + dh * 0.32, y + dh * 0.68];
    const hid = Array.from({ length: w.hidden }, (_, i) => y + dh * ((i + 1) / (w.hidden + 1)));
    const outY = y + dh * 0.5;
    const line = (x0: number, y0: number, x1: number, y1: number, weight: number) => {
      const st = clamp(Math.abs(weight) / 4);
      ctx.strokeStyle = rgba(weight >= 0 ? C.cold : C.warm, 0.2 + 0.7 * st);
      ctx.lineWidth = 0.8 + 5 * st;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };
    for (let i = 0; i < w.hidden; i++) {
      line(inX, ins[0], hidX, hid[i], w.h[i * 3]);
      line(inX, ins[1], hidX, hid[i], w.h[i * 3 + 1]);
      line(hidX, hid[i], outX, outY, w.v[i]);
    }
    const node = (nx: number, ny: number, r: number, label: string) => {
      ctx.fillStyle = '#0e1216';
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (label) text(label, nx, ny, 1.7 * s, C.dim, 'center');
    };
    node(inX, ins[0], 2.6 * s, 'x₁');
    node(inX, ins[1], 2.6 * s, 'x₂');
    const hr = Math.min(2.4 * s, (dh / (w.hidden + 1)) * 0.38);
    for (const hy of hid) node(hidX, hy, hr, '');
    node(outX, outY, 2.8 * s, 'y');
    // etiketten ovanför det dolda lagret (krockar då inte med felkurvan eller planet)
    text(`dolt lager: ${w.hidden}`, hidX, hid[0] - hr - 1.4 * s, 1.5 * s, C.dim, 'center');
  }

  function drawCurve(losses: Float64Array, accuracies: Float64Array, stepN: number, L: ReturnType<typeof layout>) {
    const { x, y, w, h } = L.curve;
    const s = L.s;
    const max = Math.max(0.75, losses[0]);
    const X = (i: number) => x + (i / MAX_STEPS) * w;
    const Y = (v: number) => y + h - clamp(v / max) * h;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
    const path = (from: number, to: number, color: string, lw: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(X(from), Y(losses[from]));
      for (let i = from + 4; i <= to; i += 4) ctx.lineTo(X(i), Y(losses[i]));
      ctx.lineTo(X(to), Y(losses[to]));
      ctx.stroke();
    };
    path(0, MAX_STEPS, 'rgba(154,165,176,0.25)', 1);
    if (stepN > 0) path(0, stepN, rgba(C.warm, 1), 2);
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.arc(X(stepN), Y(losses[stepN]), 3, 0, Math.PI * 2);
    ctx.fill();
    text('fel', x, y - 1.4 * s, 1.5 * s, C.dim);
    const acc = Math.round(accuracies[stepN] * 100);
    text(`steg ${stepN} · fel ${formatNumber(losses[stepN])} · ${acc} % rätt`, x + w, y - 1.4 * s, 1.7 * s, C.ink, 'right');
  }

  return {
    resize(w: number, h: number, dpr: number) {
      W = w;
      H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    render(_t: number, params: Params, _mode: Mode) {
      const hidden = Math.round(clamp(params.hidden, 1, 6));
      const stepN = Math.round(clamp(params.steps, 0, MAX_STEPS));
      const lr = Math.round(params.lr * 10) / 10;
      const run = trainingRun(hidden, lr);
      const w = run.snapshots[stepN];
      const L = layout();
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);
      drawPlane(w, params.lines >= 0.5, L);
      drawNetwork(w, L);
      drawCurve(run.losses, run.accuracies, stepN, L);
    },
    dispose() {
      canvas.remove();
    },
  };
}
