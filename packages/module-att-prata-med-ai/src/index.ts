// Modul 11 – Att prata med AI.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createPromptScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const prompting: ModuleDefinition = {
  id: 'att-prata-med-ai',
  title: 'Frågan formar svaret',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createPromptScene,
};

export const parts: ModuleDefinition[] = [prompting];
