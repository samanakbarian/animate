// Modul 13 – AI som gör bilder. En del.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE, PARAMS, TRACKS } from './timeline';

export const images: ModuleDefinition = {
  id: 'bilder',
  title: 'Från brus till bild',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE,
  createScene,
};

export const parts: ModuleDefinition[] = [images];
