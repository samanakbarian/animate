// Del 2 – samma neuron som en karta. Manus: kapitel med berättartext och nyckelrutor.
// Ändra tider och texter här – scenen läser bara (t, params).

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';

export const DURATION = 64;

export const PARAMS: ParamSpec[] = [
  { id: 'x1', label: 'Insignal x₁', min: -1, max: 1, step: 0.01, default: 0.6 },
  { id: 'x2', label: 'Insignal x₂', min: -1, max: 1, step: 0.01, default: -0.3 },
  { id: 'w1', label: 'Vikt w₁', min: -2, max: 2, step: 0.01, default: 0.8 },
  { id: 'w2', label: 'Vikt w₂', min: -2, max: 2, step: 0.01, default: -0.5 },
  { id: 'b', label: 'Bias b', min: -2, max: 2, step: 0.01, default: 0 },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'neuron',
    start: 0,
    title: 'En neuron',
    caption: 'Samma neuron som i del 1. Nu heter insignalerna x₁ och x₂ och kan vara allt från −1 till 1.',
  },
  {
    id: 'vikter',
    start: 9,
    title: 'Vikter',
    caption: 'Varje insignal multipliceras med en vikt. Vikten avgör hur mycket signalen räknas, och om den drar uppåt eller nedåt.',
  },
  {
    id: 'bias',
    start: 23,
    title: 'Summa och bias',
    caption: 'Neuronen lägger ihop allt och lägger till biasen. Ju större summa, desto starkare tänds den, precis som lampan i del 1.',
  },
  {
    id: 'planet',
    start: 35,
    title: 'Hela planet',
    caption: 'Nu provar vi alla par av x₁ och x₂ på en gång. Varje punkt i rutan är ett par. Ljust betyder att neuronen tänds.',
  },
  {
    id: 'linjen',
    start: 50,
    title: 'En rak linje',
    caption: 'Den orange linjen är där summan är exakt noll. På den ljusa sidan tänds neuronen. Att lära sig är att flytta linjen rätt.',
  },
];

export const EXPLORE_CAPTION = 'Dra i vikterna och biasen och se gränsen flytta sig. Flytta insignalerna och se när neuronen tänds.';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

// Insignalerna går ett varv runt planet i kapitlet ”Hela planet”.
const circle = (fn: (a: number) => number, phase = 0) =>
  Array.from({ length: 13 }, (_, i) => k(35 + i, fn((i / 12) * Math.PI * 2 + phase) * 0.75, 'linear'));

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  x1: [k(0, 0.6), k(35, 0.6), ...circle(Math.cos).slice(1), k(50, 0.6), k(64, 0.6)],
  x2: [k(0, -0.3), k(35, -0.3), ...circle(Math.sin).slice(1), k(50, -0.3), k(64, -0.3)],
  w1: [k(0, 0.8), k(11, 0.8), k(15, -1.2), k(19, 1.5), k(23, 0.8), k(52, 0.8), k(57, 1.4), k(61, -0.6), k(64, 0.9)],
  w2: [k(0, -0.5), k(15, -0.5), k(20, 0.9), k(23, -0.5), k(52, -0.5), k(57, 0.6), k(61, 1.2), k(64, 0.7)],
  b: [k(0, 0), k(25, 0), k(29, -1.2), k(33, 0.9), k(35, 0), k(54, 0), k(60, 0.6), k(64, -0.2)],
};
