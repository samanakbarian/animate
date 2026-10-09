// Modul 12 – Data och bias. Två delar.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createSpeechScene } from './scene-speech';
import { createWolfScene } from './scene-wolf';
import { CHAPTERS_1, CHAPTERS_2, DURATION_1, DURATION_2, EXPLORE_1, EXPLORE_2, PARAMS_1, PARAMS_2, TRACKS_1, TRACKS_2 } from './timeline';

export const wolf: ModuleDefinition = {
  id: 'bias-1',
  title: 'Del 1: Varg eller hund?',
  duration: DURATION_1,
  params: PARAMS_1,
  tracks: TRACKS_1,
  chapters: CHAPTERS_1,
  exploreCaption: EXPLORE_1,
  createScene: createWolfScene,
};

export const speech: ModuleDefinition = {
  id: 'bias-2',
  title: 'Del 2: Vem förstår modellen?',
  duration: DURATION_2,
  params: PARAMS_2,
  tracks: TRACKS_2,
  chapters: CHAPTERS_2,
  exploreCaption: EXPLORE_2,
  createScene: createSpeechScene,
};

export const parts: ModuleDefinition[] = [wolf, speech];
