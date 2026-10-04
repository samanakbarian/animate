// Ett litet neuralt nätverk 2 → H → 1 (tanh i det dolda lagret, sigmoid ut)
// som tränas med full-batch gradientnedstigning på ett seedat dataset.
// Allt är deterministiskt: samma (H, steglängd) ger exakt samma träning, så
// filmen kan visa ”steg n” som en ren funktion av t.

import { Rng } from '@nastasteg/engine/core/math';

export interface Point {
  x1: number;
  x2: number;
  /** 1 = inne i cirkeln, 0 = utanför. */
  label: 0 | 1;
}

export const RADIUS = 0.6;

/** 40 punkter innanför och 40 utanför en cirkel – omöjligt att skilja med en rak linje. */
export function makeDataset(seed = 7, perClass = 40): Point[] {
  const rng = new Rng(seed);
  const pts: Point[] = [];
  let inside = 0,
    outside = 0;
  while (inside < perClass || outside < perClass) {
    const x1 = rng.range(-0.95, 0.95);
    const x2 = rng.range(-0.95, 0.95);
    const r = Math.hypot(x1, x2);
    if (r < RADIUS - 0.06 && inside < perClass) {
      pts.push({ x1, x2, label: 1 });
      inside++;
    } else if (r > RADIUS + 0.06 && outside < perClass) {
      pts.push({ x1, x2, label: 0 });
      outside++;
    }
  }
  return pts;
}

/** Vikterna i en platt struktur: dolt lager (w1, w2, b per neuron) + utlager (v per neuron, c). */
export interface Weights {
  hidden: number;
  /** [w1, w2, b] × hidden */
  h: Float64Array;
  /** v × hidden */
  v: Float64Array;
  c: number;
}

export function initWeights(hidden: number, seed = 11): Weights {
  const rng = new Rng(seed * 31 + hidden);
  const h = new Float64Array(hidden * 3);
  const v = new Float64Array(hidden);
  for (let i = 0; i < hidden; i++) {
    h[i * 3] = rng.range(-1.5, 1.5);
    h[i * 3 + 1] = rng.range(-1.5, 1.5);
    h[i * 3 + 2] = rng.range(-0.5, 0.5);
    v[i] = rng.range(-1, 1);
  }
  return { hidden, h, v, c: 0 };
}

const sig = (z: number) => 1 / (1 + Math.exp(-z));

/** Nätverkets utsignal (0..1) för en punkt. `act` får de dolda aktiveringarna om den ges. */
export function predict(w: Weights, x1: number, x2: number, act?: Float64Array): number {
  let z = w.c;
  for (let i = 0; i < w.hidden; i++) {
    const a = Math.tanh(w.h[i * 3] * x1 + w.h[i * 3 + 1] * x2 + w.h[i * 3 + 2]);
    if (act) act[i] = a;
    z += w.v[i] * a;
  }
  return sig(z);
}

export interface Stats {
  loss: number;
  accuracy: number;
}

export function evaluate(w: Weights, data: readonly Point[]): Stats {
  let loss = 0,
    correct = 0;
  for (const p of data) {
    const y = predict(w, p.x1, p.x2);
    const e = 1e-7;
    loss += -(p.label * Math.log(y + e) + (1 - p.label) * Math.log(1 - y + e));
    if ((y > 0.5 ? 1 : 0) === p.label) correct++;
  }
  return { loss: loss / data.length, accuracy: correct / data.length };
}

/** Ett steg gradientnedstigning (korsentropi, medel över hela datasetet). Returnerar nya vikter. */
export function step(w: Weights, data: readonly Point[], lr: number): Weights {
  const H = w.hidden;
  const gh = new Float64Array(H * 3);
  const gv = new Float64Array(H);
  let gc = 0;
  const act = new Float64Array(H);
  for (const p of data) {
    const y = predict(w, p.x1, p.x2, act);
    const d = y - p.label; // dL/dz för sigmoid + korsentropi
    gc += d;
    for (let i = 0; i < H; i++) {
      gv[i] += d * act[i];
      const dh = d * w.v[i] * (1 - act[i] * act[i]);
      gh[i * 3] += dh * p.x1;
      gh[i * 3 + 1] += dh * p.x2;
      gh[i * 3 + 2] += dh;
    }
  }
  const n = data.length;
  const h = new Float64Array(H * 3);
  const v = new Float64Array(H);
  for (let i = 0; i < H * 3; i++) h[i] = w.h[i] - (lr * gh[i]) / n;
  for (let i = 0; i < H; i++) v[i] = w.v[i] - (lr * gv[i]) / n;
  return { hidden: H, h, v, c: w.c - (lr * gc) / n };
}

export const MAX_STEPS = 800;

export interface Run {
  /** Vikterna efter 0…MAX_STEPS steg. */
  snapshots: Weights[];
  /** Felet efter varje steg (för kurvan). */
  losses: Float64Array;
  accuracies: Float64Array;
}

const cache = new Map<string, Run>();

/** Hela träningen för (H, steglängd) – beräknas en gång och cachas. */
export function trainingRun(hidden: number, lr: number): Run {
  const key = `${hidden}:${lr.toFixed(3)}`;
  let run = cache.get(key);
  if (!run) {
    run = computeRun(hidden, lr, DATA);
    cache.set(key, run);
  }
  return run;
}

/** Tränar från seedade startvikter. Ren funktion – används av trainingRun och testerna. */
export function computeRun(hidden: number, lr: number, data: readonly Point[]): Run {
  const snapshots: Weights[] = [];
  const losses = new Float64Array(MAX_STEPS + 1);
  const accuracies = new Float64Array(MAX_STEPS + 1);
  let w = initWeights(hidden);
  for (let s = 0; s <= MAX_STEPS; s++) {
    snapshots.push(w);
    const st = evaluate(w, data);
    losses[s] = st.loss;
    accuracies[s] = st.accuracy;
    if (s < MAX_STEPS) w = step(w, data, lr);
  }
  return { snapshots, losses, accuracies };
}

export const DATA = makeDataset();
