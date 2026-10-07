import { describe, expect, it } from 'vitest';
import { Rng } from '@nastasteg/engine/core/math';
import { LEVELS, shuffled, starsFor } from './items';

describe('hallucinationsjakten', () => {
  it('varje bana har åtta frågor och både sanna och påhittade svar', () => {
    for (const l of LEVELS) {
      expect(l.items).toHaveLength(8);
      const t = l.items.filter((i) => i.true).length;
      expect(t).toBeGreaterThanOrEqual(3);
      expect(t).toBeLessThanOrEqual(5);
    }
  });

  it('förklaringen börjar med Stämmer eller Påhittat och matchar svaret', () => {
    for (const l of LEVELS) for (const i of l.items) expect(i.why.startsWith(i.true ? 'Stämmer' : 'Påhittat')).toBe(true);
  });

  it('blandningen är seedad och behåller alla frågor', () => {
    const a = shuffled(1, new Rng(3));
    expect(shuffled(1, new Rng(3))).toEqual(a);
    expect(new Set(a.map((i) => i.question)).size).toBe(8);
  });

  it('stjärnor', () => {
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(6, 8)).toBe(2);
    expect(starsFor(5, 8)).toBe(1);
  });
});
