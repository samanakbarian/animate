// Manus för modul 15 – Kontext. Fönstret, tokens, ett långt samtal där början
// faller bort, ett större fönster, och minnesanteckningar.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { CHAT } from './context';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION = 82;

/** Från när frågan om hunden syns i filmen. I utforskaläget syns den alltid. */
export const ASK_FROM = 36;

export const PARAMS: ParamSpec[] = [
  { id: 'window', label: 'Kontextfönster', min: 40, max: 300, step: 10, default: 120, format: (v) => `${Math.round(v)} tokens` },
  {
    id: 'count',
    label: 'Meddelanden före frågan',
    min: 2,
    max: CHAT.length,
    step: 1,
    default: CHAT.length,
    format: (v) => `${Math.round(v)}`,
  },
  { id: 'memory', label: 'Minnesanteckning', min: 0, max: 1, step: 1, default: 0, format: (v) => (v >= 0.5 ? 'på' : 'av') },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'fonster',
    start: 0,
    title: 'Det modellen ser',
    caption: 'En språkmodell ser bara en bit text åt gången, sitt kontextfönster. Allt den ska svara på måste få plats där.',
  },
  {
    id: 'tokens',
    start: 12,
    title: 'Fönstret mäts i tokens',
    caption: 'Fönstret mäts i tokens, ungefär ordbitar. Varje meddelande tar plats, både dina och modellens egna svar.',
  },
  {
    id: 'langt',
    start: 24,
    title: 'Samtalet växer',
    caption: 'Samtalet blir längre. När allt inte får plats faller det äldsta ur fönstret. Modellen ser det inte längre.',
  },
  {
    id: 'glomt',
    start: ASK_FROM,
    title: 'Bortglömt',
    caption: 'Nu frågar du vad hunden heter. Det stod i första meddelandet, men det ligger utanför fönstret. Modellen vet inte.',
  },
  {
    id: 'storre',
    start: 48,
    title: 'Ett större fönster',
    caption: 'Ett större fönster rymmer mer. Dagens modeller rymmer hela böcker, men fönstret tar alltid slut någon gång.',
  },
  {
    id: 'minne',
    start: 60,
    title: 'Minne är en anteckning',
    caption: 'En del tjänster sparar korta anteckningar och lägger dem först i fönstret. Så ”minns” de. Modellen själv lär sig inget.',
  },
  {
    id: 'din-tur',
    start: 72,
    title: 'Din tur',
    caption: 'Ändra fönstrets storlek, hur långt samtalet är och om minnet är på. När glömmer modellen hunden?',
  },
];

export const EXPLORE = 'Ändra fönstrets storlek, hur långt samtalet är och om minnet är på. När glömmer modellen hunden?';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  window: [k(0, 120), k(49, 120), k(57, 240, 'smooth'), k(60, 240), k(60.01, 120, 'hold'), k(DURATION, 120)],
  count: [k(0, 4), k(25, 4), k(34, CHAT.length), k(DURATION, CHAT.length)],
  memory: [k(0, 0), k(61, 0), k(61.01, 1, 'hold'), k(72, 1), k(72.01, 0, 'hold'), k(DURATION, 0)],
};
