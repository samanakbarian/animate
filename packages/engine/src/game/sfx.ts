// Korta ljudeffekter för spelen (rätt, fel, tick, klar bana). Syntas direkt med
// Web Audio. AudioContext skapas först vid första ljudet efter ett klick.

import type { Sound } from './types';

let ctx: AudioContext | null = null;

const NOTES: Record<Sound, [number, number, number][]> = {
  // [frekvens, start, längd]
  ok: [
    [660, 0, 0.12],
    [880, 0.08, 0.18],
  ],
  bad: [
    [220, 0, 0.18],
    [180, 0.1, 0.22],
  ],
  tick: [[1200, 0, 0.04]],
  win: [
    [523, 0, 0.18],
    [659, 0.12, 0.18],
    [784, 0.24, 0.18],
    [1047, 0.36, 0.4],
  ],
};

export function playSound(kind: Sound, volume = 0.18) {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    const now = ctx.currentTime + 0.01;
    for (const [f, t0, d] of NOTES[kind]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = kind === 'bad' ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now + t0);
      g.gain.exponentialRampToValueAtTime(volume, now + t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t0 + d);
      o.connect(g).connect(ctx.destination);
      o.start(now + t0);
      o.stop(now + t0 + d + 0.05);
    }
  } catch {
    // inget ljud tillgängligt
  }
}
