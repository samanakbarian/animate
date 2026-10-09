import { describe, expect, it } from 'vitest';
import { dayNumber, questionForDay, updateStreak } from './daily';

describe('dagens AI-fråga', () => {
  it('räknar kalenderdagar', () => {
    expect(dayNumber(new Date(2026, 0, 1, 23, 59))).toBe(0);
    expect(dayNumber(new Date(2026, 9, 9, 0, 1))).toBe(281);
  });

  it('går igenom alla frågor innan någon upprepas', () => {
    const keys = Array.from({ length: 12 }, (_, i) => `fråga ${i}`);
    const seen = new Set(Array.from({ length: 12 }, (_, d) => questionForDay(d, keys)));
    expect(seen.size).toBe(12);
    expect(questionForDay(12, keys)).toBe(questionForDay(0, keys));
    expect(questionForDay(-1, keys)).toBe(questionForDay(11, keys));
  });

  it('svit: dagar i rad räknas, ett glapp börjar om', () => {
    let s = updateStreak(null, 10);
    s = updateStreak(s, 11);
    s = updateStreak(s, 11);
    expect(s).toEqual({ last: 11, count: 2 });
    expect(updateStreak(s, 13)).toEqual({ last: 13, count: 1 });
  });
});
