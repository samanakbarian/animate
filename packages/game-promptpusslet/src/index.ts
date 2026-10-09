// Spelet Promptpusslet.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startPuzzle } from './game';
import { LEVELS } from './tasks';

export const game: GameDefinition = {
  id: 'promptpusslet',
  title: 'Promptpusslet',
  intro:
    'Bygg en fråga till en AI av färdiga bitar. Välj det som behövs för att få det du vill ha, och undvik bitar som låter bra men inte hjälper. Tre banor med tre uppgifter var.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'poäng',
  start: startPuzzle,
};
