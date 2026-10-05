import { describe, expect, it } from 'vitest';
import { MAX_EVENTS, loopCount, scenario } from './scenario';

describe('agentens förlopp', () => {
  const plain = scenario({ failure: false, approval: false });
  const full = scenario({ failure: true, approval: true });

  it('börjar med ett mål och slutar klart', () => {
    for (const s of [plain, full]) {
      expect(s[0].kind).toBe('goal');
      expect(s.at(-1)!.kind).toBe('done');
    }
  });
  it('varvar tänk → agera → observera', () => {
    for (let i = 0; i < full.length; i++) if (full[i].kind === 'act') expect(full[i + 1].kind).toBe('observe');
  });
  it('planerar om när rummet är upptaget', () => {
    expect(full.some((e) => e.text.startsWith('Inga lediga rum'))).toBe(true);
    expect(plain.some((e) => e.text.startsWith('Inga lediga rum'))).toBe(false);
    expect(full.at(-1)!.text).toContain('ons 14:00');
    expect(plain.at(-1)!.text).toContain('tis 10:00');
  });
  it('frågar en människa innan bokningen bara när det krävs', () => {
    const ask = full.findIndex((e) => e.kind === 'ask');
    const book = full.findIndex((e) => e.text.startsWith('rum.boka'));
    expect(ask).toBeGreaterThan(0);
    expect(ask).toBeLessThan(book);
    expect(plain.some((e) => e.kind === 'ask')).toBe(false);
  });
  it('räknar varv i loopen', () => {
    expect(loopCount(full, full.length)).toBe(5);
    expect(loopCount(plain, plain.length)).toBe(4);
    expect(MAX_EVENTS).toBe(full.length);
  });
});
