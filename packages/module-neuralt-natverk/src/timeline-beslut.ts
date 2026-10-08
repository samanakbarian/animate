// Del 1 – från hjärncell till ett beslut. Manus: kapitel och nyckelrutor.
// Först liknelsen med en nervcell (0–14 s), sedan ett vardagsbeslut. Ingen
// matematik i bild utom plus, minus och noll; planet och linjen kommer i del 2.

import { formatNumber } from '@nastasteg/engine/module/params';
import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';

export const DURATION_0 = 70;

/** Liknelsen med nervcellen pågår till BIO_END och tonar sedan över i beslutet. */
export const BIO_END = 14;
const D = BIO_END; // beslutsdelen börjar här

const one = (v: number) => formatNumber(v, 1);

export const PARAMS_0: ParamSpec[] = [
  { id: 'sun', label: 'Sol (0 = mulet, 1 = sol)', min: 0, max: 1, step: 0.1, default: 1, format: one },
  { id: 'homework', label: 'Läxor kvar (0 = inga, 1 = massor)', min: 0, max: 1, step: 0.1, default: 0, format: one },
  { id: 'wSun', label: 'Vikt för sol', min: -3, max: 3, step: 0.1, default: 2, format: one },
  { id: 'wHomework', label: 'Vikt för läxor', min: -3, max: 3, step: 0.1, default: -3, format: one },
  { id: 'b', label: 'Bias (hur sugen du är)', min: -3, max: 3, step: 0.1, default: -1, format: one },
];

export const CHAPTERS_0: Chapter[] = [
  {
    id: 'hjarnan',
    start: 0,
    title: 'Hjärnans nervceller',
    caption:
      'Hjärnan består av miljarder nervceller. En cell tar emot signaler från andra, och skickar själv en signal när de blir starka nog.',
  },
  {
    id: 'kopia',
    start: 7,
    title: 'En förenklad kopia',
    caption: 'En artificiell neuron härmar bara den idén, med tal: några tal in, en vikt för varje, en summa och en signal ut.',
  },
  {
    id: 'beslut',
    start: D,
    title: 'Ett beslut',
    caption: 'Ska du gå ut och spela fotboll? Du tänker på två saker: skiner solen, och har du läxor kvar?',
  },
  {
    id: 'vikter',
    start: D + 8,
    title: 'Vikter',
    caption: 'Sol ger pluspoäng och läxor ger minuspoäng. Hur mycket varje sak räknas kallas vikt.',
  },
  {
    id: 'summan',
    start: D + 20,
    title: 'Summan',
    caption: 'Lägg ihop poängen. Blir summan större än noll tänds lampan: ja, du går ut.',
  },
  {
    id: 'bias',
    start: D + 31,
    title: 'Bias',
    caption: 'Biasen är hur sugen du är från början. Höj den, så räcker det med lite sol.',
  },
  {
    id: 'neuron',
    start: D + 44,
    title: 'Det är en neuron',
    caption: 'Det är allt en neuron gör: väger ihop tal och tänds när summan blir över noll. I del 2 blir samma sak en karta.',
  },
];

export const EXPLORE_CAPTION_0 = 'Ändra sol, läxor, vikter och bias. Lampan tänds när summan blir större än noll.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

// Tiderna nedan räknas från beslutsdelens början.
const shift = (keys: Keyframe[]) => [k(0, keys[0].v), ...keys.map((x) => ({ ...x, t: x.t + D }))];

export const TRACKS_0: Partial<Record<string, Keyframe[]>> = {
  sun: shift([k(0, 1), k(22, 1), k(25, 0), k(28, 0), k(30, 1), k(31, 1), k(33, 0.4), k(44, 0.4), k(50, 1), k(56, 1)]),
  homework: shift([k(0, 0), k(10, 0), k(13, 1), k(18, 1), k(20, 0), k(31, 0), k(33, 0.3), k(44, 0.3), k(50, 0), k(56, 0)]),
  b: shift([k(0, -1), k(36, -1), k(40, 1.5), k(44, 1.5), k(50, -1), k(56, -1)]),
};
