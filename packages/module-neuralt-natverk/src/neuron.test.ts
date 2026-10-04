import { describe, expect, it } from 'vitest';
import { boundary, forward } from './neuron';

describe('neuronen', () => {
  it('räknar z och y', () => {
    const { z, y } = forward({ x1: 0.5, x2: -0.5, w1: 1, w2: 1, b: 0 });
    expect(z).toBe(0);
    expect(y).toBeCloseTo(0.5);
    expect(forward({ x1: 1, x2: 0, w1: 1, w2: 0, b: 0 }).y).toBeGreaterThan(0.95);
  });
  it('hittar beslutsgränsen i rutan', () => {
    // x1 = 0 (lodrät linje)
    const l = boundary(1, 0, 0)!;
    expect(l[0]).toBeCloseTo(0);
    expect(l[2]).toBeCloseTo(0);
    expect(Math.abs(l[1] - l[3])).toBeCloseTo(2);
    // ingen gräns när linjen ligger utanför rutan
    expect(boundary(0.1, 0.1, 5)).toBeNull();
    expect(boundary(0, 0, 0)).toBeNull();
  });
});
