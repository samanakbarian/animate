// Modul 1 – Neuralt nätverk. Tre delar som spelas efter varandra på modulsidan.
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createNeuronScene } from './scene';
import { createDecisionScene } from './scene-beslut';
import { createNetworkScene } from './scene-network';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';
import { CHAPTERS_0, DURATION_0, EXPLORE_CAPTION_0, PARAMS_0, TRACKS_0 } from './timeline-beslut';
import { CHAPTERS_2, DURATION_2, EXPLORE_CAPTION_2, PARAMS_2, TRACKS_2 } from './timeline-network';

export const decision: ModuleDefinition = {
  id: 'neuralt-natverk-0',
  title: 'Del 1: Ett enkelt beslut',
  duration: DURATION_0,
  params: PARAMS_0,
  tracks: TRACKS_0,
  chapters: CHAPTERS_0,
  exploreCaption: EXPLORE_CAPTION_0,
  createScene: createDecisionScene,
};

export const neuron: ModuleDefinition = {
  id: 'neuralt-natverk-1',
  title: 'Del 2: Samma neuron som en karta',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createNeuronScene,
};

export const network: ModuleDefinition = {
  id: 'neuralt-natverk-2',
  title: 'Del 3: Ett nätverk lär sig',
  duration: DURATION_2,
  params: PARAMS_2,
  tracks: TRACKS_2,
  chapters: CHAPTERS_2,
  exploreCaption: EXPLORE_CAPTION_2,
  createScene: createNetworkScene,
};

export const parts: ModuleDefinition[] = [decision, neuron, network];
