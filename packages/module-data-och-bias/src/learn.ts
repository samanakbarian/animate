// En liten bildsorterare: varg eller hund. Varje bild har två egenskaper som
// modellen ser – formen (tydligt varg > 0, tydligt hund < 0, men otydlig) och hur
// mycket snö som syns (0–1). Modellen är en neuron (logistisk regression) som
// tränas med gradientnedstigning. Allt är seedat och deterministiskt.
//
// Poängen: om vargarna i träningsdatan nästan alltid står i snö blir snön en
// genväg. Modellen lär sig ”snö = varg”, och en hund i snö blir fel.

import { Rng } from '@nastasteg/engine/core/math';

export interface Photo {
  /** Formen, −1 (tydlig hund) … 1 (tydlig varg). Ofta otydlig. */
  shape: number;
  /** Snö i bakgrunden, 0–1. */
  snow: number;
  wolf: boolean;
}

export interface Model {
  wShape: number;
  wSnow: number;
  b: number;
}

/**
 * Träningsbilder. `snowy` är andelen vargar som står i snö (och lika stor andel
 * hundar som står utan snö). 0,5 betyder att snön inte säger något.
 */
export function makePhotos(n: number, snowy: number, seed = 1): Photo[] {
  const rng = new Rng(seed);
  const out: Photo[] = [];
  for (let i = 0; i < n; i++) {
    const wolf = i % 2 === 0;
    // formen syns bara svagt: medel ±0,35 med brus
    const shape = (wolf ? 0.35 : -0.35) + (rng.next() - 0.5) * 0.9;
    const inSnow = rng.next() < (wolf ? snowy : 1 - snowy);
    const snow = inSnow ? 0.75 + rng.next() * 0.25 : rng.next() * 0.25;
    out.push({ shape: Math.max(-1, Math.min(1, shape)), snow, wolf });
  }
  return out;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
export const pWolf = (m: Model, p: Pick<Photo, 'shape' | 'snow'>) => sigmoid(m.wShape * p.shape + m.wSnow * (p.snow - 0.5) * 2 + m.b);

/** Tränar med gradientnedstigning, fast antal steg. */
export function train(photos: Photo[], steps = 400, lr = 0.5): Model {
  const m: Model = { wShape: 0, wSnow: 0, b: 0 };
  const n = Math.max(1, photos.length);
  for (let k = 0; k < steps; k++) {
    let gS = 0,
      gN = 0,
      gB = 0;
    for (const p of photos) {
      const e = pWolf(m, p) - (p.wolf ? 1 : 0);
      gS += e * p.shape;
      gN += e * (p.snow - 0.5) * 2;
      gB += e;
    }
    m.wShape -= (lr * gS) / n;
    m.wSnow -= (lr * gN) / n;
    m.b -= (lr * gB) / n;
  }
  return m;
}

export const accuracy = (m: Model, photos: Photo[]) =>
  photos.length ? photos.filter((p) => pWolf(m, p) > 0.5 === p.wolf).length / photos.length : 0;

/** Ett rättvist test: lika många djur med och utan snö, så att snön inte hjälper. */
export const fairTest = (n = 200) => makePhotos(n, 0.5, 99);

/** Bara de svåra fallen: hundar i snö och vargar på gräs. */
export const trickyTest = () => makePhotos(400, 0.5, 7).filter((p) => (p.wolf ? p.snow < 0.5 : p.snow > 0.5));

/** Hur stor del av beslutet snön står för (0–1). */
export const snowShare = (m: Model) => Math.abs(m.wSnow) / (Math.abs(m.wSnow) + Math.abs(m.wShape) * 0.35 + 1e-9);
