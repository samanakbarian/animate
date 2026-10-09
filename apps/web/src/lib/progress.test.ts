import { describe, expect, it } from 'vitest';
import badgesJson from '../content/badges.json';
import games from '../content/games.json';
import paths from '../content/paths.json';
import { type Badge, earnedBadges, gamesPlayed, newBadges, pathDone, quizResults } from './progress';

const badges = badgesJson as Badge[];
const moduleSlugs = Object.keys(import.meta.glob('../content/modules/*.md')).map((f) => f.replace(/^.*\/|\.md$/g, ''));
const ids = (b: Badge[]) => b.map((x) => x.id).sort();

describe('framsteg och märken', () => {
  it('läser quiz, spel och lärväg ur lagringen', () => {
    const s = {
      'ilearnai-quiz-agenten': '4',
      'ilearnai-quiz-lar-forsta-ai': '6',
      'ns-game-dra-gransen-0': '93',
      'ns-game-dra-gransen-1': '80',
      'ns-game-vem-ar-den-2': '5',
      'ilearnai-path-forsta-ai': JSON.stringify({ done: ['neuron', 'natverk'], current: 'sprak' }),
    };
    expect(quizResults(s)).toEqual({ agenten: 4 });
    expect(gamesPlayed(s)).toEqual({ 'dra-gransen': 2, 'vem-ar-den': 1 });
    expect(pathDone(s, paths[0])).toEqual({ done: 2, total: 6, complete: false });
  });

  it('ger märken efter reglerna', () => {
    expect(earnedBadges(badges, {}, paths)).toEqual([]);
    const s = { 'ilearnai-quiz-agenten': '4', 'ilearnai-quiz-traning': '2' };
    expect(ids(earnedBadges(badges, s, paths))).toEqual(['allt-ratt', 'forsta-steget']);
  });

  it('hittar nya märken mellan två lägen', () => {
    const before = { 'ilearnai-quiz-agenten': '3' };
    const after = { 'ilearnai-quiz-agenten': '4' };
    expect(ids(newBadges(badges, before, after, paths))).toEqual(['allt-ratt']);
  });

  it('alla märken går att få med innehållet som finns', () => {
    const all: Record<string, string> = {};
    for (const m of moduleSlugs) {
      all[`ilearnai-quiz-${m}`] = '4';
      all[`ilearnai-seen-${m}`] = '1';
    }
    for (const g of games) all[`ns-game-${g.id}-0`] = '1';
    for (const p of paths) all[`ilearnai-path-${p.id}`] = JSON.stringify({ done: p.steps.map((s) => s.id), current: null });
    expect(earnedBadges(badges, all, paths)).toHaveLength(badges.length);
  });
});
