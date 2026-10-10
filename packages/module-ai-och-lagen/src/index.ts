// Modul 18 – AI och lagen. En del.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE, PARAMS, TRACKS } from './timeline';

export const law: ModuleDefinition = {
  id: 'lagen',
  title: 'Risknivåerna',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE,
  createScene,
};

export const parts: ModuleDefinition[] = [law];
