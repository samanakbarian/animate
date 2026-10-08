// Vem är ”den”?: meningar där ett pronomen syftar på ett tidigare ord.
// I texten markerar [hakparentes] rätt ord och {klammer} pronomenet.
// `attn` är ett tänkt uppmärksamhetshuvud: hur mycket pronomenet ”tittar” på
// vissa ord. Resten av vikten delas lika mellan de andra orden före pronomenet.
// Huvudet är påhittat men typiskt; `headWrong` markerar meningar där det väljer fel.
// Förenkling: vikterna gäller när hela meningen är läst. I en språkmodell som skriver
// ett ord i taget kan pronomenet inte se ledtråden efter sig; det reds ut av senare ord
// (se Transformern, kapitlet ”Bara bakåt”).

import type { Rng } from '@nastasteg/engine/core/math';

export interface Item {
  text: string;
  attn: Record<string, number>;
  why: string;
  headWrong?: boolean;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  items: Item[];
}

export const LEVELS: Level[] = [
  {
    title: 'Grammatiken hjälper',
    goal: 'Klicka på ordet som det markerade ordet syftar på.',
    lesson: 'Ofta räcker grammatiken: en- och ett-ord, han och hon. Uppmärksamheten lär sig sådana mönster ur mängder av text.',
    items: [
      {
        text: '[Hunden] jagade bollen tills {den} blev trött.',
        attn: { Hunden: 0.58, bollen: 0.27 },
        why: 'En boll kan inte bli trött, men en hund kan.',
      },
      {
        text: '[Huset] bredvid kyrkan var gammalt, och {det} behövde målas.',
        attn: { Huset: 0.66, kyrkan: 0.12 },
        why: 'Det heter ”huset” men ”kyrkan”. ”Det” passar bara ett ett-ord.',
      },
      {
        text: 'Lisa gav [Omar] en bok eftersom {han} fyllde år.',
        attn: { Omar: 0.61, Lisa: 0.14, bok: 0.06 },
        why: '”Han” passar Omar.',
      },
      {
        text: 'Omar ringde [Lisa] eftersom {hon} hade glömt sin jacka.',
        attn: { Lisa: 0.63, Omar: 0.12 },
        why: '”Hon” passar Lisa.',
      },
      {
        text: 'Barnet tappade [glassen], och {den} smälte på marken.',
        attn: { glassen: 0.6, Barnet: 0.16 },
        why: 'Det heter ”barnet”, så ”den” måste vara glassen. Och glass smälter.',
      },
      {
        text: '[Tåget] passerade bron innan {det} stannade.',
        attn: { Tåget: 0.64, bron: 0.18 },
        why: '”Det” passar tåget, inte bron. Och det är tåg som stannar.',
      },
    ],
  },
  {
    title: 'Ett ord ändrar allt',
    goal: 'Meningarna kommer i par. Ett enda ord avgör vem pronomenet syftar på.',
    lesson: 'Här hjälper inte grammatiken. Man måste veta hur världen fungerar. Sådana meningar var länge svåra för språkmodeller.',
    items: [
      {
        text: '[Pokalen] fick inte plats i väskan eftersom {den} var för stor.',
        attn: { Pokalen: 0.52, väskan: 0.33 },
        why: 'Det som är för stort får inte plats. Alltså pokalen.',
      },
      {
        text: 'Pokalen fick inte plats i [väskan] eftersom {den} var för liten.',
        attn: { Pokalen: 0.46, väskan: 0.41 },
        why: 'Det som är för litet kan inte rymma något. Alltså väskan.',
        headWrong: true,
      },
      {
        text: '[Lådan] gick inte att lyfta upp på hyllan eftersom {den} var för tung.',
        attn: { Lådan: 0.55, hyllan: 0.3 },
        why: 'Man lyfter lådan, så det är lådan som är tung.',
      },
      {
        text: 'Lådan gick inte att lyfta upp på [hyllan] eftersom {den} satt för högt.',
        attn: { Lådan: 0.31, hyllan: 0.54 },
        why: 'Det är hyllan som sitter högt.',
      },
      {
        text: '[Politikerna] nekade demonstranterna tillstånd eftersom {de} var rädda för bråk.',
        attn: { Politikerna: 0.49, demonstranterna: 0.37 },
        why: 'De som nekar tillstånd är de som oroar sig.',
      },
      {
        text: 'Politikerna nekade [demonstranterna] tillstånd eftersom {de} ville ställa till bråk.',
        attn: { Politikerna: 0.47, demonstranterna: 0.4 },
        why: 'Den som vill ställa till bråk är den som nekas tillstånd.',
        headWrong: true,
      },
      {
        text: '[Fisken] åt masken eftersom {den} var hungrig.',
        attn: { Fisken: 0.57, masken: 0.28 },
        why: 'Den som äter är den som är hungrig.',
      },
      {
        text: 'Fisken åt [masken] eftersom {den} såg god ut.',
        attn: { Fisken: 0.34, masken: 0.5 },
        why: 'Det som äts är det som ser gott ut.',
      },
    ],
  },
  {
    title: 'Långt bort',
    goal: 'Ordet som pronomenet syftar på står längre bak i meningen.',
    lesson: 'Uppmärksamheten kan titta på alla ord samtidigt, hur långt bort de än står. Det var en stor skillnad mot äldre modeller.',
    items: [
      {
        text: 'Mormor köpte en ny [cykel] i våras, och trots regnet i går tog hon {den} till jobbet.',
        attn: { cykel: 0.55, regnet: 0.12, Mormor: 0.08 },
        why: 'Man tar cykeln till jobbet. Regnet är ett ett-ord.',
      },
      {
        text: '[Appen] som Sara laddade ner förra veckan har fått tre uppdateringar, men {den} kraschar fortfarande.',
        attn: { Appen: 0.52, veckan: 0.14, uppdateringar: 0.1 },
        why: 'Det är appen som kraschar, inte veckan.',
      },
      {
        text: 'När Ali och hans syster kom hem från skolan stod [middagen] redan på bordet, men {den} var kall.',
        attn: { middagen: 0.5, skolan: 0.15, syster: 0.07 },
        why: 'Middagen kan vara kall. ”Bordet” är ett ett-ord.',
      },
      {
        text: 'Forskarna tränade [modellen] i flera veckor på nya data, och till slut blev {den} mycket bättre.',
        attn: { modellen: 0.58, Forskarna: 0.1, data: 0.07 },
        why: 'Det är modellen som tränas och blir bättre.',
      },
      {
        text: '[Brevet] som låg under mattan i hallen hade legat där i flera år, men {det} gick fortfarande att läsa.',
        attn: { Brevet: 0.56, mattan: 0.1, hallen: 0.08 },
        why: 'Ett brev går att läsa, och ”det” passar brevet.',
      },
      {
        text: 'Eleverna frågade läraren om [provet], men hon ville inte säga något om {det}.',
        attn: { provet: 0.54, läraren: 0.14, Eleverna: 0.08 },
        why: 'Eleverna frågade om provet, och ”det” passar bara provet.',
      },
    ],
  },
];

