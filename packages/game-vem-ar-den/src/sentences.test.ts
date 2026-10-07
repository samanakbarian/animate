import { describe, expect, it } from 'vitest';
import { Rng } from '@nastasteg/engine/core/math';
import { LEVELS, bare, parse, shuffled } from './sentences';

describe('vem är den', () => {
  const all = LEVELS.flatMap((l) => l.items);

  it('varje mening har ett svar före pronomenet', () => {
    for (const it of all) {
      expect(it.text.match(/\[/g)?.length, it.text).toBe(1);
      expect(it.text.match(/\{/g)?.length, it.text).toBe(1);
      const p = parse(it);
      expect(p.answer, it.text).toBeGreaterThanOrEqual(0);
      expect(p.answer, it.text).toBeLessThan(p.pronoun);
    }
  });

  it('uppmärksamheten är en fördelning över orden före pronomenet', () => {
    for (const it of all) {
      const p = parse(it);
      const before = p.words.slice(0, p.pronoun).map(bare);
      for (const k of Object.keys(it.attn)) expect(before, `${k} i ${it.text}`).toContain(k);
      expect(p.weights.length).toBe(p.pronoun);
      expect(p.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
      expect(Math.min(...p.weights)).toBeGreaterThanOrEqual(0);
    }
  });

  it('huvudet väljer fel bara där det är markerat', () => {
    for (const it of all) {
      const p = parse(it);
      expect(p.headPick === p.answer, it.text).toBe(!it.headWrong);
    }
  });

  it('blandar inte paren men blandar övriga banor deterministiskt', () => {
    expect(shuffled(1, new Rng(3))).toEqual(LEVELS[1].items);
    expect(shuffled(0, new Rng(3))).toEqual(shuffled(0, new Rng(3)));
  });
});
