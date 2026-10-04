import { describe, expect, it } from 'vitest';
import { DATA, MAX_STEPS, RADIUS, computeRun, trainingRun } from './network';

describe('datasetet', () => {
  it('är balanserat och seedat', () => {
    expect(DATA.filter((p) => p.label === 1)).toHaveLength(40);
    expect(DATA.filter((p) => p.label === 0)).toHaveLength(40);
    for (const p of DATA) expect(Math.hypot(p.x1, p.x2) < RADIUS ? 1 : 0).toBe(p.label);
  });
});

describe('träningen', () => {
  it('är deterministisk', () => {
    const a = computeRun(3, 1.5, DATA);
    const b = computeRun(3, 1.5, DATA);
    expect(Array.from(a.losses)).toEqual(Array.from(b.losses));
    expect(Array.from(a.snapshots[MAX_STEPS].h)).toEqual(Array.from(b.snapshots[MAX_STEPS].h));
  });
  it('lär sig cirkeln med fyra dolda neuroner', () => {
    const run = trainingRun(4, 1.5);
    expect(run.losses[MAX_STEPS]).toBeLessThan(run.losses[0] * 0.5);
    expect(run.accuracies[MAX_STEPS]).toBeGreaterThanOrEqual(0.95);
  });
  it('klarar det inte med en enda neuron (en rak linje)', () => {
    const one = trainingRun(1, 1.5);
    expect(one.accuracies[MAX_STEPS]).toBeLessThan(0.8);
  });
});
