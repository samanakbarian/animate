import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { STEPS, blur, distance, frame, noise, target } from './diffuse';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

describe('från brus till bild', () => {
  it('börjar som brus och slutar som bilden', () => {
    expect(distance(frame(0, 1, 0), noise(1))).toBe(0);
    expect(distance(frame(0, 1, STEPS), target(0, 1))).toBe(0);
  });

  it('kommer närmare bilden för varje steg', () => {
    const goal = target(1, 3);
    let last = Infinity;
    for (let s = 0; s <= STEPS; s += 2) {
      const d = distance(frame(1, 3, s), goal);
      expect(d).toBeLessThan(last);
      last = d;
    }
  });

  it('grovt först: halvvägs liknar bilden den suddiga versionen mer än den skarpa', () => {
    const half = frame(0, 1, STEPS / 2);
    const sharp = target(0, 1);
    expect(distance(half, blur(sharp, 3))).toBeLessThan(distance(half, sharp));
  });

  it('nytt startbrus ger en annan bild, samma frö ger samma', () => {
    for (let p = 0; p < 3; p++) {
      expect(distance(target(p, 1), target(p, 2))).toBeGreaterThan(0.01);
      expect(distance(target(p, 4), target(p, 4))).toBe(0);
    }
  });

  it('manuset: annan text vid 46 s, annat brus vid 58 s, baklänges under träningen', () => {
    const at = (t: number) => evaluateParams({ params: PARAMS, tracks: TRACKS }, t);
    expect(at(5).step).toBe(0);
    expect(at(35).step).toBe(STEPS);
    expect(at(46)).toMatchObject({ prompt: 1, seed: 1, step: STEPS });
    expect(at(58)).toMatchObject({ prompt: 0, seed: 2, step: STEPS });
    expect(at(66).step).toBeLessThan(at(62).step);
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
