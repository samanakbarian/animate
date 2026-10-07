import { describe, expect, it } from 'vitest';
import { Rng } from '@nastasteg/engine/core/math';
import { LEVELS, bestSplit, judge, pieces, shuffled, tokenId } from './tokens';

describe('tokenjakten', () => {
  it('klipper ord i bitar', () => {
    expect(pieces('hundar', [false, false, false, true, false])).toEqual(['hund', 'ar']);
    expect(pieces('hej', [])).toEqual(['hej']);
  });

  it('hittar så få bitar som möjligt', () => {
    expect(bestSplit('fotbollsplan', LEVELS[1].vocab)).toEqual(['fot', 'boll', 's', 'plan']);
    expect(bestSplit('jag är här', LEVELS[2].vocab)).toEqual(['jag', ' är', ' här']);
    expect(bestSplit('2026', LEVELS[3].vocab)).toEqual(['202', '6']);
  });

  it('bedömer svar', () => {
    const v = LEVELS[0].vocab;
    expect(judge('hundar', [false, false, false, true, false], v)).toBe('right');
    expect(judge('hundar', [false, false, true, false, false], v)).toBe('invalid');
    expect(judge('hundar', [true, true, true, true, true], v)).toBe('too-many');
  });

  it('varje ord går att dela upp, och få ord är redan hela tokens', () => {
    for (const L of LEVELS) {
      for (const w of L.words) {
        const best = bestSplit(w, L.vocab);
        expect(best.join('')).toBe(w);
        // banor där ordet redan är en token finns, men inte för många
        expect(best.length).toBeGreaterThanOrEqual(1);
      }
      const whole = L.words.filter((w) => bestSplit(w, L.vocab).length === 1).length;
      expect(whole).toBeLessThanOrEqual(2);
    }
  });

  it('token-id är fasta och skiljer på mellanslag', () => {
    expect(tokenId('hund')).toBe(tokenId('hund'));
    expect(tokenId(' hund')).not.toBe(tokenId('hund'));
    expect(tokenId('hund')).toBeGreaterThanOrEqual(100);
  });

  it('blandar deterministiskt', () => {
    expect(shuffled(0, new Rng(5))).toEqual(shuffled(0, new Rng(5)));
    expect([...shuffled(0, new Rng(5))].sort()).toEqual([...LEVELS[0].words].sort());
  });
});
