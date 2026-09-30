// Partitur – egen komposition i D-moll, 96 BPM. Ackordföljd Dm – B♭ – Gm – A
// (A-dur ger det mörka, harmoniska moll-draget). Allt är ren data: samma
// händelselista används av realtidsuppspelning, offline-rendering och bilden
// (strukturen pulserar på basens slag).

import { BAR, BEAT, BOUNDARIES } from '../timeline';
import { Rng } from '../core/math';

export const STEP16 = BEAT / 4;

export type Inst =
  | 'heart' | 'kick' | 'snare' | 'hat' | 'ohat' | 'bass' | 'pad' | 'lead' | 'crash' | 'glitch'
  | 'roll' | 'drone' | 'riser' | 'piano' | 'click' | 'fall' | 'hit' | 'boom' | 'sub'
  | 'clap' | 'stab' | 'shaker' | 'tom';

export interface NoteEvent {
  time: number;
  dur: number;
  inst: Inst;
  midi: number;
  vel: number;
  /** Fri parameter (t.ex. distorsion 0..1 eller filteröppning). */
  p?: number;
}

/** Ackord per takt: grundton (MIDI) och treklang. */
export const CHORDS = [
  { name: 'Dm', root: 38, pad: [50, 53, 57, 62], stab: [62, 65, 69] },
  { name: 'Bb', root: 34, pad: [46, 50, 53, 58], stab: [62, 65, 70] },
  { name: 'Gm', root: 43, pad: [43, 50, 55, 58], stab: [62, 67, 70] },
  { name: 'A', root: 45, pad: [45, 49, 52, 57], stab: [61, 64, 69] },
];
export const chordAt = (bar: number) => CHORDS[((bar % 4) + 4) % 4];

// Melodi – [startsteg (16-delar), längd, midi] per takt i en fyrtaktsfras.
type Phrase = [number, number, number][][];
// Ny krok: kortare, rytmiska fraser som slår mot trummorna.
const PHRASE_A: Phrase = [
  [[0, 2, 74], [3, 1, 74], [4, 2, 72], [6, 2, 69], [8, 3, 65], [11, 1, 67], [12, 4, 69]],
  [[0, 2, 70], [2, 2, 69], [4, 4, 65], [8, 2, 62], [10, 2, 65], [12, 4, 67]],
  [[0, 3, 67], [3, 1, 70], [4, 4, 74], [8, 2, 72], [10, 2, 70], [12, 2, 69], [14, 2, 67]],
  [[0, 3, 69], [3, 3, 73], [6, 2, 76], [8, 2, 74], [10, 2, 73], [12, 4, 69]],
];
const PHRASE_B: Phrase = [
  [[0, 2, 77], [2, 2, 76], [4, 4, 74], [8, 2, 69], [10, 2, 74], [12, 4, 77]],
  [[0, 3, 77], [3, 1, 74], [4, 4, 70], [8, 2, 74], [10, 2, 77], [12, 4, 76]],
  [[0, 2, 74], [2, 2, 70], [4, 4, 67], [8, 2, 70], [10, 2, 74], [12, 4, 79]],
  [[0, 3, 76], [3, 3, 73], [6, 2, 69], [8, 4, 76], [12, 4, 81]],
];

// Sektioner (taktnummer, inklusive start, exklusive slut).
export const SECTIONS = {
  intro: [0, 4],
  hats: [4, 6],
  groove: [6, 15],
  lead: [15, 30],
  lead8va: [30, 42],
  drop: [42, 46],
  heavy: [46, 51],
  silence: [51, 52],
  end: [52, 60],
} as const;

const inSec = (bar: number, s: readonly [number, number]) => bar >= s[0] && bar < s[1];

/** Tider då lampan i slutet klickar (tänds/släcks). Delas med bilden. */
// Udda antal växlingar → lampan är släckt efter sista klicket (137,25 s).
export const LAMP_TOGGLES = [135.0, 135.1, 135.32, 135.4, 135.95, 136.08, 136.55, 136.62, 137.25];
/** Lampan är tänd vid t? (före 135 tänd, sedan växlar den vid varje toggle.) */
export function lampOn(t: number): boolean {
  let on = true;
  for (const x of LAMP_TOGGLES) if (t >= x) on = !on;
  return on;
}

let cache: NoteEvent[] | null = null;

