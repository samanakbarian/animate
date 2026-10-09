import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { accuracy, makePhotos, train, trickyTest } from './learn';
import { CHAPTERS_1, CHAPTERS_2, PARAMS_1, PARAMS_2, TRACKS_1, TRACKS_2 } from './timeline';
import { speechResult } from './speech';

describe('manuset för data och bias', () => {
  it('kapitlen säger det modellen faktiskt gör', () => {
    const at = (t: number) => evaluateParams({ params: PARAMS_1, tracks: TRACKS_1 }, t);
    const acc = (t: number) => {
      const photos = makePhotos(80, Math.round(at(t).snowy * 100) / 100);
      const m = train(photos);
      return { train: accuracy(m, photos), tricky: accuracy(m, trickyTest()) };
    };
    expect(acc(30).train).toBeGreaterThan(0.9); // ”nästan allt blir rätt”
    expect(acc(45).tricky).toBeLessThan(0.5); // ”de flesta fel”
    expect(acc(60).tricky).toBeGreaterThan(0.85); // ”testet går bra”
    expect(at(45).test).toBe(1);
  });

  it('del 2: 96 % i snitt och skånska sämre', () => {
    const share = evaluateParams({ params: PARAMS_2, tracks: TRACKS_2 }, 5).share;
    expect(Math.round(speechResult(share).average * 100)).toBe(96);
    expect(speechResult(share).b).toBeLessThan(0.8);
  });

  it('texterna är korta nog', () => {
    for (const c of [...CHAPTERS_1, ...CHAPTERS_2]) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
