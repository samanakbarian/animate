// Modul 14 – Datorseende. En del.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE, PARAMS, TRACKS } from './timeline';

export const vision: ModuleDefinition = {
  id: 'seende',
  title: 'Hur en dator ser',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE,
  createScene,
};

export const parts: ModuleDefinition[] = [vision];
