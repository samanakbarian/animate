import { describe, expect, it } from 'vitest';
import { Integral, Rng, hash2, noise1, smoothstep } from './math';

describe('Rng', () => {
  it('ger samma följd för samma seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });
  it('håller sig i [0, 1)', () => {
    const r = new Rng(1);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hash och brus', () => {
  it('hash2 är deterministisk och i [0, 1)', () => {
    expect(hash2(3, 7)).toBe(hash2(3, 7));
    expect(hash2(3, 7)).toBeGreaterThanOrEqual(0);
    expect(hash2(3, 7)).toBeLessThan(1);
  });
  it('noise1 håller sig i [-1, 1]', () => {
    for (let x = 0; x < 20; x += 0.37) expect(Math.abs(noise1(x, 3))).toBeLessThanOrEqual(1);
  });
  it('smoothstep klampar', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
  });
});

describe('Integral', () => {
  it('integrerar en konstant hastighet exakt', () => {
    const I = new Integral(() => 2, 0, 10);
    expect(I.at(5)).toBeCloseTo(10, 6);
  });
  it('integrerar en linjär funktion', () => {
    const I = new Integral((t) => t, 0, 10);
    expect(I.at(4)).toBeCloseTo(8, 4);
  });
});
