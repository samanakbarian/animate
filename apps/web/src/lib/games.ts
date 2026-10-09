// Register över spel. Lägg till en rad här när ett nytt spelpaket finns
// (packages/game-<slug>) och en post i content/games.json.
// Varje spel blir en egen chunk som bara laddas på sin sida.
import type { GameDefinition } from '@nastasteg/engine/game/types';

export const GAMES: Record<string, () => Promise<{ game: GameDefinition }>> = {
  gradientgolf: () => import('@nastasteg/game-gradientgolf'),
  'sla-maskinen': () => import('@nastasteg/game-sla-maskinen'),
  'dra-gransen': () => import('@nastasteg/game-dra-gransen'),
  hallucinationsjakten: () => import('@nastasteg/game-hallucinationsjakten'),
  tokenjakten: () => import('@nastasteg/game-tokenjakten'),
  'vem-ar-den': () => import('@nastasteg/game-vem-ar-den'),
  'ai-tidslinjen': () => import('@nastasteg/game-ai-tidslinjen'),
  promptpusslet: () => import('@nastasteg/game-promptpusslet'),
  'snedvriden-data': () => import('@nastasteg/game-snedvriden-data'),
  ordraknaren: () => import('@nastasteg/game-ordraknaren'),
  'lar-maskinen': () => import('@nastasteg/game-lar-maskinen'),
};
