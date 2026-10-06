// Manus för modul 4 – Transformern.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { HEADS, SENTENCES } from './attention';

export const DURATION = 82;
const MAX_LEN = Math.max(...SENTENCES.map((s) => s.length));

export const PARAMS: ParamSpec[] = [
  { id: 'sentence', label: 'Mening', min: 0, max: SENTENCES.length - 1, step: 1, default: 0, format: (v) => `${Math.round(v) + 1}` },
  {
    id: 'focus',
    label: 'Ord som tittar',
    min: 0,
    max: MAX_LEN - 1,
    step: 1,
    default: 5,
    // ordet självt syns i bilden; reglaget visar positionen
    format: (v) => `ord ${Math.round(v) + 1}`,
  },
  { id: 'head', label: 'Huvud', min: 0, max: HEADS.length - 1, step: 1, default: 0, format: (v) => HEADS[Math.round(v)] },
  { id: 'sharp', label: 'Skärpa', min: 0.3, max: 3, step: 0.05, default: 1, format: (v) => v.toFixed(2).replace('.', ',') },
];

export const CHAPTERS: Chapter[] = [
  {
    id: '2017',
    start: 0,
    title: '2017',
    caption: 'År 2017 kom en ny sorts nätverk, transformern. Det viktigaste i den kallas uppmärksamhet.',
  },
  {
    id: 'titta',
    start: 10,
    title: 'Alla tittar på alla',
    caption: 'Varje ord tittar på alla andra ord och väger hur viktiga de är för just det ordet.',
  },
  {
    id: 'den',
    start: 26,
    title: 'Vem är ”den”?',
    caption: '”Den” lägger nästan all sin uppmärksamhet på katten. Det är katten som kan vara trött.',
  },
  {
    id: 'mjuk',
    start: 38,
    title: 'Ett ord ändrar allt',
    caption: 'Byt ”trött” mot ”mjuk”, så tittar samma ”den” i stället på mattan. Det är sammanhanget som avgör.',
  },
  {
    id: 'huvuden',
    start: 50,
    title: 'Många huvuden',
    caption: 'En transformer har många uppmärksamhetshuvuden. De letar efter olika saker: syftning, närhet, vem som gör vad.',
  },
  {
    id: 'matris',
    start: 62,
    title: 'Allt på en gång',
    caption:
      'Alla ord gör det här samtidigt, så resultatet blir en tabell med vikter. Sådana tabeller är grafikkort väldigt snabba på att räkna.',
  },
  { id: 'din-tur', start: 72, title: 'Din tur', caption: 'Välj mening, ord och huvud. Dra upp skärpan och se uppmärksamheten samlas.' },
];

export const EXPLORE_CAPTION = 'Välj mening och vilket ord som tittar. Byt huvud och ändra skärpan.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  sentence: [k(0, 0), k(40, 0), k(40.01, 1, 'hold'), k(56, 1), k(56.01, 2, 'hold'), k(62, 2), k(62.01, 0, 'hold'), k(82, 0)],
  focus: [
    k(0, 0),
    k(12, 0),
    k(24, 7, 'linear'),
    k(26, 5),
    k(56, 5),
    k(56.01, 4, 'hold'),
    k(62, 4),
    k(64, 0),
    k(70, 7, 'linear'),
    k(72, 5),
    k(82, 5),
  ],
  head: [k(0, 0), k(52, 0), k(52.01, 1, 'hold'), k(56, 1), k(56.01, 2, 'hold'), k(60, 2), k(60.01, 0, 'hold'), k(82, 0)],
  sharp: [k(0, 1), k(82, 1)],
};
