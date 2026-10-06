// Modul 7 – Resonerande modeller.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createReasoningScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const reasoning: ModuleDefinition = {
  id: 'resonerande-modeller',
  title: 'Tänka i steg',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createReasoningScene,
};

export const parts: ModuleDefinition[] = [reasoning];
