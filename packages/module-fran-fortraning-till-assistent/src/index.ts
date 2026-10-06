// Modul 6 – Från förträning till assistent.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createAssistantScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

export const assistant: ModuleDefinition = {
  id: 'fran-fortraning-till-assistent',
  title: 'Från textgissare till assistent',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createAssistantScene,
};

export const parts: ModuleDefinition[] = [assistant];
