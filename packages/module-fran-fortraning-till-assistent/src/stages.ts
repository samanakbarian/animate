// Samma modell i tre skeden: förtränad, finjusterad och tränad med återkoppling.
// Varje fråga har fyra kandidatsvar av fyra sorter. Skedet bestämmer hur troligt
// varje svar är (softmax över logits). I återkopplingen jämför en människa två svar
// per runda, och en belöning per sort lärs med Bradley–Terry. Modellens logits blir
// finjusteringens logits + β · belöning. Allt seedat – samma runda ger samma tal.

import { hash2 } from '@nastasteg/engine/core/math';

export const KINDS = ['fortsätter texten', 'låter som ett forum', 'hjälpsamt', 'självsäkert fel'] as const;
export type Kind = 0 | 1 | 2 | 3;

export const STAGES = ['Förtränad', 'Finjusterad', 'Återkoppling'] as const;

export interface Prompt {
  name: string;
  text: string;
  /** Ett svar per sort, i samma ordning som KINDS. */
  answers: [string, string, string, string];
}

export const PROMPTS: Prompt[] = [
  {
    name: 'äggen',
    text: 'Hur länge ska ett ägg koka?',
    answers: [
      'Hur länge ska pasta koka? Hur länge ska ris koka? Hur länge ska …',
      'Det här har diskuterats i tråden ovan. Sök innan du frågar.',
      'Lägg ägget i kokande vatten: 6 minuter för löskokt, 9–10 för hårdkokt.',
      'Ett ägg ska alltid koka i exakt 20 minuter.',
    ],
  },
  {
    name: 'hälsningen',
    text: 'Skriv en kort hälsning till en kollega som fyller år.',
    answers: [
      'Skriv en kort hälsning till en kollega som går i pension. Skriv en …',
      'Någon som har tips på roliga födelsedagsramsor? Behöver till jobbet.',
      'Grattis på födelsedagen! Hoppas du får en fin dag – fikat bjuder jag på.',
      'Grattis på 50-årsdagen, Anders! Tack för alla år på ekonomi.',
    ],
  },
  {
    name: 'huvudstaden',
    text: 'Vad är huvudstaden i Australien?',
    answers: [
      'Vad är huvudstaden i Kanada? Vad är huvudstaden i Brasilien?',
      'Fråga 7 av 20 i quizet. Svaren finns längst ner på sidan.',
      'Canberra – inte Sydney, som många tror.',
      'Sydney, Australiens största och mest kända stad.',
    ],
  },
];

/** Logits per sort i de två första skedena. */
const PRETRAINED = [2.2, 1.4, 0.1, 0.5];
const FINETUNED = [-2.5, -1.0, 1.0, 0.75];

/** Människans smak: högre är bättre. Används bara för att avgöra jämförelser. */
const TASTE = [0, 0.5, 3, 1];
export const MAX_ROUNDS = 30;
const LR = 0.5;
const BETA = 2;
const NOISE = 0.1;

export interface Comparison {
  a: Kind;
  b: Kind;
  winner: Kind;
  prompt: number;
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const e = logits.map((l) => Math.exp(l - m));
  const z = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / z);
}

/** Jämförelsen i runda r (1-baserad). Människan väljer fel i ca 10 % av fallen. */
export function comparison(r: number): Comparison {
  const a = Math.floor(hash2(r, 1) * 4) as Kind;
  const b = ((a + 1 + Math.floor(hash2(r, 2) * 3)) % 4) as Kind;
  const better = TASTE[a] >= TASTE[b] ? a : b;
  const worse = better === a ? b : a;
  const winner = hash2(r, 3) < NOISE ? worse : better;
  return { a, b, winner, prompt: Math.floor(hash2(r, 4) * PROMPTS.length) };
}

/** Belöning per sort efter `rounds` rundor (Bradley–Terry, gradientsteg per jämförelse). */
export const REWARDS: number[][] = (() => {
  const out = [[0, 0, 0, 0]];
  const r = [0, 0, 0, 0];
  for (let i = 1; i <= MAX_ROUNDS; i++) {
    const c = comparison(i);
    const loser = c.winner === c.a ? c.b : c.a;
    const g = LR * (1 - sigmoid(r[c.winner] - r[loser]));
    r[c.winner] += g;
    r[loser] -= g;
    out.push([...r]);
  }
  return out;
})();

/** Sannolikhet per sort för ett skede (0–2) och antal återkopplingsrundor. */
export function probabilities(stage: number, rounds = MAX_ROUNDS): number[] {
  if (stage <= 0) return softmax(PRETRAINED);
  if (stage === 1) return softmax(FINETUNED);
  const rw = REWARDS[Math.max(0, Math.min(MAX_ROUNDS, Math.floor(rounds)))];
  return softmax(FINETUNED.map((l, i) => l + BETA * rw[i]));
}
