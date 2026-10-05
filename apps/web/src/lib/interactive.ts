// Register över moduler som har film + interaktiv del.
// Lägg till en rad här när ett nytt modulpaket finns (packages/module-<slug>).
// Varje modul blir en egen chunk som bara laddas på sin sida.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';

/** Ett modulpaket exporterar `parts`: en eller flera delar som visas efter varandra. */
export const INTERACTIVE_MODULES: Record<string, () => Promise<{ parts: ModuleDefinition[] }>> = {
  'neuralt-natverk': () => import('@nastasteg/module-neuralt-natverk'),
  sprakmodellen: () => import('@nastasteg/module-sprakmodellen'),
  agenten: () => import('@nastasteg/module-agenten'),
};

export const hasInteractive = (slug: string) => slug in INTERACTIVE_MODULES;
