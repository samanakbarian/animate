// Spelet Slå maskinen.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startMachine } from './game';

export const game: GameDefinition = {
  id: 'sla-maskinen',
  title: 'Slå maskinen',
  intro:
    'En liten språkmodell har läst en kort text. Gissa vilket ord som kommer härnäst i meningarna, och se om du gissar rätt oftare än modellen. Åtta rundor per bana.',
  levels: [
    { title: 'Fyra alternativ', goal: 'Välj ett av fyra ord.' },
    { title: 'Sex alternativ', goal: 'Svårare: sex ord att välja mellan.' },
  ],
  scoreLabel: 'rätt',
  start: startMachine,
};
