// Procedurell gångcykel. En pose är en ren funktion av gångfas och stil,
// så animationen är helt deterministisk och oberoende av bildfrekvens.

import { Pose, SideAngles, restPose } from './rig';
import { lerp } from '../core/math';

export interface WalkStyle {
  stride: number; // lårets amplitud (rad)
  thighBias: number;
  knee: number; // knäböj i svingfas
  kneeStance: number; // grundböj
  toe: number;
  armSwing: number;
  armBias: number;
  armsOut: number;
  elbow: number;
  bounce: number; // extra studs (m)
  lean: number; // framåtlutning (rad)
  sway: number;
  twist: number;
  headBob: number;
  headDown: number;
  /** Meter per full cykel (två steg) vid längd 1,75 m. */
  cycle: number;
  /** 0 = mjuk, 1 = mekaniskt skarp. */
  sharp: number;
}

const base: WalkStyle = {
  stride: 0.42, thighBias: 0.02, knee: 0.75, kneeStance: 0.08, toe: 0.18,
  armSwing: 0.32, armBias: 0.0, armsOut: 0.1, elbow: 0.22,
  bounce: 0, lean: 0.06, sway: 0.035, twist: 0.08, headBob: 0.02, headDown: 0.05,
  cycle: 1.55, sharp: 0,
};

export const STYLES = {
  base,
  // Tidig människa: framåtlutad, böjda knän, armar som hänger framåt.
  primal: { ...base, stride: 0.36, lean: 0.55, kneeStance: 0.38, knee: 0.8, armBias: 0.35, armSwing: 0.22, elbow: 0.35, headDown: -0.35, cycle: 1.25, sway: 0.06 },
  human: { ...base },
  glass: { ...base, stride: 0.4, sway: 0.02, twist: 0.05, headDown: 0.0 },
  // GPT-1: liten och klumpig.
  clumsy: { ...base, stride: 0.5, knee: 0.35, kneeStance: 0.02, armSwing: 0.5, armsOut: 0.35, elbow: 0.05, sway: 0.13, twist: 0.02, headBob: 0.09, lean: 0.02, cycle: 1.2, sharp: 0.6 },
  jerky: { ...base, stride: 0.44, armSwing: 0.4, sway: 0.08, headBob: 0.05, sharp: 0.35 },
  steady: { ...base, stride: 0.44, sway: 0.03, lean: 0.04 },
  // ChatGPT: mjuk och vänlig, lite studs.
  soft: { ...base, stride: 0.4, bounce: 0.03, sway: 0.05, armSwing: 0.28, elbow: 0.35, headBob: 0.035, headDown: -0.02, lean: 0.02 },
  // GPT-4: lång, självsäker.
  proud: { ...base, stride: 0.5, lean: -0.02, armSwing: 0.36, twist: 0.1, headDown: -0.05, cycle: 1.75 },
  calm: { ...base, stride: 0.4, lean: 0.05, armSwing: 0.28, headDown: 0.04 },
  // Resonerande: lite långsammare, blicken nedåt i tanke.
  thinking: { ...base, stride: 0.36, lean: 0.1, armSwing: 0.18, headDown: 0.3, elbow: 0.4, cycle: 1.4 },
  driven: { ...base, stride: 0.48, lean: 0.12, armSwing: 0.38, elbow: 0.5, cycle: 1.7 },
  agent: { ...base, stride: 0.5, armSwing: 0.45, cycle: 1.2, sharp: 0.3, headBob: 0.05 },
  // AGI: perfekt rak gång – ingen svaj, ingen studs.
  perfect: { ...base, stride: 0.42, lean: 0, sway: 0, twist: 0.03, headBob: 0, headDown: 0, armSwing: 0.2, elbow: 0.1, knee: 0.7, kneeStance: 0.03, cycle: 1.8 },
} satisfies Record<string, WalkStyle>;

export type StyleName = keyof typeof STYLES;

export function lerpStyle(a: WalkStyle, b: WalkStyle, k: number): WalkStyle {
  const o = { ...a };
  for (const key of Object.keys(a) as (keyof WalkStyle)[]) o[key] = lerp(a[key], b[key], k);
  return o;
}

/** Skärper en sinus mot mer mekanisk rörelse. */
const shape = (x: number, sharp: number) => (sharp <= 0 ? x : Math.sign(x) * Math.pow(Math.abs(x), 1 - sharp * 0.65));

/**
 * Gångpose för fas (0..1 per full cykel). `amount` skalar ner rörelsen mot
 * stillastående (används när figuren stannar).
 */
export function walkPose(phase: number, st: WalkStyle, amount = 1, out: Pose = restPose()): Pose {
  const f = phase * Math.PI * 2;
  const s = shape(Math.sin(f), st.sharp);
  const c = Math.cos(f);
  const side = (sg: number, o: SideAngles) => {
    const ss = s * sg;
    const cc = c * sg;
    const swing = Math.pow(Math.max(0, Math.cos(f * sg + (sg < 0 ? Math.PI : 0) + 0.35)), 1.5);
    o.thigh = (st.stride * ss + st.thighBias) * amount + st.kneeStance * 0.5;
    o.thighOut = 0.02;
    o.knee = st.kneeStance + st.knee * swing * amount;
    o.ankle = st.toe * Math.max(0, ss) * amount - 0.12 * Math.max(0, -cc) * Math.max(0, -ss) * amount;
    o.shoulder = (-st.armSwing * ss * amount) + st.armBias;
    o.shoulderOut = st.armsOut;
    o.elbow = st.elbow + 0.3 * Math.max(0, -ss) * amount;
  };
  side(1, out.L);
  side(-1, out.R);
  out.bounce = st.bounce * Math.abs(c) * amount;
  out.hipsSway = st.sway * s * amount;
  out.hipsTwist = st.twist * s * amount;
  out.spineLean = st.lean;
  out.spineTwist = -st.twist * s * 1.3 * amount;
  out.neck = 0;
  out.head = st.headDown - st.lean * 0.6 + st.headBob * Math.cos(2 * f) * amount;
  out.headTurn = 0;
  out.headTilt = 0;
  out.lift = 0;
  out.plant = true;
  return out;
}

export function lerpPose(a: Pose, b: Pose, k: number, out: Pose = restPose()): Pose {
  const sides = ['L', 'R'] as const;
  const scalars = ['lift', 'bounce', 'hipsTwist', 'hipsSway', 'spineLean', 'spineTwist', 'neck', 'head', 'headTurn', 'headTilt'] as const;
  for (const key of scalars) out[key] = lerp(a[key], b[key], k);
  for (const sd of sides) {
    for (const key of Object.keys(a[sd]) as (keyof SideAngles)[]) out[sd][key] = lerp(a[sd][key], b[sd][key], k);
  }
  out.plant = k < 0.5 ? a.plant : b.plant;
  return out;
}
