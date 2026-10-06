// Ord som tal: tokenisering med ett litet ordbitslexikon (längsta prefix först),
// inbäddningar som vektorer, en 2D-karta via PCA och analogier med vektorräkning.
// Vektorerna är handgjorda och få (en riktig modell lär sig tusentals dimensioner),
// men räkningen är densamma.

import { Rng } from '@nastasteg/engine/core/math';

// ---------------------------------------------------------------------------
// Tokenisering

export const SUBWORDS = [
  'upp',
  'märk',
  'sam',
  'het',
  'ord',
  'list',
  'an',
  'språk',
  'modell',
  'erna',
  'in',
  'bädd',
  'ning',
  'ar',
  'maskin',
  'en',
  'regn',
  'et',
  'n',
];
export const LONG_WORDS = ['uppmärksamhet', 'ordlistan', 'språkmodellerna', 'inbäddningar'] as const;

/** Delar ett ord i tokens genom att hela tiden ta den längsta bit som finns i lexikonet. */
export function tokenize(word: string, vocab: readonly string[] = SUBWORDS): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < word.length) {
    let best = word[i];
    for (const v of vocab) if (v.length > best.length && word.startsWith(v, i)) best = v;
    out.push(best);
    i += best.length;
  }
  return out;
}

export const tokenId = (piece: string) => {
  const i = SUBWORDS.indexOf(piece);
  return i >= 0 ? 100 + i * 37 : 9000 + piece.charCodeAt(0);
};

// ---------------------------------------------------------------------------
// Inbäddningar: [kunglig, manlig(+)/kvinnlig(−), vuxen, djur, kattdjur, liten]

export const DIMS = ['kunglig', 'manlig–kvinnlig', 'vuxen', 'djur', 'katt', 'liten'];

const BASE: Record<string, number[]> = {
  kung: [1, 1, 1, 0, 0, 0],
  drottning: [1, -1, 1, 0, 0, 0],
  prins: [1, 1, 0, 0, 0, 0.4],
  prinsessa: [1, -1, 0, 0, 0, 0.4],
  man: [0, 1, 1, 0, 0, 0],
  kvinna: [0, -1, 1, 0, 0, 0],
  pojke: [0, 1, 0, 0, 0, 0.4],
  flicka: [0, -1, 0, 0, 0, 0.4],
  hund: [0, 0, 1, 1, -0.6, 0],
  valp: [0, 0, 0, 1, -0.6, 1],
  katt: [0, 0, 1, 1, 0.8, 0],
  kattunge: [0, 0, 0, 1, 0.8, 1],
  häst: [0, 0, 1, 1, -0.2, 0],
  barn: [0, 0, 0, 0, 0, 0.7],
};

/** Inbäddningar med lite seedat brus – riktiga vektorer är aldrig perfekta. */
export const EMBEDDINGS: Record<string, number[]> = (() => {
  const rng = new Rng(2024);
  const out: Record<string, number[]> = {};
  for (const [w, v] of Object.entries(BASE)) out[w] = v.map((x) => x + rng.range(-0.08, 0.08));
  return out;
})();

export const WORDS = Object.keys(EMBEDDINGS);

const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = (a: number[]) => Math.sqrt(dot(a, a));
export const cosine = (a: number[], b: number[]) => dot(a, b) / (norm(a) * norm(b) || 1);

export interface Analogy {
  a: string;
  b: string;
  c: string;
}

export const ANALOGIES: Analogy[] = [
  { a: 'kung', b: 'man', c: 'kvinna' },
  { a: 'pojke', b: 'man', c: 'kvinna' },
  { a: 'valp', b: 'hund', c: 'katt' },
  { a: 'prins', b: 'pojke', c: 'flicka' },
];

/** a − b + c, och det närmaste ordet (cosinus) som inte är a, b eller c. */
export function solve({ a, b, c }: Analogy): { vector: number[]; answer: string; similarity: number } {
  const v = EMBEDDINGS[a].map((x, i) => x - EMBEDDINGS[b][i] + EMBEDDINGS[c][i]);
  let answer = '',
    best = -Infinity;
  for (const w of WORDS) {
    if (w === a || w === b || w === c) continue;
    const sim = cosine(v, EMBEDDINGS[w]);
    if (sim > best) {
      best = sim;
      answer = w;
    }
  }
  return { vector: v, answer, similarity: best };
}

// ---------------------------------------------------------------------------
// 2D-karta: de två första principalkomponenterna (potensmetoden, deterministisk)

function principal(data: number[][], deflate: number[] | null): number[] {
  const d = data[0].length;
  let v = Array.from({ length: d }, (_, i) => 1 / Math.sqrt(d) + i * 0.01);
  for (let it = 0; it < 200; it++) {
    const next = new Array(d).fill(0);
    for (const x of data) {
      const p = dot(x, v);
      for (let i = 0; i < d; i++) next[i] += p * x[i];
    }
    if (deflate) {
      const p = dot(next, deflate);
      for (let i = 0; i < d; i++) next[i] -= p * deflate[i];
    }
    const n = norm(next);
    v = next.map((x) => x / n);
  }
  return v;
}

const MEAN = DIMS.map((_, i) => WORDS.reduce((s, w) => s + EMBEDDINGS[w][i], 0) / WORDS.length);
const CENTERED = WORDS.map((w) => EMBEDDINGS[w].map((x, i) => x - MEAN[i]));
const PC1 = principal(CENTERED, null);
const PC2 = principal(CENTERED, PC1);

/** Projicerar en vektor till kartans två axlar. */
export function project(v: number[]): [number, number] {
  const c = v.map((x, i) => x - MEAN[i]);
  return [dot(c, PC1), dot(c, PC2)];
}
