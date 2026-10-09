// Register över moduler som har film + interaktiv del.
// Lägg till en rad här när ett nytt modulpaket finns (packages/module-<slug>).
// Varje modul blir en egen chunk som bara laddas på sin sida.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';

/** Ett modulpaket exporterar `parts`: en eller flera delar som visas efter varandra. */
export const INTERACTIVE_MODULES: Record<string, () => Promise<{ parts: ModuleDefinition[] }>> = {
  'neuralt-natverk': () => import('@nastasteg/module-neuralt-natverk'),
  sprakmodellen: () => import('@nastasteg/module-sprakmodellen'),
  agenten: () => import('@nastasteg/module-agenten'),
  transformern: () => import('@nastasteg/module-transformern'),
  'ord-som-tal': () => import('@nastasteg/module-ord-som-tal'),
  traning: () => import('@nastasteg/module-traning'),
  'resonerande-modeller': () => import('@nastasteg/module-resonerande-modeller'),
  'fran-fortraning-till-assistent': () => import('@nastasteg/module-fran-fortraning-till-assistent'),
  'flera-agenter': () => import('@nastasteg/module-flera-agenter'),
  'risker-och-sakerhet': () => import('@nastasteg/module-risker-och-sakerhet'),
  'att-prata-med-ai': () => import('@nastasteg/module-att-prata-med-ai'),
  'data-och-bias': () => import('@nastasteg/module-data-och-bias'),
  'ai-som-gor-bilder': () => import('@nastasteg/module-ai-som-gor-bilder'),
  datorseende: () => import('@nastasteg/module-datorseende'),
  kontext: () => import('@nastasteg/module-kontext'),
  verktyg: () => import('@nastasteg/module-verktyg'),
  arbete: () => import('@nastasteg/module-arbete'),
};

export const hasInteractive = (slug: string) => slug in INTERACTIVE_MODULES;
