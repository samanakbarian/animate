// Spelet Tokenjakten.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startTokens } from './game';
import { LEVELS } from './tokens';

export const game: GameDefinition = {
  id: 'tokenjakten',
  title: 'Tokenjakten',
  intro:
    'En språkmodell läser inte bokstäver eller hela ord, utan bitar som kallas tokens. Klipp orden i så få bitar som möjligt med tokeniserarens ordförråd. Fyra banor.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'rätt',
  start: startTokens,
};
