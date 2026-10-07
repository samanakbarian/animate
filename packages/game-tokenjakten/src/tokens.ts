// Tokenjakten: spelaren klipper ord i bitar (tokens). En bit är giltig om den
// finns i banans ordförråd eller är ett enda tecken – precis som i en riktig
// tokeniserare finns alltid enskilda tecken som reserv. Rätt svar är en
// uppdelning med så få bitar som möjligt.

import { hash2, type Rng } from '@nastasteg/engine/core/math';

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  /** Bitar längre än ett tecken som tokeniseraren känner till. Mellanslag ingår i biten. */
  vocab: string[];
  words: string[];
}

export const LEVELS: Level[] = [
  {
    title: 'Ordbitar',
    goal: 'Klipp orden i så få bitar som möjligt. Bara bitar ur listan, eller enstaka bokstäver.',
    lesson: 'Vanliga ordbitar blir egna tokens. Därför kan modellen hantera ord den aldrig sett i sin helhet.',
    vocab: ['hund', 'katt', 'sol', 'sken', 'tåg', 'bil', 'ar', 'er', 'en', 'et'],
    words: ['hundar', 'solsken', 'tåget', 'bilen', 'katter', 'hunden'],
  },
  {
    title: 'Sammansatta ord',
    goal: 'Svenska bygger långa ord av korta. Hur få bitar räcker?',
    lesson: 'Långa sammansatta ord blir flera tokens. Det är en anledning till att svensk text ofta kostar fler tokens än engelsk.',
    vocab: ['sjuk', 'hus', 'köks', 'bord', 'skol', 'gård', 'fot', 'boll', 'plan', 'choklad', 'kaka', 'lek', 'plats'],
    words: ['sjukhus', 'köksbord', 'skolgård', 'fotbollsplan', 'chokladkaka', 'lekplats'],
  },
  {
    title: 'Mellanslag',
    goal: 'Mellanslaget hör till ordet efter. Klipp meningarna i så få bitar som möjligt.',
    lesson: 'Modellen läser inte ord utan tokens, och mellanslaget följer ofta med ordet efter. ”hund” och ” hund” är två olika tokens.',
    vocab: ['jag', ' är', ' här', 'en', ' liten', ' hund', 'vi', ' ses', ' snart', 'det', ' var', ' en', ' gång', 'hon', ' läser'],
    words: ['jag är här', 'en liten hund', 'vi ses snart', 'det var en gång', 'hon läser'],
  },
  {
    title: 'Siffror och stavfel',
    goal: 'Tal och felstavade ord. Här räcker ordförrådet inte alltid till.',
    lesson: 'Tal och stavfel faller sönder i många små bitar. Det är en orsak till att språkmodeller kan räkna och stava konstigt.',
    vocab: ['202', '100', '000', '365', 'hej', 'san', 'aa', 'an', 'mjölk', 'mj', 'lk'],
    words: ['2026', '100000', '365', 'hejsan', 'hejsaaan', 'mjölk', 'mjöölk'],
  },
];

/** Bitarna som klippen ger. `cuts[i]` betyder klipp efter tecken i. */
export function pieces(word: string, cuts: readonly boolean[]): string[] {
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < word.length - 1; i++) {
    if (cuts[i]) {
      out.push(word.slice(start, i + 1));
      start = i + 1;
    }
  }
  out.push(word.slice(start));
  return out;
}

export const isToken = (piece: string, vocab: readonly string[]) => [...piece].length === 1 || vocab.includes(piece);

/** En uppdelning med så få giltiga bitar som möjligt (dynamisk programmering). */
export function bestSplit(word: string, vocab: readonly string[]): string[] {
  const n = word.length;
  const best: number[] = new Array(n + 1).fill(Infinity);
  const from: number[] = new Array(n + 1).fill(-1);
  best[0] = 0;
  for (let end = 1; end <= n; end++) {
    for (let start = 0; start < end; start++) {
      if (best[start] + 1 < best[end] && isToken(word.slice(start, end), vocab)) {
        best[end] = best[start] + 1;
        from[end] = start;
      }
    }
  }
  const out: string[] = [];
  for (let end = n; end > 0; end = from[end]) out.unshift(word.slice(from[end], end));
  return out;
}

export type Verdict = 'right' | 'invalid' | 'too-many';

export function judge(word: string, cuts: readonly boolean[], vocab: readonly string[]): Verdict {
  const p = pieces(word, cuts);
  if (!p.every((x) => isToken(x, vocab))) return 'invalid';
  return p.length === bestSplit(word, vocab).length ? 'right' : 'too-many';
}

/** Ett påhittat men fast token-id, som det nummer modellen faktiskt ser. */
export function tokenId(piece: string): number {
  let h = 0;
  for (const ch of piece) h = Math.floor(hash2(h, ch.codePointAt(0)!) * 2147483647);
  return 100 + (h % 49900);
}

export function shuffled(level: number, rng: Rng): string[] {
  const words = [...LEVELS[level].words];
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
}

export const starsFor = (right: number, total: number): 1 | 2 | 3 => (right === total ? 3 : right >= total - 2 ? 2 : 1);