export interface Parsed {
  /** Orden som de visas, med skiljetecken. */
  words: string[];
  answer: number;
  pronoun: number;
  /** Uppmärksamhet från pronomenet till varje ord före det (summa 1). */
  weights: number[];
  /** Ordet huvudet lade mest vikt på. */
  headPick: number;
}

/** Ordet utan skiljetecken och markeringar. */
export const bare = (w: string) => w.replace(/[[\]{}.,!?”“]/g, '');

export function parse(item: Item): Parsed {
  const raw = item.text.split(' ');
  const answer = raw.findIndex((w) => w.includes('['));
  const pronoun = raw.findIndex((w) => w.includes('{'));
  const words = raw.map((w) => w.replace(/[[\]{}]/g, ''));
  const named = new Map(Object.entries(item.attn));
  const before = words.slice(0, pronoun).map(bare);
  const used = new Set<string>();
  let sum = 0;
  for (const [k, v] of named) {
    if (before.includes(k)) {
      sum += v;
      used.add(k);
    }
  }
  const restN = before.filter((w) => !used.has(w)).length;
  const rest = restN ? (1 - sum) / restN : 0;
  const seen = new Set<string>();
  const weights = before.map((w) => {
    if (used.has(w) && !seen.has(w)) {
      seen.add(w);
      return named.get(w)!;
    }
    return used.has(w) ? 0 : rest;
  });
  let headPick = 0;
  weights.forEach((v, i) => {
    if (v > weights[headPick]) headPick = i;
  });
  return { words, answer, pronoun, weights, headPick };
}

export function shuffled(level: number, rng: Rng): Item[] {
  const items = [...LEVELS[level].items];
  // banan med par blandas inte: paren ska stå bredvid varandra
  if (level === 1) return items;
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export const starsFor = (right: number, total: number): 1 | 2 | 3 => (right === total ? 3 : right >= total - 2 ? 2 : 1);
