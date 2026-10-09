import { describe, expect, it } from 'vitest';
import { LEVELS, examples, hint, par, wrong } from './neuron';

describe('lär maskinen', () => {
  it('varje bana går att lösa, och paret blir som väntat', () => {
    expect(LEVELS.map(par)).toEqual([1, 2, 4]);
  });

  it('en lösning för bana 3 ger alla rätt', () => {
    expect(wrong([1, -2, 1, 0], examples(LEVELS[2]))).toHaveLength(0);
  });

  it('ledtråden pekar åt rätt håll', () => {
    expect(hint(LEVELS[0], [0, 0, 0])).toMatch(/Höj/);
    expect(hint(LEVELS[1], [1, 0, 0])).toMatch(/Sänk/);
    expect(hint(LEVELS[0], [1, 0, 0])).toBeNull();
  });
});
