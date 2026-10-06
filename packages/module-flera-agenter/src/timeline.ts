// Manus för modul 9 – Flera agenter.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';

export const DURATION = 84;

const onOff = (v: number) => (v >= 0.5 ? 'på' : 'av');

export const PARAMS: ParamSpec[] = [
  { id: 'workers', label: 'Arbetande agenter', min: 1, max: 4, step: 1, default: 3, format: (v) => String(Math.round(v)) },
  { id: 'review', label: 'Granskande agent', min: 0, max: 1, step: 1, default: 1, format: onOff },
  { id: 'human', label: 'Människa granskar', min: 0, max: 1, step: 1, default: 1, format: onOff },
  { id: 'progress', label: 'Förlopp', min: 0, max: 1, step: 0.01, default: 1, format: (v) => `${Math.round(v * 100)} %` },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'dela',
    start: 0,
    title: 'Dela upp arbetet',
    caption: 'En planerande agent delar upp en rapport i tolv delar. Fler agenter som arbetar samtidigt gör jobbet snabbare.',
  },
  {
    id: 'fel',
    start: 17,
    title: 'Små fel blir många',
    caption: 'Varje agent gör ibland fel. Med tolv delar är det troligt att något blir fel, och här blev tre delar fel.',
  },
  {
    id: 'granskare',
    start: 28,
    title: 'En agent granskar',
    caption: 'En granskande agent går igenom allt. Den hittar slarvfelet i första delen nästan direkt.',
  },
  {
    id: 'blinda',
    start: 40,
    title: 'Samma blinda fläckar',
    caption: 'Men granskaren är samma sorts modell. Det som kräver omdöme missar den också, så två fel slinker igenom.',
  },
  {
    id: 'manniska',
    start: 51,
    title: 'En människa i loopen',
    caption: 'En människa läser rapporten och ser andra saker än agenterna. De sista felen hittas, men det tar tid.',
  },
  {
    id: 'avvagning',
    start: 63,
    title: 'En avvägning',
    caption: 'Mer granskning ger färre fel men längre tid. Hur mycket som behövs beror på vad som står på spel.',
  },
  { id: 'din-tur', start: 74, title: 'Din tur', caption: 'Ändra antalet agenter och slå av och på granskningen. Hur många fel blir kvar?' },
];

export const EXPLORE_CAPTION = 'Ändra antalet agenter och slå av och på granskningen. Följ tiden och felen.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  workers: [
    k(0, 1),
    k(9, 1),
    k(9.01, 2, 'hold'),
    k(11, 2),
    k(11.01, 3, 'hold'),
    k(13, 3),
    k(13.01, 4, 'hold'),
    k(15, 4),
    k(15.01, 3, 'hold'),
    k(84, 3),
  ],
  review: [k(0, 0), k(29, 0), k(29.01, 1, 'hold'), k(84, 1)],
  human: [k(0, 0), k(52, 0), k(52.01, 1, 'hold'), k(64, 1), k(64.01, 0, 'hold'), k(67, 0), k(67.01, 1, 'hold'), k(84, 1)],
  progress: [k(0, 0), k(2, 0), k(8, 0.6, 'linear'), k(17, 0.6), k(29, 0.6), k(33, 0.8, 'linear'), k(52, 0.8), k(57, 1, 'linear'), k(84, 1)],
};
