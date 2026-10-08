import { describe, expect, it } from 'vitest';
import paths from '../content/paths.json';
import { GAMES } from './games';
import { INTERACTIVE_MODULES } from './interactive';
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

  it('varje lärväg: minuterna summerar, slutar med ett test och stegen har unika id', () => {
    for (const p of paths) {
      expect(
        p.steps.reduce((a, s) => a + s.minutes, 0),
        p.id,
      ).toBe(p.minutes);
      expect(p.steps.at(-1)!.kind, p.id).toBe('test');
      expect(new Set(p.steps.map((s) => s.id)).size, p.id).toBe(p.steps.length);
    }
  });

  it('varje steg pekar på en moduldel, ett spel eller quizfrågor som finns', async () => {
    const md = import.meta.glob<string>('../content/modules/*.md', { query: '?raw', import: 'default', eager: true });
    const quizLength = (slug: string) =>
      (
        Object.entries(md)
          .find(([f]) => f.endsWith(`/${slug}.md`))?.[1]
          .match(/^\s+- kind: /gm) ?? []
      ).length;
    for (const p of paths)
      for (const s of p.steps) {
        if (s.kind === 'module') {
          const { parts } = await INTERACTIVE_MODULES[s.module!]!();
          expect(
            parts.some((x) => x.id === s.part),
            `${p.id}/${s.id}`,
          ).toBe(true);
        }
        if (s.kind === 'game') expect(GAMES[s.game!], `${p.id}/${s.id}`).toBeDefined();
        if (s.kind === 'test')
          for (const ref of s.questions!) {
            const [slug, i] = ref.split(':');
            expect(Number(i), `${p.id}: ${ref}`).toBeLessThan(quizLength(slug));
          }
      }
  });
});
