// Spelet Hallucinationsjakten.
import type { GameDefinition } from '@nastasteg/engine/game/types';
import { startHunt } from './game';
import { LEVELS } from './items';

export const game: GameDefinition = {
  id: 'hallucinationsjakten',
  title: 'Hallucinationsjakten',
  intro:
    'En AI svarar på frågor, och alla svar låter lika säkra. Några stämmer och några är påhittade. Kan du avgöra vilka? Tre banor med åtta frågor var.',
  levels: LEVELS.map((l) => ({ title: l.title, goal: l.goal })),
  scoreLabel: 'rätt',
  start: startHunt,
};
