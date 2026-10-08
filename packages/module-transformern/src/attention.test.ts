import { describe, expect, it } from 'vitest';
import { SENTENCES, attention } from './attention';

const top = (row: number[]) => row.indexOf(Math.max(...row));

describe('uppmärksamhet', () => {
  it('varje rad är en sannolikhetsfördelning', () => {
    for (const s of SENTENCES)
      for (let h = 0; h < 3; h++) for (const row of attention(s, h)) expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });
  it('”den” tittar på katten när den är trött och på mattan när den är mjuk', () => {
    const den = 5;
    expect(SENTENCES[0][top(attention(SENTENCES[0], 0)[den])].text).toBe('katten');
    expect(SENTENCES[1][top(attention(SENTENCES[1], 0)[den])].text).toBe('mattan');
    expect(SENTENCES[2][top(attention(SENTENCES[2], 0)[4])].text).toBe('barnet');
  });
  it('närhetshuvudet tittar mest på sig själv och grannarna', () => {
    const a = attention(SENTENCES[0], 1);
    expect(top(a[3])).toBe(3);
    expect(a[3][2]).toBeGreaterThan(a[3][7]);
  });
  it('skärpan gör fördelningen spetsigare', () => {
    const soft = Math.max(...attention(SENTENCES[0], 0, 0.5)[5]);
    const sharp = Math.max(...attention(SENTENCES[0], 0, 3)[5]);
    expect(sharp).toBeGreaterThan(soft);
  });

  it('kausal uppmärksamhet ger framtida ord vikt 0', () => {
    for (const s of SENTENCES)
      for (let h = 0; h < 3; h++)
        attention(s, h, 1, true).forEach((row, i) => {
          expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
          row.forEach((w, j) => {
            if (j > i) expect(w).toBe(0);
          });
        });
  });
  it('utan att se ”trött” kan ”den” inte välja, men ”trött” tittar tillbaka på katten', () => {
    const a = attention(SENTENCES[0], 0, 1, true);
    expect(a[5][0]).toBeCloseTo(a[5][3], 9); // katten och mattan lika
    expect(SENTENCES[0][top(a[7])].text).toBe('katten');
    expect(SENTENCES[1][top(attention(SENTENCES[1], 0, 1, true)[7])].text).toBe('mattan');
  });
});
