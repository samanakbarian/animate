import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { EXAMPLES, TIERS } from './rules';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

const at = (t: number) => EXAMPLES[Math.round(evaluateParams({ params: PARAMS, tracks: TRACKS }, t).example)];

describe('AI och lagen', () => {
  it('varje nivå har exempel och krav', () => {
    for (const tier of TIERS) {
      expect(
        EXAMPLES.some((e) => e.level === tier.id),
        tier.id,
      ).toBe(true);
      expect(tier.rules.length).toBeGreaterThan(0);
    }
  });

  it('manuset visar ett exempel från den nivå kapitlet handlar om', () => {
    const level = (t: number) => at(t).level;
    expect(level(14)).toBe('minimal');
    expect(level(25)).toBe('begransad');
    expect(level(30)).toBe('begransad');
    expect(level(37)).toBe('hog');
    expect(level(46)).toBe('hog');
    expect(level(50)).toBe('forbjuden');
    expect(level(57)).toBe('forbjuden');
    expect(at(65).personal).toBe(true); // GDPR-kapitlet
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
