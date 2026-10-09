import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { SHAPES, classify, convolve, edgeProfile, picture } from './vision';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

const argmax = (p: number[]) => p.indexOf(Math.max(...p));

describe('datorseende', () => {
  it('känner igen alla fyra former utan brus', () => {
    SHAPES.forEach((_, s) => {
      const p = classify(picture(s));
      expect(argmax(p), SHAPES[s]).toBe(s);
      expect(p[s]).toBeGreaterThan(0.9);
    });
  });

  it('lodräta filtret svarar på kvadratens sidor men inte mitt i den', () => {
    const m = convolve(picture(0), 0);
    expect(Math.abs(m[8 * 16 + 3])).toBeGreaterThan(1); // vänsterkanten
    expect(m[8 * 16 + 8]).toBe(0); // mitten
  });

  it('kvadraten har mest raka kanter, krysset mest sneda', () => {
    const sq = edgeProfile(picture(0)),
      x = edgeProfile(picture(3));
    expect(sq[0] + sq[1]).toBeGreaterThan(0.8);
    expect(x[2] + x[3]).toBeGreaterThan(0.55);
  });

  it('manuset: med mycket brus svarar modellen säkert cirkel på kvadraten', () => {
    const at = (t: number) => evaluateParams({ params: PARAMS, tracks: TRACKS }, t);
    const p = at(77);
    expect(Math.round(p.shape)).toBe(0);
    const c = classify(picture(0, Math.round(p.noise * 20) / 20));
    expect(argmax(c)).toBe(2);
    expect(c[2]).toBeGreaterThan(0.8);
    // och lite brus klarar den
    expect(argmax(classify(picture(0, 0.2)))).toBe(0);
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
