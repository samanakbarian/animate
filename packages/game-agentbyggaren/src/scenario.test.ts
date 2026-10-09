import { describe, expect, it } from 'vitest';
import { LEVELS, bestScore, run } from './scenario';

const S = (...ids: string[]) => new Set(ids);

describe('agentbyggaren', () => {
  it('bana 1: rätt verktyg och godkännande för betalning ger bäst resultat', () => {
    const L = LEVELS[0];
    const best = run(L, { granted: S('kalender', 'boka', 'sms', 'betala'), approval: S('betala') });
    expect(best.done).toBe(true);
    expect(best.incidents).toBe(0);
    // utan betalverktyget alls blir det lika bra eller bättre: agenten kan inte betala
    const lean = run(L, { granted: S('kalender', 'boka', 'sms'), approval: S() });
    expect(lean.score).toBe(5);
    expect(bestScore(L)).toBe(5);
  });

  it('saknas ett nödvändigt verktyg fastnar agenten', () => {
    const r = run(LEVELS[0], { granted: S('kalender', 'sms'), approval: S() });
    expect(r.done).toBe(false);
    expect(r.log.at(-1)!.kind).toBe('unused');
    expect(r.log.some((l) => l.kind === 'missing')).toBe(true);
  });

  it('bana 2: radera utan godkännande raderar chefens mejl', () => {
    const L = LEVELS[1];
    const risky = run(L, { granted: S('lasa', 'flytta', 'radera'), approval: S() });
    expect(risky.incidents).toBe(1);
    const safe = run(L, { granted: S('lasa', 'flytta', 'radera'), approval: S('radera') });
    expect(safe.incidents).toBe(0);
    expect(safe.score).toBe(bestScore(L));
  });

  it('varje bana har ett bästa resultat som går att nå med uppdraget klart', () => {
    for (const L of LEVELS) expect(bestScore(L), L.title).toBeGreaterThan(0);
  });
});
