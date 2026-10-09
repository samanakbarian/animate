import { describe, expect, it } from 'vitest';
import { Rng } from '@nastasteg/engine/core/math';
import { LEVELS, maxScore, scoreTask, shuffledOrder, starsFor } from './tasks';

describe('promptpusslet', () => {
  it('varje uppgift har minst två behövda bitar och minst en bit som inte behövs', () => {
    for (const L of LEVELS)
      for (const t of L.tasks) {
        expect(t.pieces.filter((p) => p.kind === 'need').length, t.goal).toBeGreaterThanOrEqual(2);
        expect(
          t.pieces.some((p) => p.kind !== 'need'),
          t.goal,
        ).toBe(true);
      }
  });

  it('räknar poäng: behövda bitar ger plus, fällor minus, aldrig under noll', () => {
    const t = LEVELS[0].tasks[0];
    const all = new Set(t.pieces.map((_, i) => i).filter((i) => t.pieces[i].kind === 'need'));
    expect(scoreTask(t, all).points).toBe(4);
    const trap = t.pieces.findIndex((p) => p.kind === 'trap');
    expect(scoreTask(t, new Set([...all, trap])).points).toBe(3);
    expect(scoreTask(t, new Set([trap])).points).toBe(0);
    expect(scoreTask(t, new Set()).missed).toHaveLength(4);
  });

  it('stjärnor och blandning', () => {
    expect(starsFor(maxScore(0), maxScore(0))).toBe(3);
    expect(starsFor(0, maxScore(0))).toBe(1);
    expect(shuffledOrder(6, new Rng(2))).toEqual(shuffledOrder(6, new Rng(2)));
    expect([...shuffledOrder(6, new Rng(2))].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
