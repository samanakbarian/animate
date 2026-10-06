import { describe, expect, it } from 'vitest';
import { ACCURACY, MAX_BUDGET, PROBLEMS, solve, truth } from './solver';

describe('uppgifterna', () => {
  it('har rätta svar', () => {
    expect(PROBLEMS.map(truth)).toEqual([53, 9, 19]);
  });
});

describe('resonemang', () => {
  it('tåget: direkt svar blir fel, fyra tankesteg blir rätt', () => {
    expect(solve(PROBLEMS[0], 0).ok).toBe(false);
    expect(solve(PROBLEMS[0], 4).ok).toBe(true);
  });

  it('äggen: ett skrivet fel som en kontroll hittar', () => {
    const two = solve(PROBLEMS[2], 2);
    expect(two.ok).toBe(false);
    const three = solve(PROBLEMS[2], 3);
    expect(three.checks).toEqual([1]);
    expect(three.lines[1].fixed).toBe(true);
    expect(three.ok).toBe(true);
  });

  it('mer tänkande ger oftare rätt svar på testuppgifterna', () => {
    expect(ACCURACY).toHaveLength(MAX_BUDGET + 1);
    expect(ACCURACY[0]).toBeLessThan(0.6);
    expect(ACCURACY[MAX_BUDGET]).toBeGreaterThan(0.95);
    for (let b = 1; b <= MAX_BUDGET; b++) expect(ACCURACY[b]).toBeGreaterThanOrEqual(ACCURACY[b - 1]);
  });

  it('är deterministisk', () => {
    expect(solve(PROBLEMS[1], 5)).toEqual(solve(PROBLEMS[1], 5));
  });
});
