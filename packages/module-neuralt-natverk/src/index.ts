// Modul 1 – Neuralt nätverk (del 1: en neuron).
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { createNeuronScene } from './scene';
import { CHAPTERS, DURATION, EXPLORE_CAPTION, PARAMS, TRACKS } from './timeline';

const module: ModuleDefinition = {
  id: 'neuralt-natverk',
  title: 'Neuralt nätverk – en neuron',
  duration: DURATION,
  params: PARAMS,
  tracks: TRACKS,
  chapters: CHAPTERS,
  exploreCaption: EXPLORE_CAPTION,
  createScene: createNeuronScene,
};

export default module;
