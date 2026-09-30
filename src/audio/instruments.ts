// Syntade instrument (Web Audio API). Inga samplingar – allt genereras i kod.
// Slumpmässiga detaljer (brus, glitch) använder seedade generatorer.

import { Rng } from '../core/math';
import type { NoteEvent } from './score';

export const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export interface Bus {
  ctx: BaseAudioContext;
  drums: AudioNode;
  music: AudioNode;
  fx: AudioNode;
  reverb: AudioNode; // send
  delay: AudioNode; // send
  noise: AudioBuffer;
  curve: (amount: number) => Float32Array<ArrayBuffer>;
}

function env(g: AudioParam, when: number, a: number, peak: number, d: number, sustain = 0, rel = 0.05, dur = 0) {
  g.setValueAtTime(0.0001, when);
  g.linearRampToValueAtTime(peak, when + a);
  if (dur > 0) {
    g.setTargetAtTime(Math.max(sustain, 0.0001), when + a, d / 3);
    g.setValueAtTime(Math.max(sustain, 0.0001), when + Math.max(a, dur));
    g.exponentialRampToValueAtTime(0.0001, when + Math.max(a, dur) + rel);
  } else {
    g.exponentialRampToValueAtTime(0.0001, when + a + d);
  }
}

function noiseSrc(b: Bus, when: number, dur: number, offset = 0): AudioBufferSourceNode {
  const s = b.ctx.createBufferSource();
  s.buffer = b.noise;
  s.loop = true;
  s.start(when, offset % (b.noise.duration - 0.01));
  s.stop(when + dur + 0.05);
  return s;
}

function gainNode(b: Bus, v = 1) {
  const g = b.ctx.createGain();
  g.gain.value = v;
  return g;
}

function filter(b: Bus, type: BiquadFilterType, f: number, q = 0.7) {
  const n = b.ctx.createBiquadFilter();
  n.type = type;
  n.frequency.value = f;
  n.Q.value = q;
  return n;
}

function send(b: Bus, node: AudioNode, rev: number, del = 0) {
  if (rev > 0) {
    const g = gainNode(b, rev);
    node.connect(g).connect(b.reverb);
  }
  if (del > 0) {
    const g = gainNode(b, del);
    node.connect(g).connect(b.delay);
  }
}

