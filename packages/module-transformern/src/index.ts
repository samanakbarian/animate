// Modul 4 – Transformern och uppmärksamhet.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createAttentionScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const transformer: ModuleDefinition = {
  id: 'transformern',
  title: 'Uppmärksamhet',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createAttentionScene,
};

export const parts: ModuleDefinition[] = [transformer];
