import { describe, expect, it } from 'vitest';
import { QUESTIONS, reply, tally } from './confidence';
import { EXAMPLES, REQUESTS, score, stats } from './filter';

describe('säker men fel', () => {
  it('sannolikheterna summerar till 1', () => {
    for (const q of QUESTIONS) expect(q.candidates.reduce((a, c) => a + c.p, 0)).toBeCloseTo(1, 6);
  });

  it('vanliga frågor blir rätt, påhittade blir fel med samma säkra ton', () => {
    expect(reply(QUESTIONS[0]).verdict).toBe('right');
    expect(reply(QUESTIONS[3]).verdict).toBe('wrong');
    expect(reply(QUESTIONS[5]).verdict).toBe('wrong');
    expect(reply(QUESTIONS[5]).text.endsWith('.')).toBe(true);
  });

  it('när modellen vet är det troligaste svaret mycket troligare än när den gissar', () => {
    expect(reply(QUESTIONS[0]).top).toBeGreaterThan(0.9);
    expect(reply(QUESTIONS[5]).top).toBeLessThan(0.25);
  });

  it('gränsen 0,5: inga fel kvar, men ett rätt svar blir ”vet inte”', () => {
    expect(tally(0)).toEqual({ right: 3, wrong: 3, abstain: 0 });
    expect(tally(0.5)).toEqual({ right: 2, wrong: 0, abstain: 4 });
  });
});

describe('spärrar', () => {
  it('har 30 skadliga och 90 ofarliga förfrågningar', () => {
    expect(REQUESTS.filter((r) => r.harmful)).toHaveLength(30);
    expect(REQUESTS).toHaveLength(120);
  });

  it('strikt gräns: inget skadligt slinker igenom, men många ofarliga nekas', () => {
    const s = stats(0.4, 0, false);
    expect(s.leaked).toBeLessThanOrEqual(1);
    expect(s.overRefused).toBeGreaterThanOrEqual(15);
  });

  it('slapp gräns: få ofarliga nekas, men skadliga slinker igenom', () => {
    const s = stats(0.8, 0, false);
    expect(s.overRefused).toBeLessThanOrEqual(1);
    expect(s.leaked).toBeGreaterThanOrEqual(10);
  });

  it('lurendrejeri släpper igenom fler, omträning tar tillbaka det mesta', () => {
    const plain = stats(0.6, 0, false).leaked;
    const tricked = stats(0.6, 1, false).leaked;
    const retrained = stats(0.6, 1, true).leaked;
    expect(tricked).toBeGreaterThan(plain + 10);
    expect(retrained).toBeLessThan(plain + 5);
  });

  it('exemplen visar poängen vid gränsen 0,5', () => {
    expect(score(EXAMPLES[0], 0, false)).toBeGreaterThanOrEqual(0.5); // ofarlig men nekas
    expect(score(EXAMPLES[2], 1, false)).toBeLessThan(0.5); // rollspelet slinker igenom
    expect(score(EXAMPLES[2], 1, true)).toBeGreaterThanOrEqual(0.5);
  });
});
