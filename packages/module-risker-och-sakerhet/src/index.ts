// Modul 10 – Risker och säkerhet. Två delar.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createConfidenceScene } from './scene-confidence';
import { createFilterScene } from './scene-filter';
import {
  CHAPTERS_1,
  CHAPTERS_2,
  DURATION_1,
  DURATION_2,
  EXPLORE_CAPTION_1,
  EXPLORE_CAPTION_2,
  PARAMS_1,
  PARAMS_2,
  TRACKS_1,
  TRACKS_2,
} from './timeline';

export const confidence: ModuleDefinition = {
  id: 'risker-1',
  title: 'Del 1: Säker men fel',
  duration: DURATION_1,
  params: PARAMS_1,
  tracks: TRACKS_1,
  chapters: CHAPTERS_1,
  exploreCaption: EXPLORE_CAPTION_1,
  createScene: createConfidenceScene,
};

export const filter: ModuleDefinition = {
  id: 'risker-2',
  title: 'Del 2: Spärrar',
  duration: DURATION_2,
  params: PARAMS_2,
  tracks: TRACKS_2,
  chapters: CHAPTERS_2,
  exploreCaption: EXPLORE_CAPTION_2,
  createScene: createFilterScene,
};

export const parts: ModuleDefinition[] = [confidence, filter];
