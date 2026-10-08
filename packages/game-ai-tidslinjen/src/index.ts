// Spelet AI-tidslinjen.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { LEVELS } from './events';
import { startTimeline } from './game';

export const game: GameDefinition = {
  id: 'ai-tidslinjen',
  title: 'AI-tidslinjen',
  intro:
    'AI är äldre än många tror. Lägg händelserna i rätt ordning, ett kort i taget, och se hur idéerna hänger ihop. Tre banor från 1943 till i dag.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'rätt',
  start: startTimeline,
};
