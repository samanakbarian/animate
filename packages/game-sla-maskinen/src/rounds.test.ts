import { describe, expect, it } from 'vitest';
import { Rng } from '@nastasteg/engine/core/math';
import { ROUNDS, SPOTS, makeRounds } from './rounds';

describe('slå maskinen', () => {
  it('hittar tillräckligt många osäkra lägen i texten', () => {
    expect(SPOTS.length).toBeGreaterThanOrEqual(20);
  });

  it('bygger åtta rundor med rätt svar bland alternativen', () => {
    const rounds = makeRounds(new Rng(1), 4);
    expect(rounds).toHaveLength(ROUNDS);
    for (const r of rounds) {
      expect(r.options).toHaveLength(4);
      expect(r.options.map((o) => o.token)).toContain(r.answer);
      expect(new Set(r.options.map((o) => o.token)).size).toBe(4);
    }
  });

  it('maskinen har inte alltid rätt', () => {
    const rounds = makeRounds(new Rng(1), 4);
    const right = rounds.filter((r) => r.machine === r.answer).length;
    expect(right).toBeGreaterThan(0);
    expect(right).toBeLessThan(ROUNDS);
  });

  it('samma frö ger samma rundor', () => {
    expect(makeRounds(new Rng(7), 6)).toEqual(makeRounds(new Rng(7), 6));
  });
});
