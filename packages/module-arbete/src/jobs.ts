// Ett jobb som en vecka av uppgifter. För varje uppgift: hur stor del av veckan
// den tar, hur svår den är för AI och om den kräver händer eller möten mellan
// människor. Siffrorna är påhittade för att visa idén, inte mätningar.

import { clamp } from '@nastasteg/engine/core/math';

export type Kind = 'text' | 'manniska' | 'hand';

export interface Task {
  name: string;
  /** Andel av veckan, alla uppgifter i ett jobb summerar till 1. */
  share: number;
  /** Hur bra AI måste vara för att börja klara uppgiften (0–1). */
  hard: number;
  kind: Kind;
}

export interface Job {
  title: string;
  tasks: Task[];
}

export const JOBS: Job[] = [
  {
    title: 'Kundtjänst',
    tasks: [
      { name: 'Svara på vanliga frågor', share: 0.35, hard: 0.2, kind: 'text' },
      { name: 'Lösa krångliga ärenden', share: 0.3, hard: 0.65, kind: 'text' },
      { name: 'Lugna arga kunder', share: 0.15, hard: 0.9, kind: 'manniska' },
      { name: 'Dokumentera ärenden', share: 0.2, hard: 0.25, kind: 'text' },
    ],
  },
  {
    title: 'Lärare',
    tasks: [
      { name: 'Undervisa i klassrummet', share: 0.4, hard: 0.95, kind: 'manniska' },
      { name: 'Planera lektioner', share: 0.2, hard: 0.4, kind: 'text' },
      { name: 'Rätta prov', share: 0.15, hard: 0.5, kind: 'text' },
      { name: 'Prata med elever och föräldrar', share: 0.15, hard: 0.9, kind: 'manniska' },
      { name: 'Administration', share: 0.1, hard: 0.3, kind: 'text' },
    ],
  },
  {
    title: 'Sjuksköterska',
    tasks: [
      { name: 'Vård vid sängen', share: 0.45, hard: 0.95, kind: 'hand' },
      { name: 'Bedöma patienter', share: 0.2, hard: 0.8, kind: 'manniska' },
      { name: 'Journalföring', share: 0.2, hard: 0.3, kind: 'text' },
      { name: 'Planera och samordna', share: 0.15, hard: 0.5, kind: 'text' },
    ],
  },
  {
    title: 'Snickare',
    tasks: [
      { name: 'Bygga och montera', share: 0.6, hard: 0.98, kind: 'hand' },
      { name: 'Mäta och räkna material', share: 0.15, hard: 0.35, kind: 'text' },
      { name: 'Offerter och kundkontakt', share: 0.15, hard: 0.45, kind: 'text' },
      { name: 'Planera jobbet', share: 0.1, hard: 0.5, kind: 'text' },
    ],
  },
];

/** Hur stor del av en uppgift AI som mest kan ta. Text kan AI göra mycket av, händer och möten nästan inget. */
export const MAX_SHARE: Record<Kind, number> = { text: 0.7, manniska: 0.15, hand: 0.05 };

/** Granskning tar en del av den tid AI sparar: någon måste läsa och ta ansvar. */
export const CHECK_COST = 0.3;

/** Hur stor del av uppgiften AI gör vid förmågan `ability` (0–1). */
export const aiPart = (task: Task, ability: number) =>
  MAX_SHARE[task.kind] * clamp((ability - task.hard + 0.25) / 0.5) * clamp(ability / 0.1);

export interface WeekResult {
  /** Per uppgift: andel av veckan som AI gör. */
  ai: number[];
  /** Andel av veckan som AI tar totalt. */
  aiTotal: number;
  /** Ny uppgift: granska det AI gör. */
  check: number;
  /** Tid som blir över för annat. */
  freed: number;
}

export function week(job: Job, ability: number): WeekResult {
  const ai = job.tasks.map((t) => t.share * aiPart(t, ability));
  const aiTotal = ai.reduce((a, b) => a + b, 0);
  const check = aiTotal * CHECK_COST;
  return { ai, aiTotal, check, freed: aiTotal - check };
}
