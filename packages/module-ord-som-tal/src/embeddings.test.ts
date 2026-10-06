import { describe, expect, it } from 'vitest';
import { ANALOGIES, EMBEDDINGS, LONG_WORDS, cosine, project, solve, tokenize } from './embeddings';

describe('tokenisering', () => {
  it('delar långa ord i kända bitar', () => {
    expect(tokenize('uppmärksamhet')).toEqual(['upp', 'märk', 'sam', 'het']);
    expect(tokenize('ordlistan')).toEqual(['ord', 'list', 'an']);
    for (const w of LONG_WORDS) expect(tokenize(w).join('')).toBe(w);
  });
});

describe('inbäddningar', () => {
  it('liknande ord ligger nära', () => {
    expect(cosine(EMBEDDINGS.kung, EMBEDDINGS.drottning)).toBeGreaterThan(cosine(EMBEDDINGS.kung, EMBEDDINGS.valp));
  });
  it('löser analogierna', () => {
    expect(ANALOGIES.map((a) => solve(a).answer)).toEqual(['drottning', 'flicka', 'kattunge', 'prinsessa']);
  });
  it('projicerar deterministiskt', () => {
    expect(project(EMBEDDINGS.kung)).toEqual(project(EMBEDDINGS.kung));
  });
});
