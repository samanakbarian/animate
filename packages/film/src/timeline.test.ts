import { describe, expect, it } from 'vitest';
import { BAR, CHAPTERS, DURATION, STEPS, bubbleAt, stepAt, transitionAt, walkX, yearText } from './timeline';

describe('tidslinjen', () => {
  it('har 14 kapitel och slutet efter dem', () => {
    expect(CHAPTERS).toBe(14);
    expect(STEPS.at(-1)?.id).toBe('end');
  });
  it('är sammanhängande från 0 till 150 s', () => {
    expect(STEPS[0].start).toBe(0);
    expect(STEPS.at(-1)?.end).toBe(DURATION);
    for (let i = 1; i < STEPS.length; i++) expect(STEPS[i].start).toBe(STEPS[i - 1].end);
  });
  it('börjar varje steg på en taktgräns', () => {
    for (const s of STEPS) expect((s.start / BAR) % 1).toBeCloseTo(0, 9);
  });
  it('visar rätt årtal', () => {
    expect(yearText(0)).toBe('−300 000');
    expect(yearText(10.5)).toBe('2017');
    expect(yearText(50)).toBe('2023');
    expect(yearText(120)).toBe('∞');
    expect(yearText(140)).toBe('');
  });
  it('håller pratbubblor inom sitt steg', () => {
    for (let t = 0; t < DURATION; t += 0.1) {
      const b = bubbleAt(t);
      if (b) expect(b.until).toBeLessThanOrEqual(stepAt(t).end);
    }
  });
  it('har övergångar med k i [0, 1]', () => {
    for (let t = 0; t < DURATION; t += 0.05) {
      const { k } = transitionAt(t);
      expect(k).toBeGreaterThanOrEqual(0);
      expect(k).toBeLessThanOrEqual(1);
    }
  });
  it('låter figuren gå framåt och sedan stanna (ASI)', () => {
    for (let t = 0.5; t < 105; t += 0.5) expect(walkX(t)).toBeGreaterThan(walkX(t - 0.5));
    expect(walkX(120)).toBeCloseTo(walkX(110), 6);
  });
});
