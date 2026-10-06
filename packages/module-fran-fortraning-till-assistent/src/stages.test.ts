import { describe, expect, it } from 'vitest';
import { MAX_ROUNDS, REWARDS, comparison, probabilities } from './stages';

const argmax = (p: number[]) => p.indexOf(Math.max(...p));

describe('skedena', () => {
  it('den förtränade modellen fortsätter helst texten', () => {
    expect(argmax(probabilities(0))).toBe(0);
  });

  it('den finjusterade svarar, men självsäkra fel är fortfarande vanliga', () => {
    const p = probabilities(1);
    expect(argmax(p)).toBe(2);
    expect(p[3]).toBeGreaterThan(0.3);
  });

  it('återkopplingen gör det hjälpsamma svaret mest troligt', () => {
    expect(probabilities(2, 0)).toEqual(probabilities(1));
    expect(probabilities(2, MAX_ROUNDS)[2]).toBeGreaterThan(0.8);
    expect(probabilities(2, MAX_ROUNDS)[3]).toBeLessThan(0.15);
  });

  it('belöningen lär sig smaken: hjälpsamt högst, fortsättning lägst', () => {
    const r = REWARDS[MAX_ROUNDS];
    expect(argmax(r)).toBe(2);
    expect(r.indexOf(Math.min(...r))).toBe(0);
  });

  it('jämförelser är alltid mellan två olika sorter och deterministiska', () => {
    for (let i = 1; i <= MAX_ROUNDS; i++) {
      const c = comparison(i);
      expect(c.a).not.toBe(c.b);
      expect([c.a, c.b]).toContain(c.winner);
      expect(comparison(i)).toEqual(c);
    }
  });
});
