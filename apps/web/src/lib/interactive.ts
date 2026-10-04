// Register över moduler som har film + interaktiv del.
// Lägg till en rad här när ett nytt modulpaket finns (packages/module-<slug>).
// Varje modul blir en egen chunk som bara laddas på sin sida.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';

export const INTERACTIVE_MODULES: Record<string, () => Promise<{ default: ModuleDefinition }>> = {
  'neuralt-natverk': () => import('@nastasteg/module-neuralt-natverk'),
};

export const hasInteractive = (slug: string) => slug in INTERACTIVE_MODULES;
