// Slå maskinen: rundor där spelaren och språkmodellen gissar nästa ord i en
// mening ur modellens egen träningstext. Bara lägen där modellen är osäker
// eller har fel väljs, annars vore maskinen omöjlig att slå.

import type { Rng } from '@nastasteg/engine/core/math';
import { CORPUS } from '@nastasteg/module-sprakmodellen/corpus';
import { MODEL, nextDistribution, tokenize } from '@nastasteg/module-sprakmodellen/model';

export interface Option {
  token: string;
  p: number;
}

export interface Round {
  /** Orden före luckan. */
  context: string[];
  answer: string;
  /** Alternativen i visningsordning. */
  options: Option[];
  /** Det maskinen väljer: alternativet med störst sannolikhet. */
  machine: string;
}

const isWord = (t: string) => /[a-zåäö]/.test(t);

interface Spot {
  context: string[];
  answer: string;
  sentence: number;
}

/** Alla lägen i texten där modellen är osäker (bästa gissningen under 75 %) eller har fel. */
export const SPOTS: Spot[] = (() => {
  const out: Spot[] = [];
  const sentences = CORPUS.split('.')
    .map((s) => tokenize(s))
    .filter((t) => t.length >= 3);
  sentences.forEach((toks, si) => {
    for (let i = 2; i < toks.length; i++) {
      if (!isWord(toks[i])) continue;
      const dist = nextDistribution(MODEL, toks.slice(0, i), 1).filter((c) => isWord(c.token));
      if (dist[0].p < 0.75 || dist[0].token !== toks[i]) out.push({ context: toks.slice(0, i), answer: toks[i], sentence: si });
    }
  });
  return out;
})();

export const ROUNDS = 8;

/** Bygger rundorna för en bana. `choices` = antal alternativ per runda. */
export function makeRounds(rng: Rng, choices: number): Round[] {
  const pool = [...SPOTS];
  // Fisher–Yates med seedad slump
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const used = new Set<number>();
  const picked: Spot[] = [];
  for (const s of pool) {
    if (used.has(s.sentence)) continue;
    used.add(s.sentence);
    picked.push(s);
    if (picked.length === ROUNDS) break;
  }
  return picked.map((s) => {
    const dist = nextDistribution(MODEL, s.context, 1).filter((c) => isWord(c.token));
    const others = dist.filter((c) => c.token !== s.answer).slice(0, choices - 1);
    const answer = dist.find((c) => c.token === s.answer)!;
    const options = [answer, ...others];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    const machine = options.reduce((a, b) => (b.p > a.p ? b : a)).token;
    return { context: s.context, answer: s.answer, options: options.map((o) => ({ token: o.token, p: o.p })), machine };
  });
}

export const starsFor = (you: number, machine: number): 1 | 2 | 3 => (you > machine ? 3 : you === machine ? 2 : 1);
