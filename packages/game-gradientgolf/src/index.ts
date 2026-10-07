// Spelet Gradientgolf.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startGolf } from './game';
import { HOLES } from './golf';

export const game: GameDefinition = {
  id: 'gradientgolf',
  title: 'Gradientgolf',
  intro:
    'Få bollen i hål på så få slag som möjligt. Bollen rullar alltid dit det lutar mest nedåt, precis som när ett nätverk tränas. Det enda du väljer är steglängden.',
  levels: HOLES.map((h) => ({ title: h.title, goal: h.goal })),
  lowerIsBetter: true,
  scoreLabel: 'slag',
  start: startGolf,
};