export function buildScore(): NoteEvent[] {
  if (cache) return cache;
  const ev: NoteEvent[] = [];
  const rng = new Rng(1996);
  const push = (e: NoteEvent) => ev.push(e);

  for (let bar = 0; bar < 60; bar++) {
    const t0 = bar * BAR;
    const ch = chordAt(bar);
    const s16 = (i: number) => t0 + i * STEP16;

    // --- Hjärtslag (intro): mjuk dubbelkick, "lubb-dubb" varannan taktdel.
    if (inSec(bar, SECTIONS.intro) || inSec(bar, SECTIONS.hats)) {
      for (const b of [0, 2]) {
        push({ time: t0 + b * BEAT, dur: 0.3, inst: 'heart', midi: 0, vel: 0.9 });
        push({ time: t0 + b * BEAT + 0.19, dur: 0.3, inst: 'heart', midi: 0, vel: 0.6 });
      }
    }

    // --- Pad: hela vägen fram till droppet.
    if (bar < 42) {
      const v = bar < 4 ? 0.55 + bar * 0.08 : 0.8;
      push({ time: t0, dur: BAR + 0.4, inst: 'pad', midi: 0, vel: v, p: bar });
    }

    // --- Hi-hats
    if (inSec(bar, SECTIONS.hats)) {
      for (let i = 2; i < 16; i += 4) push({ time: s16(i), dur: 0.05, inst: 'hat', midi: 0, vel: 0.35 });
    }
    const drums = inSec(bar, SECTIONS.groove) || inSec(bar, SECTIONS.lead) || inSec(bar, SECTIONS.lead8va) || inSec(bar, SECTIONS.heavy);
    if (drums) {
      const heavy = inSec(bar, SECTIONS.heavy);
      const late = inSec(bar, SECTIONS.lead8va);
      const sixteenth = late || heavy;
      const roll = bar === 41;
      const fill = !roll && bar % 4 === 3 && bar > 6;
      // Breakbeat: kick 1, "och" efter 2, 3, "e" efter 3 – tyngre och tätare i det tunga partiet.
      const kicks = heavy ? [0, 3, 6, 8, 10, 11] : late ? [0, 3, 8, 10, 11] : [0, 8, 10];
      if (!roll) for (const k of kicks) if (!(fill && k > 11)) push({ time: s16(k), dur: 0.3, inst: 'kick', midi: 0, vel: k === 0 || k === 8 ? 1 : 0.8, p: heavy ? 1 : 0 });
      if (!roll) {
        for (const sn of [4, 12]) {
          if (fill && sn === 12) continue;
          push({ time: s16(sn), dur: 0.3, inst: 'snare', midi: 0, vel: 1, p: heavy ? 1 : 0 });
          if (bar >= 15) push({ time: s16(sn), dur: 0.2, inst: 'clap', midi: 0, vel: heavy ? 0.9 : 0.7 });
        }
        // spökslag
        push({ time: s16(7), dur: 0.1, inst: 'snare', midi: 0, vel: 0.28, p: 0 });
        if (!fill) push({ time: s16(15), dur: 0.1, inst: 'snare', midi: 0, vel: 0.22, p: 0 });
        const step = sixteenth ? 1 : 2;
        for (let i = 0; i < 16; i += step) {
          if (fill && i >= 12) break;
          const open = i === 6 || i === 14;
          const accent = i % 4 === 2 ? 1 : i % 2 ? 0.45 : 0.7;
          push({ time: s16(i), dur: open ? 0.22 : 0.04, inst: open ? 'ohat' : 'hat', midi: 0, vel: 0.5 * accent * (0.85 + rng.next() * 0.3) });
        }
        if (!sixteenth) for (let i = 1; i < 16; i += 2) push({ time: s16(i), dur: 0.05, inst: 'shaker', midi: 0, vel: 0.25 + rng.next() * 0.1 });
        // Trumvirvel/tom-fill sista taktdelen i var fjärde takt.
        if (fill) {
          [[12, 0], [13, 0], [14, 1], [15, 2]].forEach(([st, k], j) => push({ time: s16(st), dur: 0.25, inst: 'tom', midi: [50, 45, 41][k], vel: 0.75 + j * 0.08 }));
          push({ time: s16(14.5), dur: 0.1, inst: 'snare', midi: 0, vel: 0.55, p: 0 });
        }
      }
      if (roll) {
        // Virvelrullning som bygger upp mot droppet.
        for (let i = 0; i < 32; i++) {
          const k = i / 32;
          push({ time: t0 + k * BAR, dur: 0.12, inst: 'roll', midi: 0, vel: 0.25 + 0.75 * k * k });
        }
        push({ time: t0 + BAR * 0.5, dur: BAR * 0.5, inst: 'riser', midi: 0, vel: 0.5, p: 0 });
      }
      if (bar % 4 === 0 && bar > 6) push({ time: t0, dur: 2.5, inst: 'crash', midi: 0, vel: heavy ? 0.8 : 0.55 });
    }

    // --- Bas: kort och studsande, i ett högre register (mindre dån).
    if (inSec(bar, SECTIONS.hats)) {
      for (const i of [0, 3, 8, 11]) push({ time: s16(i), dur: STEP16 * 1.5, inst: 'bass', midi: ch.root, vel: 0.6, p: 0.1 });
    }
    if (drums && bar !== 41) {
      const heavy = inSec(bar, SECTIONS.heavy);
      const pat: [number, number, number][] = [[0, 2, 0], [3, 1, 0], [6, 2, 12], [8, 2, 0], [11, 1, 0], [12, 2, 7], [14, 2, 12]];
      for (const [i, len, iv] of pat) push({ time: s16(i), dur: STEP16 * len * 0.8, inst: 'bass', midi: ch.root + iv, vel: 0.8, p: heavy ? 0.9 : 0.3 + 0.3 * Math.min(1, (bar - 6) / 30) });
    }

    // --- Ackordstötar: distade, korta – ger slagkraft mellan trumslagen.
    if (drums && bar !== 41 && bar >= 10) {
      const heavy = inSec(bar, SECTIONS.heavy);
      const hits = heavy ? [0, 3, 6, 10, 12] : bar >= 30 ? [0, 6, 10] : [0, 10];
      for (const h of hits) push({ time: s16(h), dur: 0.2, inst: 'stab', midi: 0, vel: heavy ? 0.9 : 0.7, p: bar });
    }

    // --- Lead: ren → alltmer distad; en oktav upp från takt 30.
    if ((inSec(bar, SECTIONS.lead) || inSec(bar, SECTIONS.lead8va) || inSec(bar, SECTIONS.heavy)) && bar !== 41) {
      const phraseBar = bar - 15;
      const phrase = Math.floor(phraseBar / 4) % 2 === 0 ? PHRASE_A : PHRASE_B;
      const notes = phrase[((phraseBar % 4) + 4) % 4];
      const oct = bar >= 30 ? 12 : 0;
      let drive = Math.min(1, Math.max(0, (bar - 15) / 14));
      if (bar >= 30) drive = 0.8 + 0.2 * Math.min(1, (bar - 30) / 11);
      if (inSec(bar, SECTIONS.heavy)) drive = 1;
      for (const [st, len, m] of notes) push({ time: s16(st), dur: len * STEP16 * 0.92, inst: 'lead', midi: m + oct, vel: 0.8, p: drive });
    }

    // --- Droppet: djup drone med filter som öppnas, sedan en riser.
    if (bar === 42) {
      push({ time: t0, dur: 4 * BAR + 0.3, inst: 'drone', midi: 26, vel: 1, p: 0 });
      push({ time: t0, dur: 0.1, inst: 'boom', midi: 0, vel: 0.9 });
    }
    if (bar === 44) push({ time: t0, dur: 2 * BAR, inst: 'riser', midi: 0, vel: 1, p: 1 });
    if (bar === 46) push({ time: t0, dur: 3, inst: 'crash', midi: 0, vel: 1 });

    // --- Slutet: låga, dissonanta pianotoner och en svag drone.
    if (bar === 52) push({ time: t0, dur: 8 * BAR, inst: 'drone', midi: 26, vel: 0.35, p: -1 });
    if (inSec(bar, SECTIONS.end) && bar < 58) {
      const clusters: number[][] = [[38, 39, 45], [34, 40], [31, 38, 44], [33, 39, 46], [38, 44], [34, 35, 41], [31, 37], [26, 33, 39]];
      const cl = clusters[bar - 52];
      cl.forEach((m, i) => push({ time: t0 + 0.05 + i * 0.37 + (bar % 2) * 0.6, dur: 3.5, inst: 'piano', midi: m, vel: 0.55 - i * 0.1 }));
      if (bar % 2 === 1) push({ time: t0 + 1.7, dur: 3, inst: 'piano', midi: 57 + ((bar * 5) % 7) - 3, vel: 0.22 });
    }
  }

  // Glitch-ljud och cymbal vid varje stegbyte (utom hårda klippet till slutet).
  for (const b of BOUNDARIES) {
    if (b >= 130) continue;
    push({ time: b - 0.12, dur: 0.45, inst: 'glitch', midi: 0, vel: 0.8, p: b });
    push({ time: b, dur: 2.2, inst: 'crash', midi: 0, vel: 0.45 });
  }
  // Blixten vid 108.
  push({ time: 108, dur: 3.5, inst: 'boom', midi: 0, vel: 1.2 });
  push({ time: 108, dur: 3, inst: 'crash', midi: 0, vel: 0.9 });
  // Lampklick.
  for (const x of LAMP_TOGGLES) push({ time: x, dur: 0.03, inst: 'click', midi: 0, vel: 0.9 });
  // Vit puls + fallande ton när stenfiguren vittrar.
  push({ time: 143, dur: 3.2, inst: 'fall', midi: 62, vel: 0.8 });
  // Dovt slutslag vid svart.
  push({ time: 147.5, dur: 4, inst: 'hit', midi: 0, vel: 1 });

  ev.sort((a, b) => a.time - b.time);
  cache = ev;
  return ev;
}

let kickTimes: number[] | null = null;
/** Hur hårt basen/kicken slår just nu (0..1) – används för strukturens puls. */
export function bassPulse(t: number): number {
  if (!kickTimes) kickTimes = buildScore().filter((e) => e.inst === 'kick' || e.inst === 'boom').map((e) => e.time);
  // binärsökning efter senaste kick ≤ t
  let lo = 0, hi = kickTimes.length - 1, last = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (kickTimes[mid] <= t) {
      last = kickTimes[mid];
      lo = mid + 1;
    } else hi = mid - 1;
  }
  let p = last < 0 ? 0 : Math.exp(-(t - last) * 7);
  // Under droppet: långsam andning i takt.
  if (t >= 105 && t < 115) p = Math.max(p * 0.5, 0.35 * Math.pow(0.5 + 0.5 * Math.cos(((t - 105) / BEAT) * Math.PI), 3));
  return p;
}
