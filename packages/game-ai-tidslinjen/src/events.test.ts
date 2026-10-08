import { describe, expect, it } from 'vitest';
import { Rng } from '@nastasteg/engine/core/math';
import { LEVELS, isRightSlot, rightSlot, shuffled } from './events';

describe('AI-tidslinjen', () => {
  it('inga två händelser i en bana har samma år', () => {
    for (const L of LEVELS) {
      const years = L.events.map((e) => e.year);
      expect(new Set(years).size, L.title).toBe(years.length);
    }
  });

  it('hittar rätt plats', () => {
    const placed = [1950, 1986, 2012];
    expect(rightSlot(placed, 1943)).toBe(0);
    expect(rightSlot(placed, 1997)).toBe(2);
    expect(rightSlot(placed, 2022)).toBe(3);
    expect(isRightSlot(placed, 1997, 2)).toBe(true);
    expect(isRightSlot(placed, 1997, 1)).toBe(false);
    expect(isRightSlot([], 1997, 0)).toBe(true);
  });

  it('blandar deterministiskt', () => {
    expect(shuffled(2, new Rng(4))).toEqual(shuffled(2, new Rng(4)));
    expect(shuffled(2, new Rng(4)).length).toBe(LEVELS[2].events.length);
  });
});
