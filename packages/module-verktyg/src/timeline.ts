// Manus för modul 16 – Verktyg. Modellen gissar, skriver ett anrop, programmet
// kör verktyget, modellen svarar med resultatet. Sedan: välja, flera anrop, inget verktyg.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { MAX_EVENTS, QUESTIONS } from './tools';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });
const onOff = (v: number) => (v >= 0.5 ? 'på' : 'av');

export const DURATION = 84;

export const PARAMS: ParamSpec[] = [
  { id: 'question', label: 'Fråga', min: 0, max: QUESTIONS.length - 1, step: 1, default: 0, format: (v) => QUESTIONS[Math.round(v)].short },
  { id: 'rakna', label: 'Miniräknare', min: 0, max: 1, step: 1, default: 1, format: onOff },
  { id: 'vader', label: 'Väder', min: 0, max: 1, step: 1, default: 1, format: onOff },
  { id: 'step', label: 'Steg', min: 1, max: MAX_EVENTS, step: 1, default: MAX_EVENTS, format: (v) => `${Math.round(v)}` },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'gissar',
    start: 0,
    title: 'Den gissar',
    caption: 'En språkmodell skriver det som låter troligt. Stora tal räknar den inte ut, den gissar fram siffrorna. Ibland blir det fel.',
  },
  {
    id: 'anrop',
    start: 12,
    title: 'Ett anrop',
    caption: 'Med en miniräknare skriver modellen i stället ett anrop: vilket verktyg och vad det ska få. Anropet är också bara text.',
  },
  {
    id: 'programmet',
    start: 24,
    title: 'Programmet kör',
    caption: 'Programmet runt modellen ser anropet, kör miniräknaren och lägger in resultatet i samtalet. Modellen räknar inte själv.',
  },
  {
    id: 'svaret',
    start: 34,
    title: 'Svaret',
    caption: 'Nu skriver modellen sitt svar med resultatet framför sig. Svaret blir rätt för att verktyget räknade.',
  },
  {
    id: 'valja',
    start: 42,
    title: 'Modellen väljer',
    caption: 'Modellen får en kort beskrivning av varje verktyg och väljer själv om något behövs. Den här frågan klarar den utan.',
  },
  {
    id: 'flera',
    start: 52,
    title: 'Flera anrop',
    caption: 'Ibland behövs flera anrop i rad. Här frågar modellen efter vädret på två orter och räknar sedan ut skillnaden.',
  },
  {
    id: 'saknas',
    start: 64,
    title: 'Inget verktyg',
    caption: 'Utan väderverktyg kan modellen bara svara ur det den lärt sig. Då är det bäst att den säger att den inte vet.',
  },
  {
    id: 'din-tur',
    start: 72,
    title: 'Din tur',
    caption: 'Välj fråga och vilka verktyg modellen får. Stega igenom vad som händer.',
  },
];

export const EXPLORE = 'Välj fråga och vilka verktyg modellen får. Stega igenom anrop, resultat och svar.';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  question: [
    k(0, 0),
    k(42, 0),
    k(42.01, 2, 'hold'),
    k(52, 2),
    k(52.01, 3, 'hold'),
    k(64, 3),
    k(64.01, 1, 'hold'),
    k(72, 1),
    k(72.01, 0, 'hold'),
    k(DURATION, 0),
  ],
  rakna: [k(0, 0), k(12, 0), k(12.01, 1, 'hold'), k(DURATION, 1)],
  vader: [k(0, 0), k(42, 0), k(42.01, 1, 'hold'), k(64, 1), k(64.01, 0, 'hold'), k(72, 0), k(72.01, 1, 'hold'), k(DURATION, 1)],
  step: [
    k(0, 1),
    k(5, 1),
    k(5.01, 2, 'hold'),
    k(12, 2),
    k(12.01, 1, 'hold'),
    k(16, 1),
    k(16.01, 2, 'hold'),
    k(26, 2),
    k(26.01, 3, 'hold'),
    k(35, 3),
    k(35.01, 4, 'hold'),
    k(42, 4),
    k(42.01, 1, 'hold'),
    k(46, 1),
    k(46.01, 2, 'hold'),
    k(52, 2),
    k(52.01, 1, 'hold'),
    k(54, 1),
    k(62, MAX_EVENTS),
    k(64, MAX_EVENTS),
    k(64.01, 1, 'hold'),
    k(67, 1),
    k(67.01, 2, 'hold'),
    k(72, 2),
    k(72.01, MAX_EVENTS, 'hold'),
    k(DURATION, MAX_EVENTS),
  ],
};
