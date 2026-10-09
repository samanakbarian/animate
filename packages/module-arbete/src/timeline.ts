// Manus för modul 17 – AI och arbete. Ett jobb är uppgifter, AI tar uppgifter,
// granskning blir en ny uppgift, olika jobb påverkas olika, och mer kommer.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { JOBS } from './jobs';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION = 80;

/** Från när granskningen syns i filmen. I utforskaläget syns den alltid. */
export const CHECK_FROM = 28;

export const PARAMS: ParamSpec[] = [
  { id: 'job', label: 'Jobb', min: 0, max: JOBS.length - 1, step: 1, default: 0, format: (v) => JOBS[Math.round(v)].title },
  {
    id: 'ability',
    label: 'Hur bra AI är',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    format: (v) => (v < 0.05 ? 'ingen AI' : v < 0.4 ? 'enkel' : v < 0.7 ? 'som i dag' : v < 0.9 ? 'bättre' : 'mycket bättre'),
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'uppgifter',
    start: 0,
    title: 'Ett jobb är uppgifter',
    caption:
      'Ett jobb är många uppgifter. I kundtjänst svarar man på frågor, löser krångliga ärenden, lugnar arga kunder och skriver ner allt.',
  },
  {
    id: 'ai-tar',
    start: 14,
    title: 'AI tar uppgifter',
    caption: 'AI tar sällan ett helt jobb, men delar av uppgifter. Först sådant som är text och följer mönster, som vanliga frågor.',
  },
  {
    id: 'granska',
    start: CHECK_FROM,
    title: 'Någon måste granska',
    caption: 'Någon måste läsa det AI gör och ta ansvar för det. Det blir en ny uppgift, och den tar också tid.',
  },
  {
    id: 'olika',
    start: 40,
    title: 'Olika jobb, olika mycket',
    caption: 'Olika jobb påverkas olika. Där mycket handlar om händer, kroppar och möten mellan människor tar AI mindre.',
  },
  {
    id: 'battre',
    start: 56,
    title: 'Bättre AI',
    caption: 'Ju bättre AI blir, desto mer påverkas. Vad tiden som blir över används till bestämmer människor, inte AI.',
  },
  {
    id: 'din-tur',
    start: 68,
    title: 'Din tur',
    caption: 'Välj jobb och hur bra AI är. Vilka uppgifter påverkas mest, och vilka nästan inte alls?',
  },
];

export const EXPLORE = 'Välj jobb och hur bra AI är. Vilka uppgifter påverkas mest, och vilka nästan inte alls?';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  job: [
    k(0, 0),
    k(40, 0),
    k(40.01, 1, 'hold'),
    k(45, 1),
    k(45.01, 2, 'hold'),
    k(50, 2),
    k(50.01, 3, 'hold'),
    k(56, 3),
    k(56.01, 0, 'hold'),
    k(DURATION, 0),
  ],
  ability: [k(0, 0), k(15, 0), k(25, 0.5, 'smooth'), k(57, 0.5), k(64, 0.9, 'smooth'), k(68, 0.9), k(68.01, 0.5, 'hold'), k(DURATION, 0.5)],
};
