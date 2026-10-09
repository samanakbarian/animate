// Modul 16 – Verktyg. En del.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE, PARAMS, TRACKS } from './timeline';

export const tools: ModuleDefinition = {
  id: 'verktyg',
  title: 'När modellen ber om hjälp',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE,
  createScene,
};

export const parts: ModuleDefinition[] = [tools];
