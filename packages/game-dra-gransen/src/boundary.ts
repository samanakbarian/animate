// Dra gränsen: en rak linje delar planet i två halvor, precis som en enda
// neuron (w₁x + w₂y + b = 0). Spelaren drar linjen. Varje bana har ett seedat
// dataset, och den bästa möjliga andelen rätt räknas fram så att stjärnorna
// blir rättvisa även när ingen linje kan bli helt rätt.

import { Rng } from '@nastasteg/engine/core/math';

export interface Point {
  x: number;
  y: number;
  /** 1 = blå, 0 = orange. */
  label: 0 | 1;
}

export interface Line {
  p1: [number, number];
  p2: [number, number];
  /** Byter vilken sida som räknas som blå. */
  flip: boolean;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
}

export const LEVELS: Level[] = [
  {
    title: 'Två grupper',
    goal: 'Dra i linjens ändar så att de blå hamnar på den ljusa sidan och de orange på den mörka.',
    lesson: 'En neuron gör just detta: den drar en rak gräns. Vikterna bestämmer lutningen, biasen var linjen ligger.',
  },
  {
    title: 'Smal glipa',
    goal: 'Grupperna ligger nära varandra. Linjen måste ligga precis rätt.',
    lesson: 'När träning flyttar vikterna lite i taget är det så här linjen letar sig in i glipan.',
  },
  {
    title: 'Överlapp',
    goal: 'Grupperna överlappar. Ingen linje blir helt rätt, så hitta den bästa.',
    lesson: 'Verkliga data är sällan rena. Målet är inte noll fel utan så få fel som möjligt.',
  },
  {
    title: 'Ringen',
    goal: 'De blå ligger i mitten och de orange runt om. Gör så gott det går.',
    lesson: 'Ingen rak linje kan ringa in mitten. Därför har nätverk flera neuroner i lager: några linjer tillsammans kan ringa in den.',
  },
];

function gauss(rng: Rng): number {
  const u = Math.max(1e-9, rng.next());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng.next());
}

const clamp1 = (v: number) => Math.max(-0.95, Math.min(0.95, v));

/** Banans prickar (fast frö per bana, så testerna gäller exakt det spelaren ser). Koordinater i [−1, 1]. */
export function makePoints(level: number, rng = new Rng(100 + level)): Point[] {
  const pts: Point[] = [];
  const blob = (cx: number, cy: number, sd: number, n: number, label: 0 | 1) => {
    for (let i = 0; i < n; i++) pts.push({ x: clamp1(cx + sd * gauss(rng)), y: clamp1(cy + sd * gauss(rng)), label });
  };
  if (level === 0) {
    blob(-0.45, 0.4, 0.14, 14, 1);
    blob(0.45, -0.35, 0.14, 14, 0);
  } else if (level === 1) {
    // ovanför respektive under linjen y = 0,6x, med en smal glipa
    while (pts.length < 32) {
      const x = rng.range(-0.9, 0.9),
        y = rng.range(-0.9, 0.9);
      const d = y - 0.6 * x - 0.05;
      if (Math.abs(d) < 0.07) continue;
      pts.push({ x, y, label: d > 0 ? 1 : 0 });
    }
  } else if (level === 2) {
    blob(-0.28, 0.22, 0.3, 20, 1);
    blob(0.28, -0.22, 0.3, 20, 0);
  } else {
    while (pts.length < 44) {
      const a = rng.range(0, Math.PI * 2);
      const inner = pts.length < 18;
      const r = inner ? 0.42 * Math.sqrt(rng.next()) : rng.range(0.62, 0.92);
      pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: inner ? 1 : 0 });
    }
  }
  return pts;
}

/** Är punkten på linjens blå sida? Blå = vänster om p1 → p2 (eller höger om flip). */
export function blueSide(line: Line, x: number, y: number): boolean {
  const [ax, ay] = line.p1,
    [bx, by] = line.p2;
  const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
  return line.flip ? cross < 0 : cross > 0;
}

export function accuracy(points: readonly Point[], line: Line): number {
  let ok = 0;
  for (const p of points) if (blueSide(line, p.x, p.y) === (p.label === 1)) ok++;
  return ok / points.length;
}

/** Bästa andel rätt som någon rak linje kan få (sökning över vinklar, exakt tröskel per vinkel). */
export function bestAccuracy(points: readonly Point[]): number {
  let best = 0;
  const n = points.length;
  for (let deg = 0; deg < 180; deg += 0.5) {
    const a = (deg * Math.PI) / 180;
    const nx = Math.cos(a),
      ny = Math.sin(a);
    const proj = points.map((p) => ({ v: p.x * nx + p.y * ny, l: p.label })).sort((p, q) => p.v - q.v);
    // tröskel före index i: blå = över tröskeln (eller under, för andra hållet)
    let blueAbove = proj.filter((p) => p.l === 1).length; // alla över tröskeln när i = 0
    let orangeBelow = 0;
    for (let i = 0; i <= n; i++) {
      const acc = (blueAbove + orangeBelow) / n;
      best = Math.max(best, acc, 1 - acc);
      if (i < n) {
        if (proj[i].l === 1) blueAbove--;
        else orangeBelow++;
      }
    }
  }
  return best;
}

/** Stjärnor efter hur nära den bästa möjliga linjen spelaren kom. */
export function starsFor(acc: number, best: number): 1 | 2 | 3 {
  const missing = Math.round((best - acc) * 1000) / 1000;
  return missing <= 0.0 ? 3 : missing <= 0.08 ? 2 : 1;
}
