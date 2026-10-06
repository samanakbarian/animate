// Modul 3 – Ord som tal.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createEmbeddingScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const wordsAsNumbers: ModuleDefinition = {
  id: 'ord-som-tal',
  title: 'Från ord till tal',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createEmbeddingScene,
};

export const parts: ModuleDefinition[] = [wordsAsNumbers];
