import { describe, expect, it } from 'vitest';
import { MAX_STEPS, descend, gradient, loss } from './descent';

describe('fellandskapet', () => {
  it('har sitt minsta värde 0 i origo', () => {
    expect(loss(0, 0)).toBeCloseTo(0, 6);
  });

  it('gradienten stämmer med numerisk derivata', () => {
    const h = 1e-5;
    for (const [x, y] of [
      [1.2, -0.4],
      [-2.1, -0.3],
      [2.5, 1.5],
    ]) {
      const [gx, gy] = gradient(x, y);
      expect(gx).toBeCloseTo((loss(x + h, y) - loss(x - h, y)) / (2 * h), 4);
      expect(gy).toBeCloseTo((loss(x, y + h) - loss(x, y - h)) / (2 * h), 4);
    }
  });
});

describe('gradientnedstigning', () => {
  const end = (start: number, lr: number) => descend(start, lr).losses[MAX_STEPS];

  it('lagom steglängd når dalens botten', () => {
    expect(end(0, 0.15)).toBeLessThan(0.05);
  });

  it('för kort steglängd kommer knappt någonstans', () => {
    expect(end(0, 0.02)).toBeGreaterThan(1);
  });

  it('för lång steglängd studsar eller flyger iväg', () => {
    expect(end(0, 0.5)).toBeGreaterThan(0.3);
    expect(descend(0, 0.7).divergedAt).toBeGreaterThan(0);
  });

  it('en annan start fastnar i gropen', () => {
    const r = descend(1, 0.15);
    expect(r.losses[MAX_STEPS]).toBeGreaterThan(0.2);
    expect(r.path[MAX_STEPS][0]).toBeLessThan(-1.8);
  });

  it('är deterministisk', () => {
    expect(descend(2, 0.3)).toEqual(descend(2, 0.3));
  });
});
