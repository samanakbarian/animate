// Regi: kamera, ljus- och effektnivåer som rena funktioner av t.

import * as THREE from 'three';
import { Integral, clamp, easeInOutCubic, fbm1, lerp, smoothstep, smootherstep } from './core/math';
import { ASI_X, BOUNDARIES, STEPS, StepId, stepIndexAt } from './timeline';

/** Strukturens plats på himlen och slutscenens bänk. */
export const STRUCTURE_CENTER = new THREE.Vector3(ASI_X + 8, 58, -95);
export const STRUCTURE_RADIUS = 19;
export const BENCH_POS = new THREE.Vector3(ASI_X + 20, 0, 95);

/** Brännvidd (mm, 36 mm bred sensor) → horisontell FOV i grader. */
export const hfovFromLens = (mm: number) => (2 * Math.atan(18 / mm) * 180) / Math.PI;

interface Framing {
  dist: number;
  lead: number;
  camY: number;
  targetY: number;
  lens: number;
}
const DEF: Framing = { dist: 8.4, lead: 0.55, camY: 0.62, targetY: 1.0, lens: 36 };
const FRAMING: Partial<Record<StepId, Partial<Framing>>> = {
  human: { dist: 8.0, lead: 0.4 },
  gpt1: { dist: 6.6, targetY: 0.75, camY: 0.45 },
  gpt2: { dist: 7.6, targetY: 0.9 },
  gpt4: { dist: 8.8, targetY: 1.1 },
  claude3: { dist: 9.6, lead: 0.3, targetY: 1.05 },
  reasoning: { dist: 8.0, targetY: 1.1 },
  today: { dist: 10, lead: -0.9, targetY: 0.95, lens: 32 },
  agi: { dist: 8.8, targetY: 1.05 },
  asi: { dist: 8.8, targetY: 1.05 },
};
const framingFor = (id: StepId): Framing => ({ ...DEF, ...(FRAMING[id] ?? {}) });

function framingAt(t: number): Framing {
  const i = stepIndexAt(t);
  const cur = framingFor(STEPS[i].id);
  if (i === 0) return cur;
  const prev = framingFor(STEPS[i - 1].id);
  const k = smootherstep(STEPS[i].start - 0.8, STEPS[i].start + 1.6, t);
  return {
    dist: lerp(prev.dist, cur.dist, k),
    lead: lerp(prev.lead, cur.lead, k),
    camY: lerp(prev.camY, cur.camY, k),
    targetY: lerp(prev.targetY, cur.targetY, k),
    lens: lerp(prev.lens, cur.lens, k),
  };
}

// Kamerans x följer figuren mjukt: filtrera walkX med en kritiskt dämpad
// "fjäder" – beräknad som en integral så att den är en ren funktion av t.
export interface Shot {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  hfov: number;
  roll: number;
  focus: THREE.Vector3;
  bokeh: number;
}

const shot: Shot = { pos: new THREE.Vector3(), target: new THREE.Vector3(), hfov: 50, roll: 0, focus: new THREE.Vector3(), bokeh: 2 };

export interface CastLike {
  pos: THREE.Vector3;
  focus: THREE.Vector3;
  height: number;
  scale: number;
}

