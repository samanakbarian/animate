import { describe, expect, it } from 'vitest';
import { LEVELS, mostCommon, nextCounts, probability, probabilityOptions } from './counts';

describe('ordräknaren', () => {
  it('räknar nästa ord ur texten', () => {
    expect(nextCounts(['katten']).get('sover')).toBe(3);
    expect(nextCounts(['hunden', 'sover']).get('i')).toBe(2);
    expect(nextCounts(['katten', 'sover']).get('på')).toBe(2);
  });

  it('varje fråga har ett entydigt svar', () => {
    for (const L of LEVELS)
      for (const q of L.questions) {
        if (q.probabilityOf) {
          const p = probability(q.context, q.probabilityOf);
          expect(p, q.context.join(' ')).toBeGreaterThan(0);
          const opts = probabilityOptions(p);
          expect(opts.length, q.context.join(' ')).toBeGreaterThanOrEqual(2);
          expect(opts).toContain(Math.round(p * 100) / 100);
        } else expect(mostCommon(q.context), q.context.join(' ')).not.toBeNull();
      }
  });
});
