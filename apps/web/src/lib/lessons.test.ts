import { describe, expect, it } from 'vitest';
import games from '../content/games.json';
import lessons from '../content/lessons.json';

const moduleSlugs = Object.keys(import.meta.glob('../content/modules/*.md')).map((f) => f.replace(/^.*\/|\.md$/g, ''));

describe('lektioner', () => {
  it('varje lektion är 50 minuter', () => {
    for (const l of lessons)
      expect(
        l.plan.reduce((a, p) => a + p.minutes, 0),
        l.id,
      ).toBe(50);
  });

  it('lektionerna täcker alla moduler och pekar bara på moduler och spel som finns', () => {
    const covered = new Set(lessons.flatMap((l) => l.modules));
    expect([...covered].sort()).toEqual([...moduleSlugs].sort());
    const gameIds = new Set(games.map((g) => g.id));
    for (const l of lessons) for (const g of l.games) expect(gameIds.has(g), `${l.id}: ${g}`).toBe(true);
  });
});
