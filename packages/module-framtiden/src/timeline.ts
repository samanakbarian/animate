// Manus för modul 20 – Framtiden. Vad AGI och ASI betyder, ett sätt att mäta,
// trenden, vad den ger om den håller, hur osäkert det är, olika syner och vad
// forskare gör för säkerheten.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { PACES } from './trend';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION = 94;

/** Kapitel som ritas som egna bilder i filmen. I utforskaläget visas alltid diagrammet. */
export const WORDS_TO = 12;
export const VIEWS_FROM = 60;
export const SAFETY_FROM = 72;
export const TURN_FROM = 84;
/** Mätpunkterna dyker upp en i taget under kapitlet om måttet. */
export const POINTS_FROM = 13;
export const POINTS_TO = 22;
/** Linjen framåt syns från kapitlet ”Om trenden håller”. */
export const AHEAD_FROM = 36;

export const YEAR_MIN = 2026;
export const YEAR_MAX = 2035;

export const PARAMS: ParamSpec[] = [
  { id: 'pace', label: 'Fördubbling', min: 0, max: PACES.length - 1, step: 1, default: 1, format: (v) => PACES[Math.round(v)].short },
  { id: 'year', label: 'År', min: YEAR_MIN, max: YEAR_MAX, step: 1, default: 2030, format: (v) => String(Math.round(v)) },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'ord',
    start: 0,
    title: 'AGI och ASI',
    caption:
      'AGI är AI som är minst lika bra som människor på i stort sett allt. ASI är bättre än alla människor. Var gränsen går är ingen överens om.',
  },
  {
    id: 'matt',
    start: 12,
    title: 'Ett sätt att mäta',
    caption: 'Hur långa uppgifter klarar en AI-agent på egen hand? Längden mäts i hur lång tid uppgiften tar för en människa.',
  },
  {
    id: 'trend',
    start: 24,
    title: 'Trenden',
    caption: 'Sedan 2019 har längden fördubblats ungefär var sjunde månad, från några sekunder till ett par timmar.',
  },
  {
    id: 'framat',
    start: AHEAD_FROM,
    title: 'Om trenden håller',
    caption: 'Fortsätter det så, klarar AI uppgifter på ett par arbetsmånader år 2030. Men en trend är ingen naturlag.',
  },
  {
    id: 'osaker',
    start: 48,
    title: 'Osäkert',
    caption: 'Lite snabbare eller långsammare ger en helt annan framtid. Och trenden kan stanna om data, el eller pengar inte räcker.',
  },
  {
    id: 'syner',
    start: VIEWS_FROM,
    title: 'Olika syner',
    caption: 'Forskare är oense. I en stor enkät 2023 gav AI-forskare 50 % chans att maskiner klarar allt bättre än människor år 2047.',
  },
  {
    id: 'sakerhet',
    start: SAFETY_FROM,
    title: 'Vad forskare gör',
    caption: 'Forskare försöker få AI att göra det vi menar, se in i modellerna och testa farliga förmågor innan en modell släpps.',
  },
  {
    id: 'din-tur',
    start: TURN_FROM,
    title: 'Din tur',
    caption: 'Välj hur fort trenden går och vilket år. Hur mycket skiljer det?',
  },
];

export const EXPLORE = 'Välj hur fort trenden går och vilket år. Hur mycket skiljer det mellan fyra och fjorton månader?';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  pace: [
    k(0, 1),
    k(50, 1),
    k(50.01, 0, 'hold'),
    k(53, 0),
    k(53.01, 2, 'hold'),
    k(56, 2),
    k(56.01, 3, 'hold'),
    k(VIEWS_FROM, 3),
    k(VIEWS_FROM + 0.01, 1, 'hold'),
    k(DURATION, 1),
  ],
  year: [k(0, YEAR_MIN), k(38, YEAR_MIN), k(44, 2030, 'smooth'), k(DURATION, 2030)],
};
