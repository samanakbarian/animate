// Modul 8 – Agenten.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createAgentScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const agent: ModuleDefinition = {
  id: 'agenten',
  title: 'Tänk, agera, observera',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createAgentScene,
};

export const parts: ModuleDefinition[] = [agent];
