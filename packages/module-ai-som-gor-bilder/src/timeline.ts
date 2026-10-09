// Manus för modul 13 – AI som gör bilder. Från brus till bild steg för steg,
// texten styr vad som växer fram, fröet ger variation, och träningen går baklänges.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { PROMPTS, STEPS } from './diffuse';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION = 82;

/** Kapitlet där förloppet visas baklänges, som under träningen. */
export const TRAINING = { start: 60, end: 72 };

export const PARAMS: ParamSpec[] = [
  { id: 'step', label: 'Steg', min: 0, max: STEPS, step: 1, default: STEPS, format: (v) => `${Math.round(v)} av ${STEPS}` },
  { id: 'prompt', label: 'Text', min: 0, max: PROMPTS.length - 1, step: 1, default: 0, format: (v) => `”${PROMPTS[Math.round(v)]}”` },
  { id: 'seed', label: 'Startbrus', min: 1, max: 5, step: 1, default: 1, format: (v) => `nr ${Math.round(v)}` },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'brus',
    start: 0,
    title: 'Det börjar med brus',
    caption:
      'En bildmodell börjar inte med en tom duk. Den börjar med brus: slumpade prickar i alla färger, och en text som säger vad bilden ska visa.',
  },
  {
    id: 'steg',
    start: 10,
    title: 'Lite brus i taget',
    caption: 'I varje steg gissar modellen vilket brus som inte passar texten och tar bort en del av det. Sedan gissar den igen.',
  },
  {
    id: 'grovt',
    start: 24,
    title: 'Grovt först',
    caption: 'De stora formerna kommer först, som himmel, mark och var solen står. Detaljerna och de skarpa kanterna kommer sist.',
  },
  {
    id: 'text',
    start: 36,
    title: 'Texten styr',
    caption: 'Samma startbrus med en annan text blir en helt annan bild. Texten avgör vad modellen letar efter i bruset.',
  },
  {
    id: 'fro',
    start: 48,
    title: 'Nytt brus, ny bild',
    caption: 'Samma text med ett annat startbrus ger en ny bild med samma innehåll. Därför blir bilden olika varje gång du frågar.',
  },
  {
    id: 'traning',
    start: TRAINING.start,
    title: 'Träningen går baklänges',
    caption: 'Under träningen fick riktiga bilder brus tillagt, steg för steg. Modellen övade på att gissa vilket brus som lagts till.',
  },
  {
    id: 'din-tur',
    start: TRAINING.end,
    title: 'Din tur',
    caption: 'Välj text och startbrus, och dra i stegen. Titta på vad som syns först.',
  },
];

export const EXPLORE = 'Välj text och startbrus och dra i stegen. Vilka former syns först, och vad ändras med ett nytt startbrus?';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  step: [
    k(0, 0),
    k(10, 0),
    k(24, 8),
    k(34, STEPS, 'smooth'),
    k(36, STEPS),
    k(36.01, 0, 'hold'),
    k(38, 0),
    k(46, STEPS, 'smooth'),
    k(48, STEPS),
    k(48.01, 0, 'hold'),
    k(50, 0),
    k(58, STEPS, 'smooth'),
    k(61, STEPS),
    k(70, 0, 'smooth'),
    k(72, 0),
    k(77, STEPS, 'smooth'),
    k(DURATION, STEPS),
  ],
  prompt: [k(0, 0), k(36, 0), k(36.01, 1, 'hold'), k(48, 1), k(48.01, 0, 'hold'), k(DURATION, 0)],
  seed: [k(0, 1), k(48, 1), k(48.01, 2, 'hold'), k(72, 2), k(72.01, 1, 'hold'), k(DURATION, 1)],
};
