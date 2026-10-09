// Ordräknaren: spelaren är en språkmodell. En kort text, och frågor om vilket
// ord som oftast kommer efter ett eller två givna ord. Allt räknas ur texten,
// så svaren kan aldrig bli fel i data.

export const TEXT = [
  'katten sover på mattan.',
  'katten jagar musen i köket.',
  'hunden sover i korgen.',
  'katten sover i solen.',
  'hunden jagar katten i trädgården.',
  'musen sover i hålet.',
  'hunden äter i köket.',
  'katten äter i trädgården.',
  'katten sover på soffan.',
  'hunden sover på mattan.',
  'hunden sover i köket.',
  'katten äter i köket.',
];

export const words = (text = TEXT) => text.join(' ').toLowerCase().replace(/\./g, ' .').split(/\s+/).filter(Boolean);

/** Hur ofta varje ord följer efter sammanhanget (ett eller flera ord). Meningsslut räknas inte. */
export function nextCounts(context: string[], text = TEXT): Map<string, number> {
  const w = words(text);
  const out = new Map<string, number>();
  for (let i = 0; i + context.length < w.length; i++) {
    if (context.every((c, j) => w[i + j] === c)) {
      const next = w[i + context.length];
      if (next !== '.') out.set(next, (out.get(next) ?? 0) + 1);
    }
  }
  return out;
}

export interface Question {
  context: string[];
  /** Fråga om sannolikhet för det här ordet (bana 3), annars om vanligaste ordet. */
  probabilityOf?: string;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  questions: Question[];
}

export const LEVELS: Level[] = [
  {
    title: 'Ett ord bakåt',
    goal: 'Vilket ord kommer oftast efter det markerade ordet i texten?',
    lesson: 'Det här är en språkmodell i miniatyr: den räknar vad som brukar följa, och gissar det vanligaste.',
    questions: [{ context: ['katten'] }, { context: ['hunden'] }, { context: ['på'] }, { context: ['äter'] }],
  },
  {
    title: 'Två ord bakåt',
    goal: 'Nu får du två ord. Vilket ord kommer oftast efter dem?',
    lesson: 'Med mer sammanhang blir gissningen säkrare. Stora modeller ser tusentals ord bakåt, inte bara två.',
    questions: [
      { context: ['katten', 'sover'] },
      { context: ['hunden', 'sover'] },
      { context: ['sover', 'på'] },
      { context: ['äter', 'i'] },
    ],
  },
  {
    title: 'Hur troligt?',
    goal: 'Hur stor del av gångerna kommer ordet efter? Det är sannolikheten modellen räknar med.',
    lesson: 'Modellen ger inte ett svar utan sannolikheter för alla ord. Sedan väljer den, ofta med lite slump.',
    questions: [
      { context: ['katten'], probabilityOf: 'sover' },
      { context: ['sover'], probabilityOf: 'i' },
      { context: ['hunden'], probabilityOf: 'jagar' },
      { context: ['i'], probabilityOf: 'köket' },
    ],
  },
];

/** Det vanligaste nästa ordet, eller null om flera är lika vanliga. */
export function mostCommon(context: string[]): string | null {
  const c = [...nextCounts(context)].sort((a, b) => b[1] - a[1]);
  if (!c.length || (c[1] && c[1][1] === c[0][1])) return null;
  return c[0][0];
}

export function probability(context: string[], word: string): number {
  const c = nextCounts(context);
  const total = [...c.values()].reduce((a, b) => a + b, 0);
  return total ? (c.get(word) ?? 0) / total : 0;
}

/** Svarsalternativ för en sannolikhetsfråga: rätt svar och två andra, i fast ordning. */
export function probabilityOptions(p: number): number[] {
  const cands = [0.1, 0.2, 0.25, 0.33, 0.4, 0.5, 0.6, 0.67, 0.75, 0.8, 0.9];
  const right = Math.round(p * 100) / 100;
  const others = cands.filter((c) => Math.abs(c - right) > 0.12);
  const lo = others.filter((c) => c < right).at(-1);
  const hi = others.find((c) => c > right);
  return [lo, right, hi].filter((x): x is number => x !== undefined).slice(0, 3);
}

export const starsFor = (right: number, total: number): 1 | 2 | 3 => (right === total ? 3 : right >= total - 1 ? 2 : 1);
