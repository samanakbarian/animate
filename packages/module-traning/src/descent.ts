// Ett fellandskap med två vikter och gradientnedstigning på det.
// f(x, y) = 0,18x² + 1,6(y − 0,6·sin x)² − 0,5·e^(−d²/0,15)
// En böjd dal med botten i (0, 0) där felet är 0, och en grop vid (−2,2; −0,48)
// där en boll kan fastna. Allt är rena funktioner – samma indata ger samma bana.

export const DOMAIN = { x0: -3.6, x1: 3.6, y0: -2.2, y1: 2.2 };

const DIP = { a: 0.5, x: -2.2, y: -0.48, r: 0.15 };

export function loss(x: number, y: number): number {
  const u = y - 0.6 * Math.sin(x);
  const d2 = (x - DIP.x) ** 2 + (y - DIP.y) ** 2;
  return 0.18 * x * x + 1.6 * u * u - DIP.a * Math.exp(-d2 / DIP.r);
}

export function gradient(x: number, y: number): [number, number] {
  const u = y - 0.6 * Math.sin(x);
  const e = DIP.a * Math.exp(-((x - DIP.x) ** 2 + (y - DIP.y) ** 2) / DIP.r);
  return [0.36 * x - 1.92 * u * Math.cos(x) + (e * 2 * (x - DIP.x)) / DIP.r, 3.2 * u + (e * 2 * (y - DIP.y)) / DIP.r];
}

/** Startpunkter som besökaren kan välja mellan. */
export const STARTS: { label: string; x: number; y: number }[] = [
  { label: 'nere till höger', x: 3.1, y: -1.8 },
  { label: 'uppe till vänster', x: -3.0, y: 1.7 },
  { label: 'nere till vänster', x: -3.3, y: -1.9 },
];

export const MAX_STEPS = 60;

export interface Run {
  /** Position efter varje steg, index 0 = start. Längd MAX_STEPS + 1. */
  path: [number, number][];
  losses: number[];
  /** Steget där bollen lämnade kartan, annars −1. */
  divergedAt: number;
}

const LIMIT = 12;

export function descend(start: number, lr: number): Run {
  const s = STARTS[start];
  let x = s.x,
    y = s.y,
    divergedAt = -1;
  const path: [number, number][] = [[x, y]];
  const losses = [loss(x, y)];
  for (let i = 1; i <= MAX_STEPS; i++) {
    if (divergedAt < 0) {
      const [gx, gy] = gradient(x, y);
      x -= lr * gx;
      y -= lr * gy;
      if (Math.abs(x) > LIMIT || Math.abs(y) > LIMIT) {
        divergedAt = i;
        x = Math.max(-LIMIT, Math.min(LIMIT, x));
        y = Math.max(-LIMIT, Math.min(LIMIT, y));
      }
    }
    path.push([x, y]);
    losses.push(loss(x, y));
  }
  return { path, losses, divergedAt };
}

const cache = new Map<string, Run>();

/** Cachad variant av `descend` (steglängden avrundas till 0,01). */
export function run(start: number, lr: number): Run {
  const key = `${start}:${lr.toFixed(2)}`;
  let r = cache.get(key);
  if (!r) {
    r = descend(start, Math.round(lr * 100) / 100);
    cache.set(key, r);
  }
  return r;
}
