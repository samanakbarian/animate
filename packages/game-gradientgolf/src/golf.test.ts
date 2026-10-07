import { describe, expect, it } from 'vitest';
import { HOLES, shoot, starsFor } from './golf';

/** Spela en bana med samma steglängd hela tiden. */
function constant(hole: number, lr: number, max = 12): number | null {
  let [x, y] = HOLES[hole].start;
  for (let n = 1; n <= max; n++) {
    const s = shoot(x, y, lr);
    if (s.outcome === 'in') return n;
    if (s.outcome === 'out') return null;
    [x, y] = s.path.at(-1)!;
  }
  return null;
}

describe('gradientgolf', () => {
  it('bana 1 går att klara under par', () => {
    expect(constant(0, 0.4)).toBeLessThanOrEqual(HOLES[0].par);
  });

  it('för kort steglängd tar många slag, för lång flyger iväg', () => {
    expect(constant(1, 0.05)).toBeNull();
    expect(shoot(...HOLES[1].start, 0.7).outcome).toBe('out');
  });

  it('bana 3: samma steglängd hela vägen fastnar i gropen', () => {
    for (const lr of [0.05, 0.1, 0.15, 0.2, 0.3]) expect(constant(2, lr)).toBeNull();
  });

  it('bana 3 går att klara genom att byta steglängd', () => {
    // kort steg ner i dalen, sedan långt steg ur gropen
    let [x, y] = HOLES[2].start;
    let shots = 0;
    for (const lr of [0.15, 0.45, 0.45, 0.45, 0.2, 0.2]) {
      const s = shoot(x, y, lr);
      shots++;
      if (s.outcome === 'in') break;
      expect(s.outcome).not.toBe('out');
      [x, y] = s.path.at(-1)!;
    }
    expect(shots).toBeLessThanOrEqual(HOLES[2].par + 1);
  });

  it('bana 4: korta steg kommer inte ur gropen, långa gör det', () => {
    expect(constant(3, 0.1)).toBeNull();
    expect(constant(3, 0.45)).toBeLessThanOrEqual(HOLES[3].par);
  });

  it('stjärnor', () => {
    expect(starsFor(3, 3)).toBe(3);
    expect(starsFor(5, 3)).toBe(2);
    expect(starsFor(6, 3)).toBe(1);
  });
});
