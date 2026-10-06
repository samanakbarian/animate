// Manus för modul 2 – Träning.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { formatNumber } from '@nastasteg/engine/module/params';
import { MAX_STEPS, STARTS } from './descent';

export const DURATION = 84;

export const PARAMS: ParamSpec[] = [
  { id: 'lr', label: 'Steglängd', min: 0.01, max: 0.7, step: 0.01, default: 0.15, format: (v) => formatNumber(v) },
  { id: 'steps', label: 'Steg', min: 0, max: MAX_STEPS, step: 1, default: MAX_STEPS, format: (v) => String(Math.floor(v)) },
  { id: 'start', label: 'Start', min: 0, max: STARTS.length - 1, step: 1, default: 0, format: (v) => STARTS[Math.round(v)].label },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'landskap',
    start: 0,
    title: 'Felet är ett landskap',
    caption: 'Varje val av vikter ger ett fel. Med två vikter blir felet ett landskap – mörkt är lågt fel. Målet är dalens botten.',
  },
  {
    id: 'lutning',
    start: 12,
    title: 'Känn lutningen',
    caption: 'Gradienten säger åt vilket håll felet ökar mest. Vi tar ett litet steg åt motsatt håll – nedför.',
  },
  {
    id: 'nedfor',
    start: 22,
    title: 'Steg för steg',
    caption: 'Mät lutningen, ta ett steg, upprepa. Felet sjunker, och bollen rullar ner mot dalens botten.',
  },
  {
    id: 'for-kort',
    start: 36,
    title: 'För korta steg',
    caption: 'Med för kort steglängd går det säkert men långsamt. Efter 60 steg är bollen knappt på väg.',
  },
  {
    id: 'for-langt',
    start: 47,
    title: 'För långa steg',
    caption: 'Med för lång steglängd studsar bollen fram och tillbaka över dalen – eller flyger iväg helt.',
  },
  {
    id: 'grop',
    start: 62,
    title: 'En grop på vägen',
    caption: 'Från en annan start fastnar bollen i en grop. Felet slutar sjunka, fast det finns lägre mark längre bort.',
  },
  { id: 'din-tur', start: 74, title: 'Din tur', caption: 'Välj start och steglängd. Dra i steg och se var bollen hamnar.' },
];

export const EXPLORE_CAPTION = 'Välj start och steglängd. Dra i steg och följ bollen och felkurvan.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  lr: [
    k(0, 0.15),
    k(36, 0.15),
    k(36.01, 0.02, 'hold'),
    k(47, 0.02),
    k(47.01, 0.5, 'hold'),
    k(55, 0.5),
    k(55.01, 0.7, 'hold'),
    k(62, 0.7),
    k(62.01, 0.15, 'hold'),
    k(84, 0.15),
  ],
  steps: [
    k(0, 0),
    k(15, 0),
    k(19, 1, 'linear'),
    k(24, 1),
    k(34, 60, 'linear'),
    k(36, 60),
    k(36.01, 0, 'hold'),
    k(44, 60, 'linear'),
    k(47, 60),
    k(47.01, 0, 'hold'),
    k(53, 60, 'linear'),
    k(55, 60),
    k(55.01, 0, 'hold'),
    k(59, 25, 'linear'),
    k(62, 25),
    k(62.01, 0, 'hold'),
    k(71, 60, 'linear'),
    k(84, 60),
  ],
  start: [k(0, 0), k(62, 0), k(62.01, 1, 'hold'), k(84, 1)],
};
