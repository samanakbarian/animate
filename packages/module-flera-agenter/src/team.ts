// Ett lag av agenter löser en uppgift i tolv delar. Arbetarna gör ibland fel:
// slarvfel (som en granskande agent oftast hittar) och fel i knepiga delar
// (blinda fläckar som granskaren delar, eftersom den är samma sorts modell).
// En människa hittar andra saker men tar tid. Alla utfall är fasta per del (hash).

import { hash3 } from '@nastasteg/engine/core/math';

export const PARTS = [
  'läs kravet',
  'samla data',
  'rensa data',
  'räkna summor',
  'jämför med förra året',
  'rita diagram',
  'skriv sammanfattning',
  'kontrollera källor',
  'tolka avvikelser',
  'skriv slutsatser',
  'formatera rapporten',
  'skicka till chefen',
] as const;

/** Knepiga delar: kräver omdöme, inte bara noggrannhet. */
export const TRICKY = new Set([4, 7, 8, 9]);

const SEED = 9;
export const ERR_PLAIN = 0.15;
export const ERR_TRICKY = 0.6;
export const AGENT_CATCH_SLIP = 0.85;
export const AGENT_CATCH_BLIND = 0.1;
export const HUMAN_CATCH = 0.85;

/** Tidsenheter: en del tar 1, granskning per del 0,25, människan 4 för hela rapporten. */
export const T_PART = 1;
export const T_AGENT_REVIEW = 0.25;
export const T_HUMAN = 4;

export type Fate = 'ok' | 'error' | 'caught-agent' | 'caught-human';

export interface Outcome {
  /** Vilken arbetare (0-baserad) som gjorde delen. */
  worker: number[];
  /** Blev delen fel när arbetaren gjorde den? */
  wrong: boolean[];
  fate: Fate[];
  errorsLeft: number;
  caughtByAgent: number;
  caughtByHuman: number;
  /** Total tid i tidsenheter. */
  time: number;
}

export function run(workers: number, agentReview: boolean, human: boolean): Outcome {
  const n = PARTS.length;
  const w = Math.max(1, Math.min(4, Math.round(workers)));
  const worker = PARTS.map((_, i) => i % w);
  const wrong = PARTS.map((_, i) => hash3(SEED, i, 1) < (TRICKY.has(i) ? ERR_TRICKY : ERR_PLAIN));
  const fate: Fate[] = PARTS.map((_, i) => {
    if (!wrong[i]) return 'ok';
    const pAgent = TRICKY.has(i) ? AGENT_CATCH_BLIND : AGENT_CATCH_SLIP;
    if (agentReview && hash3(SEED, i, 2) < pAgent) return 'caught-agent';
    if (human && hash3(SEED, i, 3) < HUMAN_CATCH) return 'caught-human';
    return 'error';
  });
  const rounds = Math.ceil(n / w);
  const time = rounds * T_PART + (agentReview ? rounds * T_AGENT_REVIEW : 0) + (human ? T_HUMAN : 0);
  return {
    worker,
    wrong,
    fate,
    errorsLeft: fate.filter((f) => f === 'error').length,
    caughtByAgent: fate.filter((f) => f === 'caught-agent').length,
    caughtByHuman: fate.filter((f) => f === 'caught-human').length,
    time,
  };
}
