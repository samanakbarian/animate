// Manus för modul 18 – AI och lagen. Risknivåerna i AI-förordningen nerifrån och
// upp, och sist dina rättigheter enligt GDPR.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { EXAMPLES } from './rules';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION = 82;

/** Kapitlet om GDPR. Då visas rättigheterna i stället för AI-förordningens krav. */
export const GDPR = { start: 60, end: 70 };

export const PARAMS: ParamSpec[] = [
  { id: 'example', label: 'Exempel', min: 0, max: EXAMPLES.length - 1, step: 1, default: 0, format: (v) => EXAMPLES[Math.round(v)].short },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'lagen',
    start: 0,
    title: 'En lag om AI',
    caption:
      'EU har en lag om AI, AI-förordningen. Den delar in AI efter hur stor risken är för människor. Ju större risk, desto fler krav.',
  },
  {
    id: 'lag-risk',
    start: 10,
    title: 'Låg risk',
    caption: 'Det mesta är låg risk, som skräppostfilter och AI i spel. Där ställer AI-förordningen inga särskilda krav.',
  },
  {
    id: 'oppet',
    start: 22,
    title: 'Säg att det är AI',
    caption: 'Pratar du med en AI ska du få veta det. Bilder och filmer som AI gjort och som ser äkta ut ska märkas.',
  },
  {
    id: 'hog',
    start: 34,
    title: 'Hög risk',
    caption: 'När AI påverkar jobb, skola eller lån är risken hög. Då krävs bra data, loggar och att en människa har tillsyn.',
  },
  {
    id: 'forbjudet',
    start: 48,
    title: 'Förbjudet',
    caption: 'Vissa saker är förbjudna, som att ge människor poäng som avgör hur de behandlas, eller att läsa av elevers känslor.',
  },
  {
    id: 'gdpr',
    start: GDPR.start,
    title: 'Dina uppgifter',
    caption:
      'Uppgifter om dig skyddas också av GDPR. Du har rätt att få veta vad som används och att få ett viktigt beslut prövat av en människa.',
  },
  {
    id: 'din-tur',
    start: GDPR.end,
    title: 'Din tur',
    caption: 'Välj exempel och se var det hamnar och vilka krav som gäller.',
  },
];

export const EXPLORE = 'Välj exempel och se var det hamnar i pyramiden och vilka krav som gäller.';

/** Byter exempel vid varje tid i listan. */
const steps: [number, number][] = [
  [0, 0],
  [16, 1],
  [22, 2],
  [28, 3],
  [34, 4],
  [39, 5],
  [44, 6],
  [48, 7],
  [54, 8],
  [GDPR.start, 6],
  [GDPR.end, 0],
];

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  example: steps.flatMap(([t, v], i) => (i === 0 ? [k(t, v)] : [k(t, steps[i - 1][1]), k(t + 0.01, v, 'hold')])).concat([k(DURATION, 0)]),
};
