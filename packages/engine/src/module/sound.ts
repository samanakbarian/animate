// Ljud för modulerna: ett lugnt, syntat partitur som räknas fram ur modulens
// id och kapitel (ackord, glesa pianotoner och en klang vid varje nytt kapitel),
// och en liten styrning som spelar det i takt med filmen. Ljudet hörs bara när
// filmen spelar – i utforskaläget och vid paus är det tyst.

import { Rng } from '../core/math';
import { AudioEngine } from '../audio/engine';
import type { NoteEvent, Score } from '../audio/types';
import type { ModuleDefinition } from './types';

/** Ackordföljder (MIDI) – en väljs per modul. Fyra ackord, ett per takt. */
const PROGRESSIONS: number[][][] = [
  [
    [50, 57, 62, 66],
    [47, 54, 59, 62],
    [43, 50, 55, 59],
    [45, 52, 57, 61],
  ],
  [
    [53, 57, 60, 65],
    [50, 57, 62, 65],
    [46, 53, 58, 62],
    [48, 55, 60, 64],
  ],
  [
    [45, 52, 57, 60],
    [41, 48, 53, 57],
    [48, 52, 55, 60],
    [43, 50, 55, 59],
  ],
  [
    [48, 55, 60, 64],
    [45, 52, 57, 60],
    [41, 48, 53, 57],
    [43, 50, 55, 62],
  ],
];

export const BAR = 4;

const seedOf = (id: string) => [...id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/** Modulens partitur. Ren funktion av definitionen. */
export function moduleScore(def: Pick<ModuleDefinition, 'id' | 'duration' | 'chapters'>): Score {
  const seed = seedOf(def.id);
  const prog = PROGRESSIONS[Math.abs(seed) % PROGRESSIONS.length];
  const rng = new Rng(seed);
  const events: NoteEvent[] = [];
  const bars = Math.ceil(def.duration / BAR);
  for (let b = 0; b < bars; b++) {
    const t0 = b * BAR;
    const chord = prog[b % prog.length];
    events.push({ time: t0, dur: Math.min(BAR + 0.6, def.duration - t0), inst: 'pad', midi: 0, vel: 0.5, p: b, notes: chord });
    // två eller tre pianotoner ur ackordet, en oktav upp
    const n = 2 + (rng.next() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const at = t0 + 0.5 + i * (BAR / n) + rng.range(0, 0.3);
      if (at > def.duration - 1) break;
      events.push({ time: at, dur: 2.6, inst: 'piano', midi: rng.pick(chord.slice(1)) + 12, vel: rng.range(0.16, 0.26) });
    }
  }
  // klang vid varje kapitel
  for (const ch of def.chapters) {
    const chord = prog[Math.floor(ch.start / BAR) % prog.length];
    events.push({ time: ch.start + 0.05, dur: 3, inst: 'piano', midi: chord[0] + 24, vel: 0.24 });
    events.push({ time: ch.start + 0.2, dur: 3, inst: 'piano', midi: chord[2] + 24, vel: 0.18 });
  }
  events.sort((a, b) => a.time - b.time);
  return { events, duration: def.duration };
}

const PREF = 'ns-module-sound';

function readPref(): boolean {
  try {
    return localStorage.getItem(PREF) !== 'off';
  } catch {
    return true;
  }
}

function writePref(on: boolean) {
  try {
    localStorage.setItem(PREF, on ? 'on' : 'off');
  } catch {
    // privat läge eller blockerad lagring – valet gäller bara den här sidan
  }
}

/** Spelar en moduls partitur i takt med filmens tid. */
export class ModuleSound {
  private ctx: AudioContext | null = null;
  private engine: AudioEngine | null = null;
  private readonly score: Score;
  private lastT = 0;
  private lastCtx = 0;
  enabled = readPref();

  constructor(def: ModuleDefinition) {
    this.score = moduleScore(def);
  }

  /** Anropas från ett klick: webbläsare tillåter bara ljud efter en användarhandling. */
  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return;
      }
    }
    void this.ctx.resume();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    writePref(on);
    if (on) this.unlock();
    else this.stop();
  }

  /** Anropas varje bildruta. */
  update(t: number, playing: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || !playing || ctx.state !== 'running') return this.stop();
    if (this.engine) {
      // hopp i tiden (sökning) → börja om från den nya tiden
      const expected = this.lastT + (ctx.currentTime - this.lastCtx);
      if (Math.abs(expected - t) > 0.25) this.stop();
    }
    if (!this.engine) {
      this.engine = new AudioEngine(ctx, this.score);
      this.engine.master.gain.value = 0.6;
      this.engine.begin(t, ctx.currentTime + 0.05);
    }
    this.lastT = t;
    this.lastCtx = ctx.currentTime;
    this.engine.scheduleUntil(t + 0.5);
  }

  /** Tonar ut och släpper motorn. */
  stop() {
    if (!this.engine || !this.ctx) return;
    const g = this.engine.master.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.15);
    this.engine = null;
  }

  dispose() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }
}
