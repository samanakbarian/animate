import { describe, expect, it } from 'vitest';
import paths from '../content/paths.json';
import { isComplete, markDone, minutesLeft, parseProgress, resumeStep } from './path';

const ids = ['a', 'b', 'c'];

describe('lärvägens framsteg', () => {
  it('tål tom och trasig data', () => {
    expect(parseProgress(null, ids)).toEqual({ done: [], current: null });
    expect(parseProgress('{inte json', ids)).toEqual({ done: [], current: null });
    expect(parseProgress('{"done":["a","x","a"],"current":"y"}', ids)).toEqual({ done: ['a'], current: null });
  });

  it('fortsätter där man slutade', () => {
    let p = parseProgress(null, ids);
    expect(resumeStep(p, ids)).toBe('a');
    p = markDone(p, 'a');
    expect(resumeStep(p, ids)).toBe('b');
    p = { ...p, current: 'c' };
    expect(resumeStep(p, ids)).toBe('c');
    p = markDone(markDone(p, 'b'), 'c');
    expect(isComplete(p, ids)).toBe(true);
    expect(resumeStep(p, ids)).toBe('c');
  });

  it('räknar minuter kvar', () => {
    const steps = [
      { id: 'a', minutes: 4 },
      { id: 'b', minutes: 3 },
    ];
    expect(minutesLeft({ done: ['a'], current: null }, steps)).toBe(3);
  });

  it('lärvägen ”förstå AI” tar 20 minuter och slutar med ett test', () => {
    const p = paths.find((x) => x.id === 'forsta-ai')!;
    expect(p.steps.reduce((a, s) => a + s.minutes, 0)).toBe(p.minutes);
    expect(p.steps.at(-1)!.kind).toBe('test');
    expect(new Set(p.steps.map((s) => s.id)).size).toBe(p.steps.length);
  });
});
