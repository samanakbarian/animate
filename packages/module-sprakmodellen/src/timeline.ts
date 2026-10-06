// Manus för modul 5: kapitel, reglage och nyckelrutor.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { PROMPTS } from './corpus';

export const DURATION = 80;
export const MAX_TOKENS = 16;

const int = (v: number) => String(Math.round(v));
const dec = (v: number) => v.toFixed(2).replace('.', ',');

export const PARAMS: ParamSpec[] = [
  { id: 'prompt', label: 'Början', min: 0, max: PROMPTS.length - 1, step: 1, default: 0, format: (v) => `”${PROMPTS[Math.round(v)]}”` },
  { id: 'steps', label: 'Antal gissade ord', min: 0, max: MAX_TOKENS, step: 1, default: 0, format: int },
  { id: 'temp', label: 'Temperatur', min: 0.1, max: 2, step: 0.05, default: 0.7, format: dec },
  { id: 'seed', label: 'Slumpfrö', min: 1, max: 9, step: 1, default: 3, format: int },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'tokens',
    start: 0,
    title: 'Text blir tokens',
    caption: 'En språkmodell läser inte som vi. Texten delas upp i bitar som kallas tokens. Här är varje ord och skiljetecken en token.',
  },
  {
    id: 'nasta',
    start: 11,
    title: 'Vad kommer sedan?',
    caption: 'För varje möjlig nästa token räknar modellen ut en sannolikhet. Staplarna visar de åtta mest troliga.',
  },
  {
    id: 'ett-i-taget',
    start: 22,
    title: 'En token i taget',
    caption: 'Modellen drar en token, lägger till den i texten och gissar igen. Så växer texten fram.',
  },
  {
    id: 'temperatur',
    start: 42,
    title: 'Temperatur',
    caption: 'Temperaturen styr hur mycket slump som får vara med. Låg blir förutsägbart och tjatigt. Hög blir snabbt rena nonsens.',
  },
  {
    id: 'storlek',
    start: 60,
    title: 'Liten och stor',
    caption:
      'Den här modellen har bara räknat vilka ord som följer på vilka i en kort text. De stora gör samma sak med ett neuralt nätverk och biljoner ord.',
  },
  {
    id: 'din-tur',
    start: 72,
    title: 'Din tur',
    caption: 'Välj en början, dra i temperaturen och byt slumpfrö. Samma inställningar ger alltid samma text.',
  },
];

export const EXPLORE_CAPTION = 'Välj en början, ändra temperaturen och slumpfröet, och se vilka ord modellen tror på härnäst.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  prompt: [k(0, 0), k(80, 0)],
  steps: [k(0, 0), k(24, 0), k(38, 12, 'linear'), k(80, 12)],
  temp: [k(0, 0.7), k(44, 0.7), k(47, 0.15), k(51, 0.15), k(56, 1.8), k(59, 1.8), k(62, 0.7), k(80, 0.7)],
  seed: [k(0, 3), k(80, 3)],
};
