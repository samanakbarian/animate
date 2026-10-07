import { describe, expect, it } from 'vitest';
import { type Line, accuracy, bestAccuracy, blueSide, makePoints, starsFor } from './boundary';

const pts = (level: number) => makePoints(level);

describe('dra gränsen', () => {
  it('blå sida är vänster om linjen, och flip byter', () => {
    const line: Line = { p1: [-1, 0], p2: [1, 0], flip: false };
    expect(blueSide(line, 0, 0.5)).toBe(true);
    expect(blueSide({ ...line, flip: true }, 0, 0.5)).toBe(false);
  });

  it('bana 1 och 2 går att lösa helt', () => {
    expect(bestAccuracy(pts(0))).toBe(1);
    expect(bestAccuracy(pts(1))).toBe(1);
  });

  it('bana 3 överlappar: ingen linje blir helt rätt, men bra', () => {
    const b = bestAccuracy(pts(2));
    expect(b).toBeLessThan(1);
    expect(b).toBeGreaterThan(0.7);
  });

  it('bana 4 (ringen) går inte att lösa med en linje', () => {
    expect(bestAccuracy(pts(3))).toBeLessThan(0.8);
  });

  it('den kända linjen y = 0,6x + 0,05 löser bana 2', () => {
    const line: Line = { p1: [-1, -0.55], p2: [1, 0.65], flip: false };
    expect(accuracy(pts(1), line)).toBe(1);
  });

  it('stjärnor räknas mot bästa möjliga', () => {
    expect(starsFor(0.75, 0.75)).toBe(3);
    expect(starsFor(0.7, 0.75)).toBe(2);
    expect(starsFor(0.5, 0.75)).toBe(1);
  });

  it('samma frö ger samma prickar', () => {
    expect(pts(2)).toEqual(pts(2));
  });
});
