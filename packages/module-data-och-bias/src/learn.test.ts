import { describe, expect, it } from 'vitest';
import { accuracy, fairTest, makePhotos, snowShare, train, trickyTest } from './learn';
import { speechResult } from './speech';

describe('data och bias', () => {
  it('snedvriden data: bra på träningen, dålig på hundar i snö', () => {
    const train95 = makePhotos(80, 0.95);
    const m = train(train95);
    expect(accuracy(m, train95)).toBeGreaterThan(0.85);
    expect(accuracy(m, trickyTest())).toBeLessThan(0.45);
    expect(snowShare(m)).toBeGreaterThan(0.6);
  });

  it('balanserad data: modellen lär sig formen i stället', () => {
    const m = train(makePhotos(80, 0.5));
    expect(accuracy(m, trickyTest())).toBeGreaterThan(0.6);
    expect(snowShare(m)).toBeLessThan(0.3);
    expect(accuracy(m, fairTest())).toBeGreaterThan(accuracy(train(makePhotos(80, 0.95)), fairTest()));
  });

  it('deterministiskt', () => {
    expect(train(makePhotos(40, 0.8))).toEqual(train(makePhotos(40, 0.8)));
  });

  it('taligenkänning: snittet döljer att den mindre dialekten förstås sämre', () => {
    const r = speechResult(0.05);
    expect(r.average).toBeGreaterThan(0.9);
    expect(r.b).toBeLessThan(0.8);
    expect(speechResult(0.5).gap).toBeCloseTo(0, 6);
  });
});
