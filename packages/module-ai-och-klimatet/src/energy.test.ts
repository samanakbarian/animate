import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { GRIDS, USES, daysToTraining, fmt, fmtCo2, fmtWh, year } from './energy';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

const at = (t: number) => {
  const p = evaluateParams({ params: PARAMS, tracks: TRACKS }, t);
  return { use: USES[Math.round(p.use)], perDay: Math.round(p.perDay), grid: Math.round(p.grid) };
};

describe('AI och klimatet', () => {
  it('räknar ett år rätt', () => {
    const r = year(USES[0], 20);
    expect(r.kwh).toBeCloseTo(2.19, 6);
    expect(Math.round(r.phones)).toBe(146);
    expect(r.co2[0]).toBeCloseTo(2.19 * 40, 6);
  });

  it('en kort film kräver tusentals gånger mer än ett textsvar', () => {
    expect(USES[3].wh / USES[0].wh).toBeGreaterThan(1000);
  });

  it('kolkraft ger ungefär tjugo gånger mer än svensk el', () => {
    expect(GRIDS[2].g / GRIDS[0].g).toBe(20);
  });

  it('användningen kommer ikapp träningen på drygt fyra dagar', () => {
    expect(daysToTraining()).toBeGreaterThan(4);
    expect(daysToTraining()).toBeLessThan(5);
  });

  it('formaterar svenska tal', () => {
    expect(fmt(2.19)).toBe('2,2');
    expect(fmt(146)).toBe('146');
    expect(fmt(1300)).toBe('1 300');
    expect(fmt(36500)).toBe('36 500');
    expect(fmtWh(0.3)).toBe('0,3 Wh');
    expect(fmtWh(2190)).toBe('2,2 kWh');
    expect(fmtCo2(1752)).toBe('1,8 kg');
  });

  it('manuset: kort svar, sedan film, sedan tjugo om dagen, sedan kolkraft', () => {
    expect(at(15)).toEqual({ use: USES[0], perDay: 1, grid: 0 });
    expect(at(35).use).toBe(USES[3]);
    expect(at(50).perDay).toBe(20);
    expect(at(72).grid).toBe(2);
    expect(at(86)).toEqual({ use: USES[0], perDay: 20, grid: 0 });
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
