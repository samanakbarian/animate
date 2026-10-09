import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { answer, closeness, flagsFrom } from './prompt';
import { CHAPTERS, DURATION, PARAMS, TRACKS } from './timeline';

const all = { task: true, context: true, format: true, example: true };
const none = { task: false, context: false, format: false, example: false };
const kinds = (f: typeof all) => answer(f).map((s) => s.kind);

describe('att prata med AI', () => {
  it('en vag fråga ger ett allmänt svar, en fullständig ger bara det du ville ha', () => {
    expect(kinds(none)).toContain('vague');
    expect(kinds(all).every((k) => k === 'ok')).toBe(true);
    expect(closeness(all)).toBeCloseTo(1);
    expect(closeness(none)).toBe(0);
  });

  it('uppgift utan sammanhang får modellen att hitta på', () => {
    expect(kinds({ ...all, context: false })).toContain('invented');
    expect(kinds({ ...none, task: true, context: true })).not.toContain('invented');
  });

  it('utan format blir det fyllnad, utan exempel en lucka för namnet', () => {
    expect(kinds({ ...all, format: false })).toContain('extra');
    expect(kinds({ ...all, example: false })).toContain('placeholder');
  });

  it('fler delar ger aldrig ett sämre svar', () => {
    const ids = ['task', 'context', 'format', 'example'] as const;
    for (let m = 0; m < 16; m++) {
      const f = Object.fromEntries(ids.map((id, i) => [id, !!(m & (1 << i))])) as typeof all;
      for (const id of ids) if (!f[id]) expect(closeness({ ...f, [id]: true })).toBeGreaterThanOrEqual(closeness(f));
    }
  });

  it('manuset visar det kapitlen säger', () => {
    const at = (t: number) => flagsFrom(evaluateParams({ params: PARAMS, tracks: TRACKS }, t));
    expect(kinds(at(5))).toContain('vague');
    expect(kinds(at(20))).toContain('invented');
    expect(kinds(at(30))).not.toContain('invented');
    expect(kinds(at(45))).not.toContain('extra');
    expect(kinds(at(65))).toContain('invented');
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
    expect(CHAPTERS.at(-1)!.start).toBeLessThan(DURATION);
  });
});
