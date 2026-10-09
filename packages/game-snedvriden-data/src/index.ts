// Spelet Snedvriden data.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startData } from './game';
import { LEVELS } from './pool';

export const game: GameDefinition = {
  id: 'snedvriden-data',
  title: 'Snedvriden data',
  intro:
    'Välj träningsbilder åt en modell som ska skilja vargar från hundar. I högen står vargarna oftast i snö. Klarar modellen ett rättvist test, eller lär den sig bara att snö betyder varg? Tre banor.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: '% rätt',
  start: startData,
};
