// Del 2 – ett nätverk lär sig. Manus: kapitel och nyckelrutor.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { MAX_STEPS } from './network';

export const DURATION_2 = 74;

const int = (v: number) => String(Math.round(v));

export const PARAMS_2: ParamSpec[] = [
  { id: 'hidden', label: 'Dolda neuroner', min: 1, max: 6, step: 1, default: 4, format: int },
  { id: 'steps', label: 'Träningssteg', min: 0, max: MAX_STEPS, step: 1, default: 0, format: int },
  { id: 'lr', label: 'Steglängd', min: 0.1, max: 4, step: 0.1, default: 1.5, format: (v) => v.toFixed(1).replace('.', ',') },
  { id: 'lines', label: 'Visa de dolda neuronernas linjer', min: 0, max: 1, step: 1, default: 0, format: (v) => (v >= 0.5 ? 'på' : 'av') },
];

export const CHAPTERS_2: Chapter[] = [
  {
    id: 'data',
    start: 0,
    title: 'Ett svårare problem',
    caption: '80 punkter: de blå ligger innanför en cirkel, de orange utanför. Kan en enda neuron skilja dem åt?',
  },
  {
    id: 'misslyckas',
    start: 14,
    title: 'En linje räcker inte',
    caption: 'Nej. En neuron kan bara dra en rak linje. Hur länge den än tränar fastnar den långt från alla rätt.',
  },
  {
    id: 'fler',
    start: 22,
    title: 'Ett dolt lager',
    caption: 'Med fyra neuroner i ett dolt lager kan nätverket kombinera fyra linjer. Från början är vikterna slumpade.',
  },
  {
    id: 'traning',
    start: 30,
    title: 'Träning',
    caption: 'Mät felet. Flytta varje vikt en liten bit åt det håll som minskar felet. Gör om det – hundratals gånger.',
  },
  {
    id: 'inuti',
    start: 56,
    title: 'Vad hände inuti?',
    caption: 'Varje dold neuron är fortfarande en rak linje. Tillsammans ringar de in cirkeln.',
  },
  {
    id: 'din-tur',
    start: 66,
    title: 'Din tur',
    caption: 'Prova färre neuroner, en större steglängd eller färre träningssteg – och se vad som händer.',
  },
];

export const EXPLORE_CAPTION_2 =
  'Ändra antalet dolda neuroner, steglängden och hur länge nätverket tränar. Allt räknas ut på riktigt i din webbläsare.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS_2: Partial<Record<string, Keyframe[]>> = {
  hidden: [k(0, 1), k(22, 1), k(22.01, 4, 'hold'), k(74, 4)],
  steps: [
    k(0, 0),
    k(5, 0),
    k(13, MAX_STEPS, 'linear'),
    k(22, MAX_STEPS),
    k(22.01, 0, 'hold'),
    k(32, 0),
    k(55, MAX_STEPS, 'linear'),
    k(74, MAX_STEPS),
  ],
  lr: [k(0, 1.5), k(74, 1.5)],
  lines: [k(0, 0), k(57, 0), k(57.01, 1, 'hold'), k(74, 1)],
};