export function play(b: Bus, e: NoteEvent, when: number) {
  const ctx = b.ctx;
  const v = e.vel;
  switch (e.inst) {
    case 'heart': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(62, when);
      o.frequency.exponentialRampToValueAtTime(38, when + 0.18);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.008, 0.9 * v, 0.28);
      const lp = filter(b, 'lowpass', 180);
      o.connect(lp).connect(g).connect(b.drums);
      send(b, g, 0.15);
      o.start(when);
      o.stop(when + 0.4);
      break;
    }
    case 'kick': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(e.p ? 150 : 128, when);
      o.frequency.exponentialRampToValueAtTime(42, when + 0.11);
      o.frequency.exponentialRampToValueAtTime(36, when + 0.4);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.003, 1.05 * v, 0.5);
      let out: AudioNode = g;
      if (e.p) {
        const ws = ctx.createWaveShaper();
        ws.curve = b.curve(0.6);
        g.connect(ws);
        const post = gainNode(b, 0.7);
        ws.connect(post);
        out = post;
      }
      o.connect(g);
      out.connect(b.drums);
      // klick
      const n = noiseSrc(b, when, 0.02, when * 3.1);
      const hp = filter(b, 'highpass', 3000);
      const ng = gainNode(b, 0);
      env(ng.gain, when, 0.001, 0.22 * v, 0.018);
      n.connect(hp).connect(ng).connect(b.drums);
      o.start(when);
      o.stop(when + 0.6);
      break;
    }
    case 'snare':
    case 'roll': {
      const big = e.inst === 'snare';
      const n = noiseSrc(b, when, 0.5, when * 1.7);
      const bp = filter(b, 'bandpass', big ? 1900 : 2400, 0.6);
      const hp = filter(b, 'highpass', 700);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.002, (big ? 0.75 : 0.45) * v, big ? 0.24 : 0.09);
      n.connect(bp).connect(hp).connect(g);
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(210, when);
      o.frequency.exponentialRampToValueAtTime(150, when + 0.08);
      const og = gainNode(b, 0);
      env(og.gain, when, 0.002, 0.5 * v, 0.1);
      o.connect(og);
      let out: AudioNode = g;
      if (e.p) {
        const ws = ctx.createWaveShaper();
        ws.curve = b.curve(0.5);
        g.connect(ws);
        og.connect(ws);
        out = ws;
      } else og.connect(g);
      const post = gainNode(b, e.p ? 0.6 : 1);
      out.connect(post).connect(b.drums);
      send(b, post, big ? 0.45 : 0.2);
      o.start(when);
      o.stop(when + 0.3);
      break;
    }
    case 'hat':
    case 'ohat': {
      const n = noiseSrc(b, when, e.dur + 0.1, when * 2.3);
      const hp = filter(b, 'highpass', 7200);
      const pk = filter(b, 'peaking', 10000, 1);
      (pk as BiquadFilterNode).gain.value = 6;
      const g = gainNode(b, 0);
      env(g.gain, when, 0.001, 0.32 * v, e.inst === 'ohat' ? 0.28 : 0.045);
      n.connect(hp).connect(pk).connect(g).connect(b.drums);
      send(b, g, 0.05);
      break;
    }
    case 'crash': {
      const n = noiseSrc(b, when, e.dur + 0.2, when * 0.7);
      const hp = filter(b, 'highpass', 4200);
      const bp = filter(b, 'bandpass', 7800, 0.4);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.004, 0.35 * v, e.dur);
      n.connect(hp).connect(bp).connect(g).connect(b.drums);
      send(b, g, 0.35);
      break;
    }
    case 'bass': {
      const f = mtof(e.midi);
      const o1 = ctx.createOscillator();
      o1.type = 'sawtooth';
      o1.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = 'square';
      o2.frequency.value = f / 2;
      const lp = filter(b, 'lowpass', 200, 6);
      const drive = e.p ?? 0.3;
      lp.frequency.setValueAtTime(140 + drive * 250, when);
      lp.frequency.linearRampToValueAtTime(420 + drive * 1400, when + 0.02);
      lp.frequency.exponentialRampToValueAtTime(120 + drive * 250, when + e.dur);
      const mix = gainNode(b, 0.5);
      const g2 = gainNode(b, 0.4);
      o1.connect(mix);
      o2.connect(g2).connect(mix);
      const ws = ctx.createWaveShaper();
      ws.curve = b.curve(0.2 + drive * 0.7);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.005, 0.55 * v, 0.1, 0.4, 0.06, e.dur);
      mix.connect(lp).connect(ws).connect(g).connect(b.music);
      o1.start(when);
      o2.start(when);
      o1.stop(when + e.dur + 0.2);
      o2.stop(when + e.dur + 0.2);
      break;
    }
    case 'sub': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = mtof(e.midi);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.05, 0.35 * v, 0.4, 0.3, 0.2, e.dur);
      o.connect(g).connect(b.music);
      o.start(when);
      o.stop(when + e.dur + 0.3);
      break;
    }
    case 'pad': {
      const bar = e.p ?? 0;
      const chords = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]];
      const notes = chords[((bar % 4) + 4) % 4];
      const lp = filter(b, 'lowpass', 600, 0.8);
      lp.frequency.setValueAtTime(420, when);
      lp.frequency.linearRampToValueAtTime(900 + 300 * Math.sin(bar * 0.7), when + e.dur * 0.6);
      lp.frequency.linearRampToValueAtTime(500, when + e.dur);
      const g = gainNode(b, 0);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.085 * v, when + 0.7);
      g.gain.setValueAtTime(0.085 * v, when + e.dur - 0.5);
      g.gain.linearRampToValueAtTime(0.0001, when + e.dur + 0.3);
      for (const m of notes) {
        for (const det of [-9, 7]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = mtof(m);
          o.detune.value = det;
          o.connect(lp);
          o.start(when);
          o.stop(when + e.dur + 0.4);
        }
      }
      lp.connect(g).connect(b.music);
      send(b, g, 0.7);
      break;
    }
    case 'lead': {
      const f = mtof(e.midi);
      const drive = e.p ?? 0;
      const o1 = ctx.createOscillator();
      o1.type = 'sawtooth';
      o1.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = 'square';
      o2.frequency.value = f;
      o2.detune.value = 6;
      // vibrato efter en kort stund
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.2;
      const lg = gainNode(b, 0);
      lg.gain.setValueAtTime(0, when);
      lg.gain.linearRampToValueAtTime(f * 0.006, when + Math.min(0.4, e.dur));
      lfo.connect(lg);
      lg.connect(o1.frequency);
      lg.connect(o2.frequency);
      const mix = gainNode(b, 0.5);
      o1.connect(mix);
      const g2 = gainNode(b, 0.35);
      o2.connect(g2).connect(mix);
      const ws = ctx.createWaveShaper();
      ws.curve = b.curve(drive * 0.95);
      const lp = filter(b, 'lowpass', 1800 + drive * 2600, 1.2);
      const hp = filter(b, 'highpass', 180);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.02, (0.2 - drive * 0.06) * v, 0.2, (0.15 - drive * 0.04) * v, 0.12, e.dur);
      mix.connect(ws).connect(lp).connect(hp).connect(g).connect(b.music);
      send(b, g, 0.4, 0.28);
      for (const o of [o1, o2, lfo]) {
        o.start(when);
        o.stop(when + e.dur + 0.25);
      }
      break;
    }
    case 'drone': {
      const lp = filter(b, 'lowpass', 70, 3);
      const ending = (e.p ?? 0) < 0;
      if (ending) {
        lp.frequency.value = 170;
      } else {
        lp.frequency.setValueAtTime(60, when);
        lp.frequency.exponentialRampToValueAtTime(1600, when + e.dur * 0.95);
      }
      const g = gainNode(b, 0);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime((ending ? 0.12 : 0.26) * e.vel, when + (ending ? 3 : 0.6));
      g.gain.setValueAtTime((ending ? 0.12 : 0.26) * e.vel, when + e.dur - (ending ? 3 : 0.2));
      g.gain.linearRampToValueAtTime(0.0001, when + e.dur);
      for (const [iv, det, type] of [[0, -6, 'sawtooth'], [0, 5, 'sawtooth'], [7, 0, 'sawtooth'], [12, 3, 'square'], [-12, 0, 'sine']] as const) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = mtof(e.midi + iv);
        o.detune.value = det;
        o.connect(lp);
        o.start(when);
        o.stop(when + e.dur + 0.1);
      }
      lp.connect(g).connect(b.music);
      send(b, g, 0.5);
      break;
    }
    case 'riser': {
      const n = noiseSrc(b, when, e.dur, when * 1.3);
      const bp = filter(b, 'bandpass', 300, 2.5);
      bp.frequency.setValueAtTime(250, when);
      bp.frequency.exponentialRampToValueAtTime(7000, when + e.dur);
      const g = gainNode(b, 0);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.45 * e.vel, when + e.dur * 0.98);
      g.gain.linearRampToValueAtTime(0.0001, when + e.dur);
      n.connect(bp).connect(g).connect(b.fx);
      send(b, g, 0.4);
      if (e.p) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(mtof(38), when);
        o.frequency.exponentialRampToValueAtTime(mtof(74), when + e.dur);
        const og = gainNode(b, 0);
        og.gain.setValueAtTime(0.0001, when);
        og.gain.exponentialRampToValueAtTime(0.08, when + e.dur * 0.98);
        og.gain.linearRampToValueAtTime(0.0001, when + e.dur);
        const lp = filter(b, 'lowpass', 2500);
        o.connect(lp).connect(og).connect(b.fx);
        o.start(when);
        o.stop(when + e.dur + 0.05);
      }
      break;
    }
    case 'glitch': {
      // Korta, seedade korn av fyrkantsvåg och brus – samma varje gång.
      const rng = new Rng(Math.floor((e.p ?? 0) * 1000));
      let tt = when;
      const out = gainNode(b, 0.28 * v);
      const bp = filter(b, 'bandpass', 1800, 0.9);
      out.connect(bp).connect(b.fx);
      send(b, out, 0.15);
      while (tt < when + e.dur) {
        const len = rng.range(0.012, 0.045);
        const useNoise = rng.next() < 0.35;
        const g = gainNode(b, 0);
        g.gain.setValueAtTime(0, tt);
        g.gain.linearRampToValueAtTime(rng.range(0.4, 1), tt + 0.002);
        g.gain.setValueAtTime(rng.range(0.3, 1), tt + len - 0.003);
        g.gain.linearRampToValueAtTime(0, tt + len);
        if (useNoise) {
          const n = noiseSrc(b, tt, len, rng.next() * 1.5);
          n.connect(g);
        } else {
          const o = ctx.createOscillator();
          o.type = 'square';
          o.frequency.setValueAtTime(rng.range(120, 3200), tt);
          o.frequency.linearRampToValueAtTime(rng.range(80, 4000), tt + len);
          o.connect(g);
          o.start(tt);
          o.stop(tt + len + 0.01);
        }
        g.connect(out);
        tt += len + (rng.next() < 0.3 ? rng.range(0.005, 0.03) : 0);
      }
      break;
    }
    case 'piano': {
      const f = mtof(e.midi);
      const g = gainNode(b, 0);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.3 * v, when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.12 * v, when + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, when + e.dur);
      const lp = filter(b, 'lowpass', 2200);
      lp.frequency.setValueAtTime(3200, when);
      lp.frequency.exponentialRampToValueAtTime(500, when + e.dur * 0.7);
      const partials: [number, number, number][] = [[1, 1, 0], [2, 0.45, 3], [3, 0.22, -4], [4.02, 0.12, 6], [5.05, 0.06, 0]];
      for (const [mul, amp, det] of partials) {
        for (const d2 of [-3, 3]) {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = f * mul;
          o.detune.value = det + d2;
          const og = gainNode(b, amp * 0.5);
          o.connect(og).connect(lp);
          o.start(when);
          o.stop(when + e.dur + 0.05);
        }
      }
      lp.connect(g).connect(b.music);
      send(b, g, 0.8);
      break;
    }
    case 'click': {
      const n = noiseSrc(b, when, 0.03, when * 5.1);
      const hp = filter(b, 'highpass', 1800);
      const bp = filter(b, 'bandpass', 3400, 2);
      const g = gainNode(b, 0);
      env(g.gain, when, 0.0008, 0.9 * v, 0.022);
      n.connect(hp).connect(bp).connect(g).connect(b.fx);
      const o = ctx.createOscillator();
      o.frequency.value = 95;
      const og = gainNode(b, 0);
      env(og.gain, when, 0.001, 0.25 * v, 0.03);
      o.connect(og).connect(b.fx);
      o.start(when);
      o.stop(when + 0.05);
      send(b, g, 0.25);
      break;
    }
    case 'fall': {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(mtof(e.midi), when);
      o.frequency.exponentialRampToValueAtTime(mtof(e.midi - 30), when + e.dur);
      const g = gainNode(b, 0);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.22 * v, when + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, when + e.dur);
      o.connect(g).connect(b.music);
      send(b, g, 0.7);
      o.start(when);
      o.stop(when + e.dur + 0.05);
      // smulande brus
      const n = noiseSrc(b, when + 0.15, e.dur, 0.4);
      const bp = filter(b, 'bandpass', 900, 0.7);
      bp.frequency.setValueAtTime(1400, when + 0.15);
      bp.frequency.exponentialRampToValueAtTime(200, when + e.dur);
      const ng = gainNode(b, 0);
      ng.gain.setValueAtTime(0.0001, when + 0.15);
      ng.gain.linearRampToValueAtTime(0.14 * v, when + 0.4);
      ng.gain.exponentialRampToValueAtTime(0.0001, when + e.dur);
      n.connect(bp).connect(ng).connect(b.fx);
      break;
    }
    case 'hit':
    case 'boom': {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(e.inst === 'hit' ? 58 : 80, when);
      o.frequency.exponentialRampToValueAtTime(e.inst === 'hit' ? 27 : 30, when + Math.min(1.5, e.dur));
      const g = gainNode(b, 0);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.9 * v, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + e.dur);
      const ws = ctx.createWaveShaper();
      ws.curve = b.curve(0.35);
      o.connect(ws).connect(g).connect(b.fx);
      send(b, g, 0.6);
      const n = noiseSrc(b, when, 1.2, 0.9);
      const lp = filter(b, 'lowpass', 400);
      const ng = gainNode(b, 0);
      ng.gain.setValueAtTime(0.0001, when);
      ng.gain.linearRampToValueAtTime(0.5 * v, when + 0.005);
      ng.gain.exponentialRampToValueAtTime(0.0001, when + 1.1);
      n.connect(lp).connect(ng).connect(b.fx);
      send(b, ng, 0.5);
      o.start(when);
      o.stop(when + e.dur + 0.05);
      break;
    }
  }
}
