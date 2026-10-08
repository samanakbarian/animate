// Manus för modul 7 – Resonerande modeller.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { MAX_BUDGET, PROBLEMS } from './solver';

export const DURATION = 80;

const NAMES = ['tåget', 'bokhyllan', 'äggen'];

export const PARAMS: ParamSpec[] = [
  { id: 'problem', label: 'Uppgift', min: 0, max: PROBLEMS.length - 1, step: 1, default: 0, format: (v) => NAMES[Math.round(v)] },
  { id: 'budget', label: 'Tankesteg', min: 0, max: MAX_BUDGET, step: 1, default: 4, format: (v) => String(Math.floor(v)) },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'direkt',
    start: 0,
    title: 'Svara direkt',
    caption:
      'En språkmodell skriver ett ord i taget. Ska den svara direkt måste hela uträkningen göras på ett enda ord, och då blir det ofta fel.',
  },
  {
    id: 'steg',
    start: 13,
    title: 'Skriv ut stegen',
    caption:
      'Låt i stället modellen skriva ner mellanleden först, som man gör på papper. Varje steg blir enkelt, och nästa steg kan bygga på det förra.',
  },
  {
    id: 'kurva',
    start: 27,
    title: 'Mer tanke, fler rätt',
    caption:
      'I den här förenklade modellen, på hundra liknande uppgifter: utan tankesteg blir ungefär hälften rätt, med fler steg blir fler rätt.',
  },
  {
    id: 'slarv',
    start: 39,
    title: 'Även steg kan bli fel',
    caption: 'Ett utskrivet steg kan också bli fel. Här blev 24 − 5 till 22, och felet följer med till svaret.',
  },
  {
    id: 'kontroll',
    start: 51,
    title: 'Kontrollera',
    caption: 'Tankesteg som blir över kan användas till att räkna om. En kontroll hittar felet, och svaret blir rätt.',
  },
  {
    id: 'pris',
    start: 62,
    title: 'Priset',
    caption: 'Varje tankesteg kostar tid och beräkning. Fler steg hjälper mest på uppgifter i flera led, men garanterar aldrig rätt svar.',
  },
  { id: 'din-tur', start: 72, title: 'Din tur', caption: 'Välj en uppgift och hur många tankesteg modellen får.' },
];

export const EXPLORE_CAPTION = 'En förenklad modell: välj en uppgift och hur många tankesteg den får. Följ stegen och diagrammet.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  problem: [k(0, 0), k(39, 0), k(39.01, 2, 'hold'), k(72, 2), k(72.01, 0, 'hold'), k(80, 0)],
  budget: [
    k(0, 0),
    k(14, 0),
    k(24, 4.99, 'linear'),
    k(30, 4.99),
    k(36, 8.99, 'linear'),
    k(39, 8.99),
    k(39.01, 2, 'hold'),
    k(53, 2),
    k(53.01, 3, 'hold'),
    k(62, 3),
    k(70, 8.99, 'linear'),
    k(72, 8.99),
    k(72.01, 4, 'hold'),
    k(80, 4),
  ],
};
