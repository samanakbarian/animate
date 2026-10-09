import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { MAX_EVENTS, plan } from './tools';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

const ALL = { rakna: true, vader: true };
const at = (t: number) => {
  const p = evaluateParams({ params: PARAMS, tracks: TRACKS }, t);
  const ev = plan(Math.round(p.question), { rakna: p.rakna >= 0.5, vader: p.vader >= 0.5 });
  return { ev, now: ev[Math.min(ev.length, Math.round(p.step)) - 1] };
};

describe('verktyg', () => {
  it('miniräknaren ger rätt svar, utan den blir det fel', () => {
    const with_ = plan(0, ALL);
    expect(with_.map((e) => e.kind)).toEqual(['fraga', 'anrop', 'resultat', 'svar']);
    expect(with_[3]).toMatchObject({ ok: true, text: '4 817 × 296 = 1 425 832.' });
    expect(plan(0, { rakna: false, vader: true })[1]).toMatchObject({ kind: 'svar', ok: false });
  });

  it('inget verktyg för det modellen redan vet, flera anrop för jämförelsen', () => {
    expect(plan(2, ALL).some((e) => e.kind === 'anrop')).toBe(false);
    const cmp = plan(3, ALL);
    expect(cmp.filter((e) => e.kind === 'anrop')).toHaveLength(3);
    expect(cmp.length).toBeLessThanOrEqual(MAX_EVENTS);
    expect(cmp[cmp.length - 1]).toMatchObject({ text: 'Det blir 16 grader varmare i Malmö.' });
  });

  it('manuset visar det texten säger', () => {
    expect(at(8).now).toMatchObject({ kind: 'svar', ok: false }); // den gissar
    expect(at(20).now.kind).toBe('anrop');
    expect(at(30).now.kind).toBe('resultat');
    expect(at(38).now).toMatchObject({ kind: 'svar', ok: true });
    expect(at(48).ev.some((e) => e.kind === 'anrop')).toBe(false); // modellen väljer
    expect(at(63).ev.filter((e) => e.kind === 'anrop')).toHaveLength(3);
    expect(at(70).now).toMatchObject({ kind: 'svar', text: expect.stringContaining('kan inte se') });
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
