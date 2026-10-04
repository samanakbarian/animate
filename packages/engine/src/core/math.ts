// Små, deterministiska hjälpfunktioner. Ingenting här får bero på bildfrekvens
// eller Math.random() – allt är rena funktioner av sina argument.

export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const invLerp = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
export const smoothstep = (a: number, b: number, x: number) => {
  const k = invLerp(a, b, x);
  return k * k * (3 - 2 * k);
};
export const smootherstep = (a: number, b: number, x: number) => {
  const k = invLerp(a, b, x);
  return k * k * k * (k * (k * 6 - 15) + 10);
};
export const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);
export const easeInCubic = (k: number) => k * k * k;
export const fract = (x: number) => x - Math.floor(x);

/** Ett fönster som tonar in över [a, a+fin] och ut över [b-fout, b]. */
export const window01 = (t: number, a: number, b: number, fin = 0.5, fout = 0.5) =>
  smoothstep(a, a + fin, t) * (1 - smoothstep(b - fout, b, t));

/** Heltalshash → [0,1). Stabil över plattformar (32-bitars heltalsaritmetik). */
export function hash1(n: number): number {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
export const hash2 = (a: number, b: number) => hash1(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
export const hash3 = (a: number, b: number, c: number) =>
  hash1(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791));

/** 1D värdebrus i [-1,1] med kvintisk interpolation. */
export function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  const a = hash2(i, seed) * 2 - 1;
  const b = hash2(i + 1, seed) * 2 - 1;
  return a + (b - a) * u;
}

/** Fraktalt 1D-brus (för handhållen kamera m.m.). */
export function fbm1(x: number, seed = 0, oct = 3): number {
  let s = 0,
    a = 0.5,
    f = 1,
    n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * noise1(x * f, seed + i * 17);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
}

/** Seedad slumpgenerator (mulberry32). */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number) {
    return a + (b - a) * this.next();
  }
  int(a: number, b: number) {
    return Math.floor(this.range(a, b + 1));
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  sign() {
    return this.next() < 0.5 ? -1 : 1;
  }
}

/**
 * Förberäknad integral av en hastighetsfunktion, så att position = ∫v(t)dt kan
 * slås upp i O(1) för godtyckligt t – helt oberoende av bildfrekvens.
 */
export class Integral {
  private table: Float64Array;
  constructor(
    private f: (t: number) => number,
    private t0: number,
    private t1: number,
    private dt = 1 / 240,
  ) {
    const n = Math.ceil((t1 - t0) / dt) + 1;
    this.table = new Float64Array(n + 1);
    let acc = 0;
    this.table[0] = 0;
    for (let i = 1; i <= n; i++) {
      const a = t0 + (i - 1) * dt;
      // Simpsons regel för varje delintervall.
      acc += (dt / 6) * (f(a) + 4 * f(a + dt / 2) + f(a + dt));
      this.table[i] = acc;
    }
  }
  at(t: number): number {
    if (t <= this.t0) return (t - this.t0) * this.f(this.t0);
    const x = (t - this.t0) / this.dt;
    const i = Math.floor(x);
    if (i + 1 >= this.table.length) {
      const last = this.table[this.table.length - 1];
      return last + (t - (this.t0 + (this.table.length - 1) * this.dt)) * this.f(this.t1);
    }
    const k = x - i;
    return this.table[i] + (this.table[i + 1] - this.table[i]) * k;
  }
}
