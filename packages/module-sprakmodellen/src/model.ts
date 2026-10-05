// En pytteliten språkmodell: trigram-räkning med interpolation ner till
// bigram och unigram. Den gör samma sak som de stora modellerna – gissar
// nästa token – men räknar ordföljder i stället för att använda ett nätverk.
// Samplingen är seedad: (start, antal, temperatur, frö) ger alltid samma text.

import { hash2 } from '@nastasteg/engine/core/math';
import { CORPUS } from './corpus';

export const tokenize = (text: string): string[] => [...(text.toLowerCase().match(/[a-zåäö]+|[.,]/g) ?? [])];

export interface Model {
  vocab: string[];
  uni: Map<string, number>;
  bi: Map<string, Map<string, number>>;
  tri: Map<string, Map<string, number>>;
  total: number;
}

const bump = (m: Map<string, Map<string, number>>, ctx: string, next: string) => {
  let inner = m.get(ctx);
  if (!inner) m.set(ctx, (inner = new Map()));
  inner.set(next, (inner.get(next) ?? 0) + 1);
};

export function trainModel(text: string): Model {
  const toks = tokenize(text);
  const uni = new Map<string, number>();
  const bi = new Map<string, Map<string, number>>();
  const tri = new Map<string, Map<string, number>>();
  for (let i = 0; i < toks.length; i++) {
    uni.set(toks[i], (uni.get(toks[i]) ?? 0) + 1);
    if (i >= 1) bump(bi, toks[i - 1], toks[i]);
    if (i >= 2) bump(tri, `${toks[i - 2]} ${toks[i - 1]}`, toks[i]);
  }
  const vocab = [...uni.keys()].sort((a, b) => a.localeCompare(b, 'sv'));
  return { vocab, uni, bi, tri, total: toks.length };
}

export const MODEL = trainModel(CORPUS);

export interface Candidate {
  token: string;
  p: number;
}

const norm = (m: Map<string, number> | undefined) => {
  if (!m) return null;
  let s = 0;
  for (const v of m.values()) s += v;
  return { m, s };
};

/** Sannolikheter för nästa token givet de två senaste, med temperatur. Sorterad, störst först. */
export function nextDistribution(model: Model, context: readonly string[], temperature: number): Candidate[] {
  const a = context.at(-2),
    b = context.at(-1);
  const tri = a !== undefined && b !== undefined ? norm(model.tri.get(`${a} ${b}`)) : null;
  const bi = b !== undefined ? norm(model.bi.get(b)) : null;
  // vikter för interpolation: lita mest på den längsta kontext som finns
  const wt = tri ? 0.72 : 0,
    wb = bi ? (tri ? 0.25 : 0.95) : 0,
    wu = 1 - wt - wb;
  const T = Math.max(0.05, temperature);
  const out: Candidate[] = [];
  let sum = 0;
  for (const tok of model.vocab) {
    const p =
      wt * ((tri?.m.get(tok) ?? 0) / (tri?.s || 1)) +
      wb * ((bi?.m.get(tok) ?? 0) / (bi?.s || 1)) +
      wu * ((model.uni.get(tok) ?? 0) / model.total);
    const q = Math.pow(p, 1 / T);
    out.push({ token: tok, p: q });
    sum += q;
  }
  for (const c of out) c.p /= sum;
  // tiebreak på token gör sorteringen deterministisk
  return out.sort((x, y) => y.p - x.p || x.token.localeCompare(y.token, 'sv'));
}

/** Väljer en token ur fördelningen med ett deterministiskt ”slumptal” för (frö, steg). */
export function sample(dist: readonly Candidate[], seed: number, step: number): string {
  const u = hash2(seed * 7919 + 13, step * 104729 + 7);
  let acc = 0;
  for (const c of dist) {
    acc += c.p;
    if (u < acc) return c.token;
  }
  return dist[dist.length - 1].token;
}

export interface Generation {
  tokens: string[];
  /** Fördelningen inför varje steg (index = antal genererade tokens hittills). */
  dists: Candidate[][];
}

const cache = new Map<string, Generation>();

/** Genererar `count` tokens efter `prompt`. Cachad – samma argument ger samma resultat. */
export function generate(prompt: string, count: number, temperature: number, seed: number, model = MODEL): Generation {
  const key = `${prompt}|${count}|${temperature.toFixed(3)}|${seed}`;
  const hit = model === MODEL ? cache.get(key) : undefined;
  if (hit) return hit;
  const tokens = tokenize(prompt);
  const dists: Candidate[][] = [];
  for (let i = 0; i <= count; i++) {
    const d = nextDistribution(model, tokens, temperature);
    dists.push(d);
    if (i < count) tokens.push(sample(d, seed, i));
  }
  const g = { tokens, dists };
  if (model === MODEL) cache.set(key, g);
  return g;
}
