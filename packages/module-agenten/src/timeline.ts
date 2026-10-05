// Manus för modul 8: kapitel, reglage och nyckelrutor.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { MAX_EVENTS } from './scenario';

export const DURATION = 84;

const onOff = (v: number) => (v >= 0.5 ? 'på' : 'av');

export const PARAMS: ParamSpec[] = [
  { id: 'steps', label: 'Steg i loggen', min: 0, max: MAX_EVENTS, step: 1, default: 0, format: (v) => String(Math.round(v)) },
  { id: 'failure', label: 'Rummet är upptaget', min: 0, max: 1, step: 1, default: 1, format: onOff },
  { id: 'approval', label: 'Människa i loopen', min: 0, max: 1, step: 1, default: 1, format: onOff },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'mal',
    start: 0,
    title: 'Ett mål, inte en fråga',
    caption: 'En agent får ett mål. Den ska själv komma fram till hur det nås – steg för steg.',
  },
  {
    id: 'loopen',
    start: 9,
    title: 'Loopen',
    caption: 'Den arbetar i en loop: tänk, agera med ett verktyg, observera resultatet. Sedan tänker den igen.',
  },
  {
    id: 'verktyg',
    start: 22,
    title: 'Verktyg',
    caption: 'Verktygen gör en agent till mer än en chatt. Den kan läsa kalendrar, boka rum och skicka mejl.',
  },
  {
    id: 'hinder',
    start: 32,
    title: 'Något går fel',
    caption: 'Rummet är upptaget. Ingen talar om vad agenten ska göra – den ändrar planen själv.',
  },
  {
    id: 'manniska',
    start: 45,
    title: 'Människan i loopen',
    caption: 'Innan den gör något som inte går att ångra kan den stanna och fråga en människa.',
  },
  {
    id: 'klart',
    start: 56,
    title: 'Målet nått',
    caption: 'Rummet bokas, inbjudan skickas. Målet är nått utan att någon sa hur – fem varv i loopen.',
  },
  {
    id: 'din-tur',
    start: 72,
    title: 'Din tur',
    caption: 'Slå av felet eller människan i loopen och följ agenten igen. Vad blir annorlunda?',
  },
];

export const EXPLORE_CAPTION = 'Slå av och på felet och människan i loopen, och stega genom loggen. Vad gör agenten annorlunda?';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  steps: [
    k(0, 0),
    k(2, 0),
    k(4, 1, 'linear'),
    k(10, 1),
    k(21, 4, 'linear'),
    k(23, 4),
    k(30, 6, 'linear'),
    k(33, 6),
    k(43, 10, 'linear'),
    k(46, 10),
    k(54, 13, 'linear'),
    k(57, 13),
    k(68, MAX_EVENTS, 'linear'),
    k(84, MAX_EVENTS),
  ],
  failure: [k(0, 1), k(84, 1)],
  approval: [k(0, 1), k(84, 1)],
};
