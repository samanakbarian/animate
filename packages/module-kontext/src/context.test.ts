import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { CHAT, contextFor } from './context';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

const at = (t: number) => {
  const p = evaluateParams({ params: PARAMS, tracks: TRACKS }, t);
  return contextFor(Math.round(p.count), Math.round(p.window), p.memory >= 0.5);
};

describe('kontext', () => {
  it('det senaste får plats först, och fönstret räcker aldrig till mer än det rymmer', () => {
    for (const win of [40, 120, 300]) {
      const r = contextFor(CHAT.length, win, false);
      expect(r.used).toBeLessThanOrEqual(win);
      const first = r.inside.indexOf(true);
      if (first >= 0) expect(r.inside.slice(first).every(Boolean)).toBe(true);
    }
  });

  it('manuset: kort samtal ryms, långt samtal glömmer hunden, större fönster och minne hjälper', () => {
    expect(at(10).inside.every(Boolean)).toBe(true);
    expect(at(40).remembers).toBe(false);
    expect(at(40).inside[0]).toBe(false);
    expect(at(58).remembers).toBe(true);
    expect(at(66).remembers).toBe(true);
    expect(at(66).inside[0]).toBe(false); // minnet, inte första meddelandet
    expect(at(76).remembers).toBe(false);
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
