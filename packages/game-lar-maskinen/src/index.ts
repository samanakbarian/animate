// Spelet Lär maskinen.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startTraining } from './game';
import { LEVELS } from './neuron';

export const game: GameDefinition = {
  id: 'lar-maskinen',
  title: 'Lär maskinen',
  intro:
    'Var träningen själv. En neuron ska lära sig när Kim går ut. Ändra vikterna och biasen ett steg i taget tills den gissar rätt på alla exempel, med så få drag som möjligt. Tre banor.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  lowerIsBetter: true,
  scoreLabel: 'drag',
  start: startTraining,
};
