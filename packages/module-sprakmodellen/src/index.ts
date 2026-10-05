// Modul 5 – Språkmodellen.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createLanguageScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const languageModel: ModuleDefinition = {
  id: 'sprakmodellen',
  title: 'Nästa ord, om och om igen',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createLanguageScene,
};

export const parts: ModuleDefinition[] = [languageModel];
