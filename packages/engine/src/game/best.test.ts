import { describe, expect, it } from 'vitest';
import { readBest, saveBest } from './best';

describe('bästa resultat', () => {
  it('sparar bara bättre resultat (högre är bättre)', () => {
    expect(saveBest('t1', 0, 10)).toBe(true);
    expect(saveBest('t1', 0, 8)).toBe(false);
    expect(saveBest('t1', 0, 12)).toBe(true);
    expect(readBest('t1', 0)).toBe(12);
  });

  it('lägre är bättre för golf', () => {
    expect(saveBest('t2', 1, 5, true)).toBe(true);
    expect(saveBest('t2', 1, 6, true)).toBe(false);
    expect(saveBest('t2', 1, 3, true)).toBe(true);
    expect(readBest('t2', 1)).toBe(3);
  });
});
