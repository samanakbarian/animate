import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { decide } from './beslut';
import { CHAPTERS_0, DURATION_0, PARAMS_0, TRACKS_0 } from './timeline-beslut';

describe('del 1: ett beslut', () => {
  it('lägger ihop poängen och tänder lampan över noll', () => {
    const r = decide({ sun: 1, homework: 0, wSun: 2, wHomework: -3, b: -1 });
    expect(r.z).toBe(1);
    expect(r.yes).toBe(true);
    expect(r.lamp).toBeGreaterThan(0.99);
    expect(decide({ sun: 1, homework: 1, wSun: 2, wHomework: -3, b: -1 }).yes).toBe(false);
  });

  it('berättartexterna är korta och kapitlen ligger i ordning', () => {
    let last = -1;
    for (const c of CHAPTERS_0) {
      expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
      expect(c.start).toBeGreaterThan(last);
      last = c.start;
    }
    expect(last).toBeLessThan(DURATION_0);
  });

  it('filmen visar lampan både tänd och släckt i varje kapitel där det behövs', () => {
    const at = (t: number) => {
      const v = evaluateParams({ params: PARAMS_0, tracks: TRACKS_0 }, t);
      return decide({ sun: v.sun, homework: v.homework, wSun: v.wSun, wHomework: v.wHomework, b: v.b }).yes;
    };
    expect(at(4)).toBe(true); // sol, inga läxor
    expect(at(16)).toBe(false); // läxorna drar ner
    expect(at(27)).toBe(false); // mulet
    expect(at(35)).toBe(false); // lite sol, lite läxor
    expect(at(41)).toBe(true); // biasen höjd
  });
});
