import { describe, expect, it } from 'vitest';
import { moduleScore } from './sound';

const def = {
  id: 'test-modul',
  duration: 30,
  chapters: [
    { id: 'a', start: 0, title: 'A', caption: '' },
    { id: 'b', start: 12, title: 'B', caption: '' },
  ],
};

describe('modulernas ljud', () => {
  it('är deterministiskt och sorterat', () => {
    const a = moduleScore(def);
    expect(moduleScore(def)).toEqual(a);
    for (let i = 1; i < a.events.length; i++) expect(a.events[i].time).toBeGreaterThanOrEqual(a.events[i - 1].time);
  });

  it('håller sig inom filmens längd', () => {
    for (const e of moduleScore(def).events) {
      expect(e.time).toBeGreaterThanOrEqual(0);
      expect(e.time).toBeLessThan(def.duration);
    }
  });

  it('har en klang vid varje kapitel', () => {
    const ev = moduleScore(def).events;
    for (const ch of def.chapters) expect(ev.some((e) => e.inst === 'piano' && Math.abs(e.time - (ch.start + 0.05)) < 1e-9)).toBe(true);
  });

  it('olika moduler låter olika', () => {
    const other = moduleScore({ ...def, id: 'en-annan' });
    expect(other.events).not.toEqual(moduleScore(def).events);
  });
});
