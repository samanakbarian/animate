import { describe, expect, it } from 'vitest';
import { TRICKY, run } from './team';

describe('laget', () => {
  it('fler arbetare går fortare', () => {
    expect(run(1, false, false).time).toBe(12);
    expect(run(4, false, false).time).toBe(3);
  });

  it('utan granskning blir det flera fel', () => {
    expect(run(3, false, false).errorsLeft).toBeGreaterThanOrEqual(3);
  });

  it('granskande agent hittar slarvfel men missar knepiga fel', () => {
    const a = run(3, true, false);
    expect(a.caughtByAgent).toBeGreaterThanOrEqual(1);
    const left = a.fate.map((f, i) => [f, i] as const).filter(([f]) => f === 'error');
    expect(left.length).toBeGreaterThanOrEqual(2);
    expect(left.every(([, i]) => TRICKY.has(i))).toBe(true);
  });

  it('människan hittar det som agenterna missade, men det tar tid', () => {
    const h = run(3, true, true);
    expect(h.errorsLeft).toBeLessThanOrEqual(1);
    expect(h.caughtByHuman).toBeGreaterThanOrEqual(1);
    expect(h.time).toBeGreaterThan(run(3, true, false).time + 3);
  });

  it('antalet fel beror inte på hur många arbetare som delar på jobbet', () => {
    expect(run(1, true, false).errorsLeft).toBe(run(4, true, false).errorsLeft);
  });
});
