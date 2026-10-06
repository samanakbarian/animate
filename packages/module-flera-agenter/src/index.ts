// Modul 9 – Flera agenter.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createTeamScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const team: ModuleDefinition = {
  id: 'flera-agenter',
  title: 'Ett lag av agenter',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createTeamScene,
};

export const parts: ModuleDefinition[] = [team];
