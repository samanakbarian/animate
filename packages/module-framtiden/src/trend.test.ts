import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';
import { LAST, PACES, horizon, measuredMonths, workTime } from './trend';

const at = (t: number) => evaluateParams({ params: PARAMS, tracks: TRACKS }, t);

describe('Framtiden', () => {
  it('mätpunkterna fördubblas ungefär var sjunde månad', () => {
    expect(measuredMonths()).toBeGreaterThan(6);
    expect(measuredMonths()).toBeLessThan(7.5);
  });

  it('med sju månader blir det ett par arbetsmånader år 2030', () => {
    expect(workTime(horizon(2030, PACES[1]))).toBe('2 arbetsmånader');
  });

  it('med fjorton månader blir det dagar, och om trenden stannar ingenting nytt', () => {
    expect(workTime(horizon(2030, PACES[2]))).toBe('3,5 arbetsdagar');
    expect(horizon(2035, PACES[3])).toBe(LAST.s);
  });

  it('skriver arbetstid läsbart', () => {
    expect(workTime(7200)).toBe('2 timmar');
    expect(workTime(3600)).toBe('1 timme');
    expect(workTime(1e12)).toBe('mer än 100 arbetsår');
  });

  it('manuset: sju månader och 2030 när linjen visas', () => {
    expect(Math.round(at(46).pace)).toBe(1);
    expect(Math.round(at(46).year)).toBe(2030);
    expect(Math.round(at(51).pace)).toBe(0);
    expect(Math.round(at(58).pace)).toBe(3);
    expect(Math.round(at(90).pace)).toBe(1);
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
