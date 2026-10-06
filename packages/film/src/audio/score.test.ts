import { describe, expect, it } from 'vitest';
import { LAMP_TOGGLES, bassPulse, buildScore, filmScore, lampOn } from './score';
import { DURATION } from '../timeline';

describe('partituret', () => {
  const events = buildScore();
  it('är sorterat och ryms i filmen', () => {
    for (let i = 1; i < events.length; i++) expect(events[i].time).toBeGreaterThanOrEqual(events[i - 1].time);
    expect(events[0].time).toBeGreaterThanOrEqual(0);
    expect(events.at(-1)!.time).toBeLessThan(DURATION);
  });
  it('ger pad och stab sina ackordtoner', () => {
    for (const e of events) if (e.inst === 'pad' || e.inst === 'stab') expect(e.notes?.length).toBeGreaterThan(0);
  });
  it('är tyst i takt 51 (127,5–130 s)', () => {
    const musical = events.filter((e) => e.time >= 127.5 && e.time < 130 && e.inst !== 'crash');
    expect(musical).toEqual([]);
  });
  it('har glitch-ljud vid stegbytena', () => {
    expect(events.some((e) => e.inst === 'glitch' && Math.abs(e.time - (10 - 0.12)) < 1e-9)).toBe(true);
  });
  it('slutar i dur: D-durackord när lampan tänds igen och vid titeln', () => {
    const pad = events.find((e) => e.inst === 'pad' && e.time === 138.5);
    expect(pad?.notes).toContain(66); // F♯ = durters
    expect(events.filter((e) => e.inst === 'piano' && e.time === 147.5).length).toBeGreaterThanOrEqual(3);
  });
  it('exporterar ett komplett Score', () => {
    const s = filmScore();
    expect(s.duration).toBe(DURATION);
    expect(s.ambience?.(141.9)).toBeGreaterThan(0);
    expect(s.ambience?.(143)).toBe(0);
  });
});

describe('lampan och basens puls', () => {
  it('slocknar och tänds igen', () => {
    expect(LAMP_TOGGLES.length % 2).toBe(0);
    expect(lampOn(134)).toBe(true);
    expect(lampOn(138)).toBe(false);
    expect(lampOn(140)).toBe(true);
  });
  it('pulserar inom [0, 1]', () => {
    for (let t = 0; t < DURATION; t += 0.25) {
      const p = bassPulse(t);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
