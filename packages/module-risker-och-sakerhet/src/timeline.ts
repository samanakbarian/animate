// Manus för modul 10 – Risker och säkerhet. Två delar: säker men fel, och spärrar.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { formatNumber } from '@nastasteg/engine/module/params';
import { QUESTIONS } from './confidence';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });
const onOff = (v: number) => (v >= 0.5 ? 'på' : 'av');

// --- del 1

export const DURATION_1 = 76;

export const PARAMS_1: ParamSpec[] = [
  { id: 'question', label: 'Fråga', min: 0, max: QUESTIONS.length - 1, step: 1, default: 0, format: (v) => QUESTIONS[Math.round(v)].name },
  { id: 'reveal', label: 'Visa rätt svar', min: 0, max: 1, step: 1, default: 1, format: onOff },
  {
    id: 'threshold',
    label: 'Säg ”vet inte” under',
    min: 0,
    max: 0.9,
    step: 0.05,
    default: 0,
    format: (v) => (v < 0.01 ? 'aldrig' : `${Math.round(v * 100)} %`),
  },
];

export const CHAPTERS_1: Chapter[] = [
  {
    id: 'vet',
    start: 0,
    title: 'När modellen vet',
    caption: 'Fråga om något välkänt, så är ett svar mycket troligare än alla andra. Modellen vet, och svaret blir rätt.',
  },
  {
    id: 'gissar',
    start: 12,
    title: 'När den gissar',
    caption: 'Här sticker inget svar ut. Ändå skriver modellen det troligaste med samma säkra ton. Och det är fel.',
  },
  {
    id: 'hittar-pa',
    start: 26,
    title: 'Den hittar på',
    caption: 'Även frågor om saker som inte finns får ett svar. Modellen väljer det som låter rimligast. Det kallas att hallucinera.',
  },
  {
    id: 'syns-inte',
    start: 40,
    title: 'Osäkerheten syns inte',
    caption: 'Skillnaden mellan att veta och att gissa syns i staplarna, men inte i texten. Den som läser ser bara en säker mening.',
  },
  {
    id: 'vet-inte',
    start: 52,
    title: 'Att säga ”vet inte”',
    caption: 'En modell kan tränas att säga att den inte vet när svaren är utspridda. Då försvinner felen, men även ett rätt svar.',
  },
  {
    id: 'din-tur',
    start: 66,
    title: 'Din tur',
    caption: 'Välj en fråga, dölj det rätta svaret och gissa själv. Flytta gränsen för ”vet inte”.',
  },
];

export const EXPLORE_CAPTION_1 = 'Välj en fråga och jämför svaret med staplarna. Flytta gränsen för när modellen ska säga ”vet inte”.';

export const TRACKS_1: Partial<Record<string, Keyframe[]>> = {
  question: [
    k(0, 0),
    k(12, 0),
    k(12.01, 3, 'hold'),
    k(26, 3),
    k(26.01, 4, 'hold'),
    k(33, 4),
    k(33.01, 5, 'hold'),
    k(40, 5),
    k(40.01, 1, 'hold'),
    k(44, 1),
    k(44.01, 5, 'hold'),
    k(48, 5),
    k(48.01, 3, 'hold'),
    k(52, 3),
    k(52.01, 5, 'hold'),
    k(58, 5),
    k(58.01, 2, 'hold'),
    k(66, 2),
    k(66.01, 0, 'hold'),
    k(76, 0),
  ],
  reveal: [
    k(0, 0),
    k(6, 0),
    k(6.01, 1, 'hold'),
    k(12, 1),
    k(12.01, 0, 'hold'),
    k(20, 0),
    k(20.01, 1, 'hold'),
    k(26, 1),
    k(26.01, 0, 'hold'),
    k(29, 0),
    k(29.01, 1, 'hold'),
    k(33, 1),
    k(33.01, 0, 'hold'),
    k(36, 0),
    k(36.01, 1, 'hold'),
    k(40, 1),
    k(40.01, 0, 'hold'),
    k(52, 0),
    k(52.01, 1, 'hold'),
    k(76, 1),
  ],
  threshold: [k(0, 0), k(53, 0), k(55, 0.5), k(66, 0.5), k(66.01, 0, 'hold'), k(76, 0)],
};

// --- del 2

export const DURATION_2 = 72;

export const PARAMS_2: ParamSpec[] = [
  { id: 'threshold', label: 'Neka över riskvärdet', min: 0.2, max: 0.95, step: 0.01, default: 0.6, format: (v) => formatNumber(v) },
  { id: 'jailbreak', label: 'Försök att lura spärren', min: 0, max: 1, step: 0.01, default: 0, format: (v) => `${Math.round(v * 100)} %` },
  { id: 'retrained', label: 'Spärren omtränad', min: 0, max: 1, step: 1, default: 0, format: onOff },
];

export const CHAPTERS_2: Chapter[] = [
  {
    id: 'sparr',
    start: 0,
    title: 'En spärr',
    caption: 'Innan modellen svarar bedömer en spärr hur riskabel frågan är. Över en viss gräns nekar modellen. Varje prick är en fråga.',
  },
  {
    id: 'strikt',
    start: 12,
    title: 'För strikt',
    caption: 'En låg gräns stoppar nästan allt skadligt, men också många vanliga frågor. Att döda en process i Linux är ofarligt.',
  },
  {
    id: 'slapp',
    start: 24,
    title: 'För slapp',
    caption: 'En hög gräns släpper igenom alla vanliga frågor, men också en hel del skadliga.',
  },
  {
    id: 'lura',
    start: 36,
    title: 'Att lura spärren',
    caption: 'Folk försöker lura spärren, till exempel genom att be modellen spela en roll. Då ser skadliga frågor ofarligare ut.',
  },
  {
    id: 'testa',
    start: 50,
    title: 'Testa och träna om',
    caption: 'Därför testar man modeller med sådana knep innan de släpps, och tränar om spärren på dem. Sedan kommer nya knep.',
  },
  { id: 'din-tur', start: 62, title: 'Din tur', caption: 'Flytta gränsen, försök lura spärren och träna om den. Var hamnar exemplen?' },
];

export const EXPLORE_CAPTION_2 = 'Flytta gränsen och se vilka frågor som nekas. Prova att lura spärren och att träna om den.';

export const TRACKS_2: Partial<Record<string, Keyframe[]>> = {
  threshold: [k(0, 0.6), k(12, 0.6), k(15, 0.4), k(24, 0.4), k(27, 0.82), k(36, 0.82), k(38, 0.6), k(72, 0.6)],
  jailbreak: [k(0, 0), k(39, 0), k(45, 1, 'linear'), k(72, 1)],
  retrained: [k(0, 0), k(53, 0), k(53.01, 1, 'hold'), k(72, 1)],
};
