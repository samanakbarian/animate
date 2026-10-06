// Manus för modul 3 – Ord som tal.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { ANALOGIES, LONG_WORDS } from './embeddings';

export const DURATION = 78;

export const PARAMS: ParamSpec[] = [
  { id: 'long', label: 'Ord att dela', min: 0, max: LONG_WORDS.length - 1, step: 1, default: 0, format: (v) => LONG_WORDS[Math.round(v)] },
  {
    id: 'analogy',
    label: 'Räkneexempel',
    min: 0,
    max: ANALOGIES.length - 1,
    step: 1,
    default: 0,
    format: (v) => {
      const a = ANALOGIES[Math.round(v)];
      return `${a.a} − ${a.b} + ${a.c}`;
    },
  },
  { id: 'arrow', label: 'Räkningen', min: 0, max: 1, step: 0.01, default: 1, format: (v) => `${Math.round(v * 100)} %` },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'tokens',
    start: 0,
    title: 'Text blir bitar',
    caption: 'En dator kan bara räkna. Först delas texten i bitar – tokens. Långa ord blir flera bitar, och varje bit har ett nummer.',
  },
  {
    id: 'tal',
    start: 18,
    title: 'Bitar blir tal',
    caption: 'Varje token får en lista med tal – en inbäddning. Här sex tal per ord. I stora modeller är de tusentals.',
  },
  {
    id: 'karta',
    start: 30,
    title: 'En karta över betydelser',
    caption: 'Ritar man ut talen hamnar ord som används på liknande sätt nära varandra. Djur för sig, kungligt för sig.',
  },
  {
    id: 'rakna',
    start: 42,
    title: 'Räkna med ord',
    caption: 'Man kan räkna med betydelser: ta kung, dra bort man, lägg till kvinna – och hamna vid drottning.',
  },
  {
    id: 'fler',
    start: 54,
    title: 'Samma riktning',
    caption: 'Steget från man till kvinna är en riktning i rummet. Den fungerar för fler ord än kungar.',
  },
  { id: 'din-tur', start: 68, title: 'Din tur', caption: 'Välj ett ord att dela och ett räkneexempel. Dra i räkningen och se pilarna.' },
];

export const EXPLORE_CAPTION = 'Välj ord att dela i tokens och ett räkneexempel. Dra i räkningen och följ pilarna på kartan.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  long: [k(0, 0), k(6, 0), k(6.01, 1, 'hold'), k(10, 1), k(10.01, 2, 'hold'), k(14, 2), k(14.01, 3, 'hold'), k(78, 3)],
  analogy: [k(0, 0), k(56, 0), k(56.01, 1, 'hold'), k(61, 1), k(61.01, 2, 'hold'), k(66, 2), k(66.01, 0, 'hold'), k(78, 0)],
  arrow: [
    k(0, 0),
    k(44, 0),
    k(52, 1, 'linear'),
    k(56, 1),
    k(56.01, 0, 'hold'),
    k(59, 1, 'linear'),
    k(61, 1),
    k(61.01, 0, 'hold'),
    k(64, 1, 'linear'),
    k(78, 1),
  ],
};
