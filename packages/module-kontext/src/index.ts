// Modul 15 – Kontext. En del.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE, PARAMS, TRACKS } from './timeline';

export const context: ModuleDefinition = {
  id: 'kontext',
  title: 'Det modellen ser',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE,
  createScene,
};

export const parts: ModuleDefinition[] = [context];
