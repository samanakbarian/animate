// Modul 1 – Neuralt nätverk. Två delar som spelas efter varandra på modulsidan.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createNeuronScene } from './scene';
import { createNetworkScene } from './scene-network';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';
import { CHAPTERS_2, DURATION_2, EXPLORE_CAPTION_2, PARAMS_2, TRACKS_2 } from './timeline-network';

export const neuron: ModuleDefinition = {
  id: 'neuralt-natverk-1',
  title: 'Del 1: En neuron',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createNeuronScene,
};

export const network: ModuleDefinition = {
  id: 'neuralt-natverk-2',
  title: 'Del 2: Ett nätverk lär sig',
  duration: DURATION_2,
  params: PARAMS_2,
  tracks: TRACKS_2,
  chapters: CHAPTERS_2,
  exploreCaption: EXPLORE_CAPTION_2,
  createScene: createNetworkScene,
};

export const parts: ModuleDefinition[] = [neuron, network];
