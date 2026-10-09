// Manus för modul 11 – Att prata med AI: kapitel, reglage och nyckelrutor.
// Frågan byggs upp del för del, och i kapitlet ”Läs igenom” tas sammanhanget bort
// igen för att visa att modellen fyller luckor med påhittade detaljer.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { PIECES } from './prompt';

export const DURATION = 84;

const onOff = (v: number) => (v >= 0.5 ? 'med' : 'utan');

export const PARAMS: ParamSpec[] = PIECES.map((p) => ({ id: p.id, label: p.name, min: 0, max: 1, step: 1, default: 1, format: onOff }));

export const CHAPTERS: Chapter[] = [
  {
    id: 'vag',
    start: 0,
    title: 'En vag fråga',
    caption: '”Skriv ett mejl.” Modellen vet inte till vem eller om vad, så den skriver något allmänt som inte passar någon.',
  },
  {
    id: 'uppgift',
    start: 12,
    title: 'Vad och till vem',
    caption: 'Säg vad du vill och till vem. Nu blir mejlet rätt, men modellen fyller luckorna själv: en feber du aldrig haft.',
  },
  {
    id: 'sammanhang',
    start: 26,
    title: 'Sammanhang',
    caption: 'Berätta det viktiga: provet du missar. Då behöver modellen inte hitta på, och mejlet ställer rätt fråga.',
  },
  {
    id: 'format',
    start: 38,
    title: 'Format och ton',
    caption: 'Säg hur svaret ska se ut. Kort och vänligt, så försvinner fyllnaden.',
  },
  {
    id: 'exempel',
    start: 50,
    title: 'Ett exempel',
    caption: 'Ett exempel på hur du brukar skriva gör att svaret låter som du, och luckan för namnet försvinner.',
  },
  {
    id: 'las-igenom',
    start: 60,
    title: 'Läs igenom',
    caption: 'Utan sammanhang hittar modellen på igen. Läs alltid igenom svaret: det är du som skickar mejlet, inte modellen.',
  },
  { id: 'din-tur', start: 72, title: 'Din tur', caption: 'Ta med eller ta bort delar av frågan och se hur svaret ändras.' },
];

export const EXPLORE_CAPTION = 'Ta med eller ta bort delar av frågan. Markeringarna visar vad modellen hittade på eller fyllde ut.';

const k = (t: number, v: number, ease: Keyframe['ease'] = 'hold'): Keyframe => ({ t, v, ease });

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  task: [k(0, 0), k(12, 1), k(84, 1)],
  context: [k(0, 0), k(26, 1), k(60, 0), k(72, 1), k(84, 1)],
  format: [k(0, 0), k(38, 1), k(84, 1)],
  example: [k(0, 0), k(50, 1), k(84, 1)],
};
