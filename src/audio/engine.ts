// Sequencer: schemalägger partituret på en AudioContext (realtid) eller en
// OfflineAudioContext (export). Samma kod i båda fallen → samma ljud.

import { Rng, smoothstep } from '../core/math';
import { DURATION } from '../timeline';
import { Bus, play } from './instruments';
import { NoteEvent, buildScore } from './score';

/** Regnets ljudnivå över tid. */
export function rainLevel(t: number): number {
  // Regnet ligger lågt i mixen – en svag bakgrund.
  if (t < 105) return 0.035 + 0.008 * smoothstep(0, 4, t);
  // takt 51 (127,5–130): tystnad
  if (t < 130) return (0.04 - 0.03 * smoothstep(105, 109, t)) * (1 - smoothstep(127.2, 127.6, t));
  return 0.05 * (1 - smoothstep(139, 142, t));
}

export class AudioEngine {
  readonly ctx: BaseAudioContext;
  readonly master: GainNode;
  private bus: Bus;
  private events: NoteEvent[];
  private next = 0;
  private rainGain: GainNode;
  private rainScheduledTo = 0;
  /** ctx-tid som motsvarar filmens t = 0. */
  origin = 0;

  constructor(ctx: BaseAudioContext) {
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 10;
    comp.ratio.value = 3;
    comp.attack.value = 0.005;
    comp.release.value = 0.2;
    this.master = ctx.createGain();
    this.master.gain.value = 0.72;
    // Tonkontroll: mindre dån i botten, lite mer närvaro i toppen.
    const lowCut = ctx.createBiquadFilter();
    lowCut.type = 'lowshelf';
    lowCut.frequency.value = 110;
    lowCut.gain.value = -5;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 32;
    const presence = ctx.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 3200;
    presence.Q.value = 0.8;
    presence.gain.value = 2.5;
    this.master.connect(hpf).connect(lowCut).connect(presence).connect(comp).connect(ctx.destination);

    const rng = new Rng(4242);
    // Seedat vitt brus (2 s, stereo)
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = rng.next() * 2 - 1;

    // Rumsklang: seedat, exponentiellt avklingande brus.
    const conv = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 3.8);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < len; i++) {
        const k = i / len;
        ch[i] = (rng.next() * 2 - 1) * Math.pow(1 - k, 2.6) * (i < 200 ? i / 200 : 1);
      }
    }
    conv.buffer = ir;
    const revOut = ctx.createGain();
    revOut.gain.value = 0.55;
    conv.connect(revOut).connect(this.master);

    // Punkterad åttondels-delay.
    const delay = ctx.createDelay(2);
    delay.delayTime.value = (60 / 96) * 0.75;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const dlp = ctx.createBiquadFilter();
    dlp.type = 'lowpass';
    dlp.frequency.value = 2400;
    delay.connect(dlp).connect(fb).connect(delay);
    const dOut = ctx.createGain();
    dOut.gain.value = 0.5;
    dlp.connect(dOut).connect(this.master);

    const drums = ctx.createGain();
    drums.gain.value = 1.0;
    drums.connect(this.master);
    const music = ctx.createGain();
    music.gain.value = 0.85;
    const duck = ctx.createGain();
    duck.gain.value = 1;
    music.connect(duck).connect(this.master);
    const fx = ctx.createGain();
    fx.gain.value = 0.9;
    fx.connect(this.master);

    const curves = new Map<number, Float32Array<ArrayBuffer>>();
    const curve = (amount: number) => {
      const q = Math.round(Math.max(0, Math.min(1, amount)) * 20);
      let c = curves.get(q);
      if (!c) {
        const k = q * 4 + 0.5;
        c = new Float32Array(1024) as Float32Array<ArrayBuffer>;
        for (let i = 0; i < 1024; i++) {
          const x = (i / 1023) * 2 - 1;
          c[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
        }
        curves.set(q, c);
      }
      return c;
    };
    this.bus = { ctx, drums, music, fx, reverb: conv, delay, noise, curve, duck: duck.gain };

    // Regn: kontinuerligt filtrerat brus med automatiserad nivå.
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = noise;
    rainSrc.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 500;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 5200;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;
    rainSrc.connect(hp).connect(lp).connect(this.rainGain).connect(this.master);
    const rainSrc2 = ctx.createBufferSource();
    rainSrc2.buffer = noise;
    rainSrc2.loop = true;
    rainSrc2.playbackRate.value = 0.5;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.4;
    const g2 = ctx.createGain();
    g2.gain.value = 0.5;
    rainSrc2.connect(bp).connect(g2).connect(this.rainGain);
    rainSrc.start(0);
    rainSrc2.start(0, 0.7);

    this.events = buildScore();
  }

  /** Förbered uppspelning så att filmens t0 inträffar vid ctx-tid `at`. */
  begin(t0: number, at: number) {
    this.origin = at - t0;
    this.next = 0;
    while (this.next < this.events.length) {
      const e = this.events[this.next];
      if (e.time + e.dur > t0) break;
      this.next++;
    }
    this.rainScheduledTo = t0;
    this.rainGain.gain.cancelScheduledValues(0);
    this.rainGain.gain.setValueAtTime(rainLevel(t0), Math.max(0, at));
  }

  /** Schemalägg allt fram till filmtid t1. */
  scheduleUntil(t1: number) {
    const now = this.ctx.currentTime;
    while (this.next < this.events.length && this.events[this.next].time < t1) {
      const e = this.events[this.next++];
      let when = this.origin + e.time;
      if (when + e.dur < now) continue;
      if (when < now) {
        // påbörjad händelse vid sökning: starta nu med kvarvarande längd
        const skip = now - when;
        if (e.dur - skip < 0.2) continue;
        play(this.bus, { ...e, time: e.time + skip, dur: e.dur - skip }, now + 0.01);
        continue;
      }
      play(this.bus, e, when);
    }
    // regnautomation i 50 ms-steg
    const step = 0.05;
    while (this.rainScheduledTo < Math.min(t1, DURATION)) {
      this.rainScheduledTo += step;
      const at = this.origin + this.rainScheduledTo;
      if (at > now) this.rainGain.gain.linearRampToValueAtTime(rainLevel(this.rainScheduledTo), at);
    }
  }

  stopAll() {
    this.master.gain.cancelScheduledValues(0);
    this.master.gain.setValueAtTime(0, this.ctx.currentTime);
  }
}

/** Renderar hela ljudspåret offline. */
export async function renderOffline(sampleRate = 48000, from = 0, to = DURATION): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * (to - from)), sampleRate);
  const eng = new AudioEngine(ctx);
  eng.begin(from, 0);
  eng.scheduleUntil(to + 0.01);
  return ctx.startRendering();
}

/** 16-bitars PCM WAV. */
export function encodeWav(buf: AudioBuffer): ArrayBuffer {
  const ch = buf.numberOfChannels;
  const n = buf.length;
  const out = new ArrayBuffer(44 + n * ch * 2);
  const v = new DataView(out);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF');
  v.setUint32(4, 36 + n * ch * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, ch, true);
  v.setUint32(24, buf.sampleRate, true);
  v.setUint32(28, buf.sampleRate * ch * 2, true);
  v.setUint16(32, ch * 2, true);
  v.setUint16(34, 16, true);
  w(36, 'data');
  v.setUint32(40, n * ch * 2, true);
  const data = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  return out;
}
