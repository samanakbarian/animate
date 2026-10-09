// Lär maskinen: spelaren är träningen. En neuron med heltalsvikter ska lära sig
// när Kim går ut. Varje drag ändrar en vikt eller biasen med ett steg. Banans par
// är det minsta antalet drag, uträknat med bredden-först-sökning.

export interface Input {
  id: string;
  label: string;
}

export interface Example {
  x: number[];
  yes: boolean;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  inputs: Input[];
  /** Regeln Kim följer. Exemplen är alla kombinationer av på/av. */
  rule: (x: number[]) => boolean;
  ruleText: string;
}

export const LIMIT = 3;
export const MAX_MOVES = 25;

export const LEVELS: Level[] = [
  {
    title: 'Bara solen',
    goal: 'Kim går ut när solen skiner. Ändra vikterna och biasen tills neuronen gissar rätt på alla exempel.',
    lesson: 'Att träna är att ändra vikterna efter felen. Den vikt som hör till det som avgör blir stor.',
    inputs: [
      { id: 'sol', label: 'Sol' },
      { id: 'laxor', label: 'Läxor' },
    ],
    rule: ([sol]) => sol === 1,
    ruleText: 'Kim går ut när solen skiner.',
  },
  {
    title: 'Sol men inga läxor',
    goal: 'Nu stannar Kim inne om det finns läxor. Vad behöver vikten för läxor bli?',
    lesson: 'En negativ vikt drar ner summan. Så kan en neuron lära sig att något talar emot.',
    inputs: [
      { id: 'sol', label: 'Sol' },
      { id: 'laxor', label: 'Läxor' },
    ],
    rule: ([sol, laxor]) => sol === 1 && laxor === 0,
    ruleText: 'Kim går ut när solen skiner och det inte finns några läxor.',
  },
  {
    title: 'En kompis till',
    goal: 'Kim går ut om solen skiner eller en kompis ringer, men inte om det finns läxor.',
    lesson: 'Med fler insignaler blir det svårare för hand. Därför tränas riktiga nätverk av en algoritm, steg för steg.',
    inputs: [
      { id: 'sol', label: 'Sol' },
      { id: 'laxor', label: 'Läxor' },
      { id: 'kompis', label: 'Kompis ringer' },
    ],
    rule: ([sol, laxor, kompis]) => (sol === 1 || kompis === 1) && laxor === 0,
    ruleText: 'Kim går ut om solen skiner eller en kompis ringer, men inte om det finns läxor.',
  },
];

export function examples(level: Level): Example[] {
  const n = level.inputs.length;
  return Array.from({ length: 2 ** n }, (_, m) => {
    const x = Array.from({ length: n }, (_, i) => (m >> (n - 1 - i)) & 1);
    return { x, yes: level.rule(x) };
  });
}

/** Parametrar: vikterna först, sist biasen. */
export const sum = (p: number[], x: number[]) => x.reduce((a, v, i) => a + v * p[i], p[x.length]);
export const guess = (p: number[], x: number[]) => sum(p, x) > 0;
export const wrong = (p: number[], ex: Example[]) => ex.filter((e) => guess(p, e.x) !== e.yes);

/** Minsta antal drag från nollor till alla rätt (bredden först). */
export function par(level: Level): number {
  const ex = examples(level);
  const n = level.inputs.length + 1;
  const start = new Array(n).fill(0);
  const key = (p: number[]) => p.join(',');
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let d = 0; d <= 4 * LIMIT * n; d++) {
    for (const p of frontier) if (wrong(p, ex).length === 0) return d;
    const next: number[][] = [];
    for (const p of frontier)
      for (let i = 0; i < n; i++)
        for (const s of [-1, 1]) {
          const q = [...p];
          q[i] += s;
          if (Math.abs(q[i]) > LIMIT || seen.has(key(q))) continue;
          seen.add(key(q));
          next.push(q);
        }
    frontier = next;
  }
  return Infinity;
}

/** En ledtråd som följer perceptronregeln för det första felet. */
export function hint(level: Level, p: number[]): string | null {
  const e = wrong(p, examples(level))[0];
  if (!e) return null;
  const on = level.inputs.filter((_, i) => e.x[i] === 1).map((x) => x.label.toLowerCase());
  const what = on.length ? on.join(' och ') : 'ingenting';
  return e.yes
    ? `Fel när ${what}: neuronen säger nej men Kim går ut. Höj något som drar summan uppåt.`
    : `Fel när ${what}: neuronen säger ja men Kim stannar inne. Sänk något som drar summan uppåt.`;
}

export const starsFor = (moves: number, best: number): 1 | 2 | 3 => (moves <= best ? 3 : moves <= best + 2 ? 2 : 1);
