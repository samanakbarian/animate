// Partitur – egen komposition i D-moll, 96 BPM. Ackordföljd Dm – B♭ – Gm – A
// (A-dur ger det mörka, harmoniska moll-draget). Allt är ren data: samma
// händelselista används av realtidsuppspelning, offline-rendering och bilden
// (strukturen pulserar på basens slag).

import { BAR, BEAT, BOUNDARIES } from '../timeline';
import { Rng } from '../core/math';

export const STEP16 = BEAT / 4;

export type Inst =
  | 'heart' | 'kick' | 'snare' | 'hat' | 'ohat' | 'bass' | 'pad' | 'lead' | 'crash' | 'glitch'
  | 'roll' | 'drone' | 'riser' | 'piano' | 'click' | 'fall' | 'hit' | 'boom' | 'sub';

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
  { name: 'Dm', root: 38, pad: [50, 53, 57, 62] },
  { name: 'Bb', root: 34, pad: [46, 50, 53, 58] },
  { name: 'Gm', root: 31, pad: [43, 50, 55, 58] },
  { name: 'A', root: 33, pad: [45, 49, 52, 57] },
];
export const chordAt = (bar: number) => CHORDS[((bar % 4) + 4) % 4];

// Melodi – [startsteg (16-delar), längd, midi] per takt i en fyrtaktsfras.
type Phrase = [number, number, number][][];
const PHRASE_A: Phrase = [
  [[0, 6, 69], [6, 2, 65], [8, 2, 67], [10, 4, 69], [14, 2, 74]],
  [[0, 4, 74], [4, 2, 72], [6, 2, 70], [8, 8, 65]],
  [[0, 4, 67], [4, 2, 70], [6, 2, 69], [8, 4, 67], [12, 4, 62]],
  [[0, 6, 64], [6, 2, 65], [8, 2, 67], [10, 2, 69], [12, 4, 73]],
];
const PHRASE_B: Phrase = [
  [[0, 6, 74], [6, 2, 76], [8, 4, 77], [12, 2, 76], [14, 2, 74]],
  [[0, 2, 74], [2, 2, 72], [4, 4, 70], [8, 4, 69], [12, 4, 65]],
  [[0, 6, 67], [6, 2, 69], [8, 4, 70], [12, 4, 74]],
  [[0, 8, 73], [8, 4, 76], [12, 4, 69]],
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
      const sixteenth = inSec(bar, SECTIONS.lead8va) || heavy;
      const roll = bar === 41;
      // Kick: stor, trög big beat – 1, "och" före 3, 3 (+ extra i det tunga partiet)
      const kicks = heavy ? [0, 7, 8, 10, 14] : [0, 7, 10];
      if (!roll) for (const k of kicks) push({ time: s16(k), dur: 0.4, inst: 'kick', midi: 0, vel: k === 0 ? 1 : 0.85, p: heavy ? 1 : 0 });
      if (!roll) for (const s of [4, 12]) push({ time: s16(s), dur: 0.35, inst: 'snare', midi: 0, vel: 1, p: heavy ? 1 : 0 });
      if (!roll) {
        const step = sixteenth ? 1 : 2;
        for (let i = 0; i < 16; i += step) {
          const open = !sixteenth && (i === 6 || i === 14);
          const accent = i % 4 === 2 ? 1 : 0.6;
          push({ time: s16(i), dur: open ? 0.25 : 0.05, inst: open ? 'ohat' : 'hat', midi: 0, vel: (sixteenth ? 0.4 : 0.5) * accent * (0.85 + rng.next() * 0.3) });
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
      if (bar % 4 === 0 && bar > 6) push({ time: t0, dur: 2.5, inst: 'crash', midi: 0, vel: heavy ? 0.8 : 0.5 });
    }

    // --- Bas
    if (inSec(bar, SECTIONS.hats)) {
      for (const i of [0, 6, 8, 14]) push({ time: s16(i), dur: STEP16 * 2, inst: 'bass', midi: ch.root, vel: 0.7, p: 0.1 });
    }
    if (drums && bar !== 41) {
      const heavy = inSec(bar, SECTIONS.heavy);
      const pat: [number, number, number][] = [[0, 3, 0], [3, 2, 0], [6, 2, 12], [8, 2, 0], [10, 2, 0], [12, 2, 7], [14, 2, 10]];
      for (const [i, len, iv] of pat) push({ time: s16(i), dur: STEP16 * len * 0.95, inst: 'bass', midi: ch.root + iv, vel: 0.85, p: heavy ? 1 : 0.35 + 0.25 * Math.min(1, (bar - 6) / 30) });
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
    if (inSec(bar, SECTIONS.heavy)) push({ time: t0, dur: BAR, inst: 'sub', midi: ch.root - 12, vel: 0.8 });

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
