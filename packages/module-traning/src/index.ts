// Modul 2 – Träning.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createDescentScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const training: ModuleDefinition = {
  id: 'traning',
  title: 'Nedför felet',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createDescentScene,
};

export const parts: ModuleDefinition[] = [training];
