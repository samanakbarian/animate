// Manus för modul 14 – Datorseende. Pixlar är tal, ett filter glider över bilden
// och hittar kanter, kanterna räknas ihop till ett svar, och brus kan lura modellen.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { FILTERS, SHAPES } from './vision';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });
const pct = (v: number) => `${Math.round(v * 100)} %`;

export const DURATION = 88;

/** När panelerna dyker upp i filmen. I utforskaläget syns allt. */
export const SHOW = { numbersUntil: 10, edgesFrom: 36, answerFrom: 46 };

export const PARAMS: ParamSpec[] = [
  { id: 'shape', label: 'Bild', min: 0, max: SHAPES.length - 1, step: 1, default: 1, format: (v) => SHAPES[Math.round(v)] },
  { id: 'filter', label: 'Filter', min: 0, max: FILTERS.length - 1, step: 1, default: 0, format: (v) => FILTERS[Math.round(v)].name },
  { id: 'scan', label: 'Filtret har gått', min: 0, max: 1, step: 0.01, default: 1, format: pct },
  { id: 'noise', label: 'Brus i bilden', min: 0, max: 0.6, step: 0.05, default: 0, format: pct },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'pixlar',
    start: 0,
    title: 'En bild är tal',
    caption: 'För en dator är en bild bara tal. Varje pixel är ett tal för hur ljus den är, här från 0 för svart till 9 för vitt.',
  },
  {
    id: 'filter',
    start: 10,
    title: 'Ett filter glider över',
    caption:
      'Ett filter är en liten ruta med nio vikter. Den glider över bilden och räknar ett svar i varje punkt. Där mönstret passar blir svaret stort.',
  },
  {
    id: 'kanter',
    start: 24,
    title: 'Olika filter, olika kanter',
    caption: 'Ett filter hittar lodräta kanter, ett vågräta och två hittar sneda. Varje filter ger en egen karta över bilden.',
  },
  {
    id: 'lager',
    start: SHOW.edgesFrom,
    title: 'Räkna ihop',
    caption: 'Nästa steg räknar ihop kartorna: hur mycket av varje sorts kant har bilden? I riktiga nätverk följer många sådana lager.',
  },
  {
    id: 'svar',
    start: SHOW.answerFrom,
    title: 'Ett svar',
    caption: 'Sist jämförs det med hur formerna brukar se ut. Svaret blir ett tal per form: hur säker modellen är.',
  },
  {
    id: 'former',
    start: 56,
    title: 'Andra former',
    caption:
      'En annan form ger andra kanter, och ett annat svar. En kvadrat har raka kanter, ett kryss mest sneda, en cirkel lite av allt.',
  },
  {
    id: 'brus',
    start: 66,
    title: 'Säker, men fel',
    caption: 'Med brus i bilden hittar filtren kanter överallt. Till slut svarar modellen cirkel, och är säker, fast det är en kvadrat.',
  },
  {
    id: 'din-tur',
    start: 78,
    title: 'Din tur',
    caption: 'Välj bild, filter och hur mycket brus. Hur mycket brus klarar modellen innan den svarar fel?',
  },
];

export const EXPLORE = 'Välj bild och filter, och lägg till brus. Hur mycket brus klarar modellen innan den svarar fel?';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  shape: [
    k(0, 1),
    k(56, 1),
    k(56.01, 0, 'hold'),
    k(59, 0),
    k(59.01, 2, 'hold'),
    k(62, 2),
    k(62.01, 3, 'hold'),
    k(66, 3),
    k(66.01, 0, 'hold'),
    k(78, 0),
    k(78.01, 1, 'hold'),
    k(DURATION, 1),
  ],
  filter: [
    k(0, 2),
    k(24, 2),
    k(24.01, 0, 'hold'),
    k(27, 0),
    k(27.01, 1, 'hold'),
    k(30, 1),
    k(30.01, 2, 'hold'),
    k(33, 2),
    k(33.01, 3, 'hold'),
    k(DURATION, 3),
  ],
  scan: [k(0, 0), k(12, 0), k(22, 1), k(DURATION, 1)],
  noise: [k(0, 0), k(67, 0), k(75, 0.6), k(78, 0.6), k(78.01, 0, 'hold'), k(DURATION, 0)],
};
