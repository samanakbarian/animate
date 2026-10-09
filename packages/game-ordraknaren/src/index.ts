// Spelet Ordräknaren.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { LEVELS } from './counts';
import { startCounting } from './game';

export const game: GameDefinition = {
  id: 'ordraknaren',
  title: 'Ordräknaren',
  intro:
    'Var språkmodellen själv. Räkna i en kort text vilket ord som brukar komma efter ett annat, och hur troligt det är. Precis så, fast med enorma mängder text, gissar en språkmodell nästa ord. Tre banor.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'rätt',
  start: startCounting,
};
