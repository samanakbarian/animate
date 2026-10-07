// Spelet Dra gränsen.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { LEVELS } from './boundary';
import { startBoundary } from './game';

export const game: GameDefinition = {
  id: 'dra-gransen',
  title: 'Dra gränsen',
  intro:
    'En enda neuron kan bara dra en rak linje genom planet. Dra i linjens ändar så att de blå och de orange prickarna hamnar på var sin sida. Fyra banor, den sista är omöjlig att klara helt.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: '% rätt',
  start: startBoundary,
};
