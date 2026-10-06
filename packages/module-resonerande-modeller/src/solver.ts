// En leksaksmodell av resonemang. En uppgift är en kedja räknesteg. Modellen har
// en budget tankesteg: så många steg som ryms skrivs ut (litet felrisk per steg),
// resten görs ”i huvudet” i själva svaret (stor felrisk per steg). Budget som blir
// över går till kontroller, och varje kontroll kan hitta och rätta ett skrivet fel.
// Alla slumputfall är fasta per uppgift och steg (hash), så samma budget ger
// alltid samma svar.

import { hash3 } from '@nastasteg/engine/core/math';

export type Op = '+' | '−' | '×' | '÷';

export interface Step {
  op: Op;
  n: number;
  /** Vad steget räknar ut, t.ex. ”platser”. */
  label: string;
}

export interface Problem {
  text: string;
  start: number;
  steps: Step[];
  seed: number;
}

export const ERR_WRITTEN = 0.06;
export const ERR_HEAD = 0.3;
export const CATCH = 0.6;
export const MAX_BUDGET = 8;

export const PROBLEMS: Problem[] = [
  {
    text: 'Ett tåg har 8 vagnar med 12 platser i varje. 37 platser är tagna. Vid nästa station går 9 personer av och 15 stiger på. Hur många platser är lediga nu?',
    start: 8,
    steps: [
      { op: '×', n: 12, label: 'platser totalt' },
      { op: '−', n: 37, label: 'lediga' },
      { op: '+', n: 9, label: 'efter att 9 gått av' },
      { op: '−', n: 15, label: 'efter att 15 stigit på' },
    ],
    seed: 11,
  },
  {
    text: 'En hylla har 5 rader med 9 böcker. Du lånar 13 och lämnar tillbaka 4. Resten packas lika i 4 lådor. Hur många böcker hamnar i varje låda?',
    start: 5,
    steps: [
      { op: '×', n: 9, label: 'böcker' },
      { op: '−', n: 13, label: 'efter lånet' },
      { op: '+', n: 4, label: 'efter återlämning' },
      { op: '÷', n: 4, label: 'per låda' },
    ],
    seed: 23,
  },
  {
    text: 'Du köper 4 kartonger med 6 ägg. 5 ägg går sönder på vägen hem. Hur många hela ägg har du?',
    start: 4,
    steps: [
      { op: '×', n: 6, label: 'ägg' },
      { op: '−', n: 5, label: 'hela ägg' },
    ],
    seed: 5,
  },
];

export function apply(v: number, op: Op, n: number): number {
  if (op === '+') return v + n;
  if (op === '−') return v - n;
  if (op === '×') return v * n;
  return Math.round(v / n);
}

/** Felets storlek när ett steg blir fel: ±1–4, aldrig 0. */
function slip(seed: number, j: number): number {
  const u = hash3(seed, j, 7);
  return (u < 0.5 ? -1 : 1) * (1 + Math.floor(hash3(seed, j, 8) * 4));
}

export interface Line {
  step: number;
  /** Vänsterled, t.ex. ”96 − 37”. */
  expr: string;
  /** Det modellen först skrev. */
  written: number;
  /** Rätt värde givet föregående rader (efter rättningar). */
  correct: number;
  /** Rättat av en kontroll? */
  fixed: boolean;
}

export interface Attempt {
  lines: Line[];
  /** Kontroller: vilket steg som rättades, eller −1 om kontrollen inte hittade något. */
  checks: number[];
  /** Steg som gjordes i huvudet utan att skrivas ut. */
  headSteps: number;
  answer: number;
  truth: number;
  ok: boolean;
}

export function truth(p: Problem): number {
  return p.steps.reduce((v, s) => apply(v, s.op, s.n), p.start);
}

export function solve(p: Problem, budget: number): Attempt {
  const k = p.steps.length;
  const w = Math.min(budget, k);
  const nChecks = Math.max(0, budget - k);
  // vilka skrivna steg som blir fel, och vilken kontroll som hittar dem
  const wrong = p.steps.map((_, j) => j < w && hash3(p.seed, j, 1) < ERR_WRITTEN);
  const fixedBy = p.steps.map(() => -1);
  const checks: number[] = [];
  for (let c = 0; c < nChecks; c++) {
    let found = -1;
    for (let j = 0; j < w && found < 0; j++)
      if (wrong[j] && fixedBy[j] < 0 && hash3(p.seed, j, 100 + c) < CATCH) {
        fixedBy[j] = c;
        found = j;
      }
    checks.push(found);
  }
  const lines: Line[] = [];
  let v = p.start;
  for (let j = 0; j < w; j++) {
    const s = p.steps[j];
    const correct = apply(v, s.op, s.n);
    const written = wrong[j] ? correct + slip(p.seed, j) : correct;
    const fixed = wrong[j] && fixedBy[j] >= 0;
    lines.push({ step: j, expr: `${v} ${s.op} ${s.n}`, written, correct, fixed });
    v = fixed ? correct : written;
  }
  for (let j = w; j < k; j++) {
    const s = p.steps[j];
    v = apply(v, s.op, s.n);
    if (hash3(p.seed, j, 2) < ERR_HEAD) v += slip(p.seed, j + 50);
  }
  const t = truth(p);
  return { lines, checks, headSteps: k - w, answer: v, truth: t, ok: v === t };
}

/** 100 seedade uppgifter med 2–5 steg, för diagrammet ”andel rätt mot budget”. */
export const BENCH: Problem[] = Array.from({ length: 100 }, (_, i) => {
  const k = 2 + Math.floor(hash3(i, 0, 900) * 4);
  return {
    text: '',
    start: 2 + Math.floor(hash3(i, 1, 900) * 8),
    steps: Array.from({ length: k }, (_, j) => ({ op: '+' as Op, n: 1 + Math.floor(hash3(i, j, 901) * 9), label: '' })),
    seed: 1000 + i,
  };
});

/** Andel rätt (0–1) på testuppgifterna för varje budget 0…MAX_BUDGET. */
export const ACCURACY: number[] = Array.from(
  { length: MAX_BUDGET + 1 },
  (_, b) => BENCH.filter((p) => solve(p, b).ok).length / BENCH.length,
);
