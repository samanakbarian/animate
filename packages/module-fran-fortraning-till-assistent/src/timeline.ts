// Manus för modul 6 – Från förträning till assistent.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { MAX_ROUNDS, PROMPTS, STAGES } from './stages';

export const DURATION = 86;

export const PARAMS: ParamSpec[] = [
  { id: 'prompt', label: 'Fråga', min: 0, max: PROMPTS.length - 1, step: 1, default: 0, format: (v) => PROMPTS[Math.round(v)].name },
  { id: 'stage', label: 'Skede', min: 0, max: STAGES.length - 1, step: 1, default: 2, format: (v) => STAGES[Math.round(v)].toLowerCase() },
  { id: 'rounds', label: 'Jämförelser', min: 0, max: MAX_ROUNDS, step: 1, default: MAX_ROUNDS, format: (v) => String(Math.floor(v)) },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'fortranad',
    start: 0,
    title: 'En textgissare',
    caption: 'Efter förträningen kan modellen en sak: gissa hur en text fortsätter. En fråga på nätet följs ofta av fler frågor.',
  },
  {
    id: 'harmar',
    start: 13,
    title: 'Den härmar nätet',
    caption: 'Modellen svarar inte, den härmar. Ser texten ut som ett forum eller ett quiz, fortsätter den som ett forum eller ett quiz.',
  },
  {
    id: 'finjustering',
    start: 26,
    title: 'Finjustering',
    caption: 'Modellen tränas vidare på tiotusentals exempel på samtal: en fråga, sedan ett bra svar. Nu svarar den.',
  },
  {
    id: 'formen',
    start: 39,
    title: 'Formen, inte kvaliteten',
    caption: 'Den har lärt sig hur ett svar ser ut, inte vad som är ett bra svar. Ett självsäkert fel ser ut precis som ett svar.',
  },
  {
    id: 'aterkoppling',
    start: 50,
    title: 'Människor väljer',
    caption: 'Människor jämför två svar och väljer det bättre. Valen blir en belöning, och modellen tränas mot svar med hög belöning.',
  },
  {
    id: 'resultat',
    start: 66,
    title: 'Samma smak överallt',
    caption: 'Belöningen gäller sorten av svar, inte en viss fråga. Därför blir modellen hjälpsammare på alla frågor.',
  },
  {
    id: 'din-tur',
    start: 78,
    title: 'Din tur',
    caption: 'Välj fråga och skede. Dra i jämförelserna och se hur sannolikheterna flyttar sig.',
  },
];

export const EXPLORE_CAPTION = 'Välj fråga och skede. Dra i jämförelserna och se hur sannolikheterna flyttar sig.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  prompt: [
    k(0, 0),
    k(17, 0),
    k(17.01, 1, 'hold'),
    k(21, 1),
    k(21.01, 2, 'hold'),
    k(26, 2),
    k(26.01, 0, 'hold'),
    k(41, 0),
    k(41.01, 2, 'hold'),
    k(50, 2),
    k(50.01, 0, 'hold'),
    k(68, 0),
    k(68.01, 1, 'hold'),
    k(72, 1),
    k(72.01, 2, 'hold'),
    k(78, 2),
    k(78.01, 0, 'hold'),
    k(86, 0),
  ],
  stage: [k(0, 0), k(28, 0), k(28.01, 1, 'hold'), k(52, 1), k(52.01, 2, 'hold'), k(86, 2)],
  rounds: [k(0, 0), k(54, 0), k(64, 30.99, 'linear'), k(86, 30.99)],
};
