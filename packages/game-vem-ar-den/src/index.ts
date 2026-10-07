// Spelet Vem är ”den”?
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startWho } from './game';
import { LEVELS } from './sentences';

export const game: GameDefinition = {
  id: 'vem-ar-den',
  title: 'Vem är ”den”?',
  intro:
    'För att förstå en mening måste en språkmodell veta vad ord som ”den” och ”hon” syftar på. Det sköter uppmärksamheten. Klicka på rätt ord och se var uppmärksamheten hamnade. Tre banor.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'rätt',
  start: startWho,
};
