// Spelet Agentbyggaren.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startBuilder } from './game';
import { LEVELS } from './scenario';

export const game: GameDefinition = {
  id: 'agentbyggaren',
  title: 'Agentbyggaren',
  intro:
    'Ge en AI-agent ett uppdrag. Bestäm vilka verktyg den får använda och vad den måste fråga dig om först. Sedan kör den, och du ser i loggen vad som händer. Tre banor.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'poäng',
  start: startBuilder,
};
