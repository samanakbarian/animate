// Rena funktioner: parametervärden och kapitel som funktion av t.

import { clamp, smootherstep } from '../core/math';
import type { Chapter, Keyframe, ModuleDefinition, ParamSpec, Params } from './types';

export function evaluateTrack(keys: readonly Keyframe[] | undefined, t: number, fallback: number): number {
  if (!keys || keys.length === 0) return fallback;
  if (t <= keys[0].t) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i];
    if (t < b.t) {
      const a = keys[i - 1];
      const k = (t - a.t) / (b.t - a.t);
      switch (b.ease ?? 'smooth') {
        case 'hold':
          return a.v;
        case 'linear':
          return a.v + (b.v - a.v) * k;
        default:
          return a.v + (b.v - a.v) * smootherstep(0, 1, k);
      }
    }
  }
  return keys[keys.length - 1].v;
}

export function evaluateParams(def: Pick<ModuleDefinition, 'params' | 'tracks'>, t: number): Params {
  const out: Params = {};
  for (const p of def.params) out[p.id] = evaluateTrack(def.tracks[p.id], t, p.default);
  return out;
}

export function clampParam(spec: ParamSpec, v: number): number {
  const stepped = Math.round((v - spec.min) / spec.step) * spec.step + spec.min;
  return clamp(Number(stepped.toFixed(6)), spec.min, spec.max);
}

export function chapterIndexAt(chapters: readonly Chapter[], t: number): number {
  let idx = 0;
  for (let i = 0; i < chapters.length; i++) if (t >= chapters[i].start) idx = i;
  return idx;
}

export const formatNumber = (v: number, decimals = 2) => v.toFixed(decimals).replace('-', '−').replace('.', ',');
