import { describe, expect, it } from 'vitest';
import { LEVELS, evaluate, pool, starsFor } from './pool';

const pick = (level: number, labels: string[]) => {
  const p = pool(level);
  const out: number[] = [];
  for (const l of labels) {
    const i = p.findIndex((c, j) => c.label === l && !out.some((o) => o === j));
    out.push(i);
  }
  return out.map((i) => p[i]);
};

describe('snedvriden data', () => {
  it('högarna har rätt storlek', () => {
    LEVELS.forEach((L, i) => expect(pool(i)).toHaveLength(L.counts.reduce((a, b) => a + b, 0)));
  });

  it('ett blandat urval ger tre stjärnor, ett snedvridet bara en', () => {
    const fair = evaluate(pick(0, ['Varg i snö', 'Varg på gräs', 'Hund på gräs', 'Hund i snö', 'Varg i snö', 'Hund på gräs']));
    const skewed = evaluate(pick(0, ['Varg i snö', 'Varg i snö', 'Varg i snö', 'Hund på gräs', 'Hund på gräs', 'Hund på gräs']));
    expect(starsFor(fair.accuracy)).toBe(3);
    expect(starsFor(skewed.accuracy)).toBe(1);
    expect(skewed.snow).toBeGreaterThan(fair.snow);
  });

  it('bana 3: alla tio snedvridna bilder är sämre än sex blandade', () => {
    const many = evaluate(pick(2, [...Array(5).fill('Varg i snö'), ...Array(5).fill('Hund på gräs')]));
    const few = evaluate(pick(2, ['Varg i snö', 'Varg på gräs', 'Varg på gräs', 'Hund på gräs', 'Hund i snö', 'Hund i snö']));
    expect(few.accuracy).toBeGreaterThan(many.accuracy);
  });
});