export function cameraAt(t: number, cast: CastLike, portrait: boolean, xTrack: number): Shot {
  const hand = (s: number, amp: number, speed = 0.35) => fbm1(t * speed, s, 3) * amp;
  const p = shot.pos, tg = shot.target;

  if (t < 130) {
    const f = framingAt(t);
    let dist = f.dist * (portrait ? 0.92 : 1);
    let camY = f.camY;
    let targetY = f.targetY;
    let lead = f.lead;
    let lens = f.lens;
    // 105–108: kameran glider närmare och lägre medan AGI stannar och tittar upp.
    const settle = smoothstep(104.5, 108, t);
    dist = lerp(dist, 6.4, settle);
    camY = lerp(camY, 0.4, settle);
    targetY = lerp(targetY, 1.35, settle);
    lead = lerp(lead, 0.1, settle);
    const x = xTrack;
    p.set(x + lead, camY, dist);
    tg.set(x + lead * 0.55, targetY, 0);

    // 108–116: åker bakåt och uppåt till ~35 m.
    const back = easeInOutCubic(clamp((t - 108.3) / 7.7));
    if (t >= 108) {
      const figCenterY = cast.pos.y + cast.height * 0.55;
      p.set(x - 4 * back, lerp(0.4, 9.5, back), lerp(6.4, 35, back));
      tg.set(x - 1 * back, lerp(1.35, figCenterY, smoothstep(108.2, 111, t)), 0);
      lens = lerp(lens, 32, back);
    }
    // 114–120: vinklas upp mot strukturen.
    const tilt = smootherstep(114.3, 119.8, t);
    if (tilt > 0) {
      const sc = STRUCTURE_CENTER;
      const look = new THREE.Vector3(sc.x, sc.y - 6, sc.z);
      tg.lerp(look, tilt);
      p.y += tilt * 4;
      lens = lerp(lens, 26, tilt);
    }
    // 120–130: långsam drift bakåt, strukturen dominerar.
    const drift = clamp((t - 120) / 10);
    if (drift > 0) {
      p.z += drift * 6;
      p.x -= drift * 3;
      p.y += drift * 1.5;
    }
    shot.hfov = hfovFromLens(lens);
    // Handhållen känsla (låg amplitud).
    const amp = 1 + back * 2;
    p.x += hand(11, 0.035 * amp);
    p.y += hand(12, 0.03 * amp);
    tg.x += hand(13, 0.04 * amp);
    tg.y += hand(14, 0.03 * amp);
    shot.roll = hand(15, 0.006);
    // Kameraskak vid blixten.
    if (t >= 108) {
      const sh = Math.exp(-(t - 108) * 2.6) * 0.35;
      p.x += fbm1(t * 24, 21, 2) * sh;
      p.y += fbm1(t * 24, 22, 2) * sh;
      shot.roll += fbm1(t * 20, 23, 2) * sh * 0.08;
    }
    // Skärpedjup: fokus på figuren, sedan långt bort.
    shot.focus.copy(cast.focus);
    shot.bokeh = lerp(2.4, 0.6, smoothstep(108, 112, t));
    if (tilt > 0) shot.focus.lerp(STRUCTURE_CENTER, tilt);
  } else {
    // Slutet: ny bild. Människan på bänken, strukturen enorm i bakgrunden.
    const b = BENCH_POS;
    const push = smootherstep(137.5, 146, t) * 0.05;
    // Kameran bakom bänken, i linje med strukturen: människan blir en siluett
    // mot strukturens spegling i den våta marken.
    const cam = new THREE.Vector3(b.x + 1.0, 1.0, b.z + 4.2);
    const look = new THREE.Vector3(b.x - 0.55, 2.35, b.z - 8);
    p.copy(cam).lerp(look, push);
    tg.copy(look);
    p.x += hand(31, 0.03, 0.25);
    p.y += hand(32, 0.02, 0.25);
    tg.x += hand(33, 0.03, 0.25);
    tg.y += hand(34, 0.02, 0.25);
    shot.roll = hand(35, 0.004, 0.25);
    shot.hfov = hfovFromLens(portrait ? 26 : 30);
    shot.focus.set(b.x - 0.15, 1.0, b.z);
    shot.bokeh = 1.6;
  }
  return shot;
}

/** Kamerans x: mjukt filtrerad följning av figuren (ren funktion av t). */
export function makeTracker(walkX: (t: number) => number) {
  // Dämpad följning ≈ glidande medelvärde av walkX över ~0,6 s bakåt.
  const I = new Integral(walkX, -2, 160, 1 / 120);
  const W = 0.6;
  return (t: number) => (I.at(t) - I.at(t - W)) / W + 0.3;
}

// ---------------------------------------------------------------------------
// Effekt-nivåer

export function glitchAt(t: number): number {
  let g = 0;
  for (const b of BOUNDARIES) {
    if (b >= 130) continue;
    const d = Math.abs(t - b);
    if (d < 0.32) g = Math.max(g, Math.pow(1 - d / 0.32, 1.4));
  }
  // Små ryck under GPT-2
  if (t > 23 && t < 29.5) {
    const q = Math.floor(t * 8);
    const h = Math.sin(q * 12.9898) * 43758.5453;
    if (h - Math.floor(h) > 0.9) g = Math.max(g, 0.35);
  }
  // Flimrande siffror inför ASI
  if (t > 105 && t < 107.5) {
    const q = Math.floor(t * 10);
    const h = Math.sin(q * 78.233) * 43758.5453;
    if (h - Math.floor(h) > 0.88) g = Math.max(g, 0.25);
  }
  return g;
}

export function flashAt(t: number): number {
  let f = 0;
  if (t >= 108) f = Math.max(f, Math.exp(-(t - 108) * 3.2) * (t < 108.05 ? 1 : 0.95));
  if (t >= 107.9 && t < 108) f = Math.max(f, (t - 107.9) * 10 * 0.6);
  if (t >= 143) f = Math.max(f, Math.exp(-(t - 143) * 5) * 0.14);
  return f;
}

export function fadeAt(t: number): number {
  if (t < 0.9) return smoothstep(0, 0.9, t);
  return 1 - smoothstep(146, 147.5, t);
}

/** Regnhastighet: normal, saktar in och svävar uppåt (ASI), fryser (slutet). */
export function rainSpeed(t: number): number {
  if (t < 105) return 1;
  if (t < 130) {
    const k1 = smoothstep(105, 107.6, t);
    const k2 = smoothstep(107.6, 110, t);
    return lerp(lerp(1, 0, k1), -0.22, k2);
  }
  return 1 - smoothstep(139, 142, t);
}
export const rainPhase = (() => {
  const I = new Integral(rainSpeed, 0, 150, 1 / 240);
  return (t: number) => I.at(t);
})();
