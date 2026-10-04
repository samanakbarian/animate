// Material, proportioner och gångstil per steg.

import * as THREE from 'three';
import { createFxMaterial, FxMaterial, makeCodeTexture } from '@nastasteg/engine/fx/figureMaterial';
import type { Proportions } from '@nastasteg/engine/figure/rig';
import type { StyleName } from '@nastasteg/engine/figure/animation';

export type LookId =
  | 'human'
  | 'transformer'
  | 'gpt1'
  | 'gpt2'
  | 'gpt3'
  | 'chatgpt'
  | 'gpt4'
  | 'claude'
  | 'claude3'
  | 'opus'
  | 'haiku'
  | 'reasoning'
  | 'claude4'
  | 'today'
  | 'agent'
  | 'agi'
  | 'asi'
  | 'echo';

export interface Look {
  props: Partial<Proportions>;
  style: StyleName;
  make: () => FxMaterial;
}

const lin = (hex: number) => new THREE.Color(hex);
let codeTex: THREE.Texture | null = null;

export const TERRACOTTA = 0xc8643f;

export const LOOKS: Record<LookId, Look> = {
  human: {
    props: { height: 1.74 },
    style: 'human',
    make: () =>
      createFxMaterial(
        {
          color: lin(0x8a6a5a),
          roughness: 0.55,
          sheen: 0.35,
          sheenColor: lin(0xd9a892),
          sheenRoughness: 0.5,
          clearcoat: 0.08,
          clearcoatRoughness: 0.6,
        },
        { stone: true },
      ),
  },
  transformer: {
    props: { height: 1.78, girth: 0.95 },
    style: 'glass',
    make: () => {
      const m = createFxMaterial(
        {
          color: lin(0x9fc4ff),
          roughness: 0.06,
          metalness: 0.0,
          transparent: true,
          depthWrite: false,
          envMapIntensity: 1.6,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
        },
        { fresnel: true, fresnelAlpha: true, lines: 1 },
      );
      m.fx.uAlphaBase.value = 0.1;
      m.fx.uRimColor.value.setRGB(0.5, 0.8, 1.4);
      m.fx.uRimStrength.value = 1.4;
      m.fx.uRimPower.value = 2.5;
      m.fx.uLineColor.value.setRGB(1.2, 1.9, 2.6);
      m.fx.uLineStrength.value = 1.3;
      return m;
    },
  },
  gpt1: {
    props: { height: 1.2, head: 1.85, legs: 0.8, torso: 0.9, girth: 1.15, shoulders: 0.9 },
    style: 'clumsy',
    make: () => createFxMaterial({ color: lin(0x6f7277), roughness: 0.78, metalness: 0.0 }, {}),
  },
  gpt2: {
    props: { height: 1.55, head: 1.3, girth: 1.05 },
    style: 'jerky',
    make: () => {
      const m = createFxMaterial({ color: lin(0x7d8289), roughness: 0.5, metalness: 0.1, clearcoat: 0.3 }, { glitch: true, fresnel: true });
      m.fx.uRimColor.value.setRGB(0.3, 0.9, 1.1);
      m.fx.uRimStrength.value = 0.3;
      return m;
    },
  },
  gpt3: {
    props: { height: 1.75 },
    style: 'steady',
    make: () => {
      const m = createFxMaterial({ color: lin(0x0d1013), roughness: 0.32, metalness: 0.25, clearcoat: 0.5 }, { lines: 2, fresnel: true });
      m.fx.uLineColor.value.setRGB(0.15, 1.6, 1.4);
      m.fx.uLineStrength.value = 1.6;
      m.fx.uRimColor.value.setRGB(0.1, 0.5, 0.5);
      m.fx.uRimStrength.value = 0.35;
      return m;
    },
  },
  chatgpt: {
    props: { height: 1.72, girth: 1.08, head: 1.08 },
    style: 'soft',
    make: () =>
      createFxMaterial(
        {
          color: lin(0xe6e2da),
          roughness: 0.42,
          sheen: 1,
          sheenColor: lin(0xffffff),
          sheenRoughness: 0.45,
          clearcoat: 0.25,
          clearcoatRoughness: 0.4,
        },
        {},
      ),
  },
  gpt4: {
    props: { height: 1.95, girth: 0.94, legs: 1.06 },
    style: 'proud',
    make: () => createFxMaterial({ color: lin(0xd4d9df), roughness: 0.13, metalness: 1.0, envMapIntensity: 1.6 }, {}),
  },
  echo: {
    props: { height: 1.95, girth: 0.94, legs: 1.06 },
    style: 'proud',
    make: () => {
      const m = createFxMaterial(
        { color: lin(0x9fb2c8), roughness: 0.2, metalness: 0.0, transparent: true, depthWrite: false },
        { fresnel: true, fresnelAlpha: true },
      );
      m.fx.uAlphaBase.value = 0.05;
      m.fx.uRimColor.value.setRGB(0.6, 0.8, 1.1);
      m.fx.uRimStrength.value = 0.9;
      return m;
    },
  },
  claude: {
    props: { height: 1.74 },
    style: 'calm',
    make: () =>
      createFxMaterial(
        {
          color: lin(TERRACOTTA),
          roughness: 0.38,
          metalness: 0,
          clearcoat: 0.55,
          clearcoatRoughness: 0.25,
          sheen: 0.4,
          sheenColor: lin(0xffb38a),
        },
        { stone: false },
      ),
  },
  claude3: {
    props: { height: 1.74 },
    style: 'calm',
    make: () =>
      createFxMaterial(
        { color: lin(0xc0603c), roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: lin(0xffb38a) },
        {},
      ),
  },
  opus: {
    props: { height: 1.98, girth: 1.08 },
    style: 'calm',
    make: () =>
      createFxMaterial(
        { color: lin(0x8a3a22), roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: lin(0xff9a70) },
        {},
      ),
  },
  haiku: {
    props: { height: 1.36, head: 1.1 },
    style: 'soft',
    make: () =>
      createFxMaterial(
        { color: lin(0xe29470), roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: lin(0xffc7a8) },
        {},
      ),
  },
  reasoning: {
    props: { height: 1.76, head: 1.12 },
    style: 'thinking',
    make: () => {
      const m = createFxMaterial(
        { color: lin(0x23262b), roughness: 0.35, metalness: 0.2, clearcoat: 0.4 },
        { headGlow: true, fresnel: true },
      );
      m.fx.uHeadColor.value.setRGB(2.6, 2.2, 1.6);
      m.fx.uHeadGlow.value = 1.5;
      m.fx.uRimColor.value.setRGB(0.4, 0.45, 0.55);
      m.fx.uRimStrength.value = 0.4;
      return m;
    },
  },
  claude4: {
    props: { height: 1.8 },
    style: 'driven',
    make: () => {
      if (!codeTex) codeTex = makeCodeTexture(11);
      const m = createFxMaterial(
        { color: lin(0x5a2716), roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 },
        { fresnel: true, code: true },
      );
      m.fx.uRimColor.value.setRGB(2.4, 1.2, 0.7);
      m.fx.uRimStrength.value = 1.5;
      m.fx.uRimPower.value = 3.5;
      m.fx.uCodeTex.value = codeTex;
      m.fx.uCodeColor.value.setRGB(1.9, 1.05, 0.65);
      m.fx.uCodeStrength.value = 0.8;
      return m;
    },
  },
  today: {
    props: { height: 1.8, girth: 0.95 },
    style: 'steady',
    make: () => {
      const m = createFxMaterial({ color: lin(0x0a0b0d), roughness: 0.3, metalness: 0.3, clearcoat: 0.6 }, { fresnel: true });
      m.fx.uRimColor.value.setRGB(0.5, 0.75, 1.0);
      m.fx.uRimStrength.value = 0.9;
      return m;
    },
  },
  agent: {
    props: { height: 0.62, head: 1.2, girth: 1.05 },
    style: 'agent',
    make: () => {
      const m = createFxMaterial({ color: lin(0x0b0d10), roughness: 0.3, metalness: 0.2 }, { fresnel: true });
      m.fx.uRimColor.value.setRGB(0.2, 1.4, 1.3);
      m.fx.uRimStrength.value = 1.3;
      return m;
    },
  },
  agi: {
    props: { height: 1.82, girth: 0.92 },
    style: 'perfect',
    make: () => {
      const m = createFxMaterial(
        { color: lin(0xffffff), emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 3.2, roughness: 0.2 },
        { fresnel: true },
      );
      m.fx.uRimColor.value.setRGB(3, 3, 3.3);
      m.fx.uRimStrength.value = 2;
      m.fx.uEdgeColor.value.setRGB(4, 4, 4.4);
      return m;
    },
  },
  asi: {
    props: { height: 1.82, girth: 0.92 },
    style: 'perfect',
    make: () => {
      const m = createFxMaterial(
        { color: lin(0x020203), roughness: 0.06, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5 },
        { fresnel: true },
      );
      m.fx.uRimColor.value.setRGB(3.2, 3.3, 3.6);
      m.fx.uRimStrength.value = 2.2;
      m.fx.uRimPower.value = 2.6;
      m.fx.uEdgeColor.value.setRGB(4, 4, 4.4);
      return m;
    },
  },
};
