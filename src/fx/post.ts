// Efterbehandling (pmndrs/postprocessing):
//   RenderPass → [skärpedjup, bloom] i HDR → CinemaEffect
// CinemaEffect gör ACES-tonemapping, färggradering via 3D-LUT (kall bas,
// varm variant för människan och Claude-stegen), kromatisk aberration i
// kanterna, glitch (RGB-förskjutning + scanline-ryck), filmkorn, vinjett,
// vit blixt och toning till svart. Allt styrs av t – inget beror på delta-tid.

import * as THREE from 'three';
import {
  BlendFunction, BloomEffect, DepthOfFieldEffect, Effect, EffectAttribute, EffectComposer, EffectPass, RenderPass,
} from 'postprocessing';

/** Genererar en 3D-LUT (sRGB → sRGB) från en graderingsfunktion. */
function makeLUT(size: number, grade: (r: number, g: number, b: number) => [number, number, number]): THREE.Data3DTexture {
  const data = new Uint8Array(size * size * size * 4);
  for (let b = 0; b < size; b++)
    for (let g = 0; g < size; g++)
      for (let r = 0; r < size; r++) {
        const i = (r + g * size + b * size * size) * 4;
        const [R, G, B] = grade(r / (size - 1), g / (size - 1), b / (size - 1));
        data[i] = Math.round(Math.min(1, Math.max(0, R)) * 255);
        data[i + 1] = Math.round(Math.min(1, Math.max(0, G)) * 255);
        data[i + 2] = Math.round(Math.min(1, Math.max(0, B)) * 255);
        data[i + 3] = 255;
      }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.ClampToEdgeWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const sCurve = (x: number, k: number) => {
  const y = x < 0.5 ? 0.5 * Math.pow(2 * x, k) : 1 - 0.5 * Math.pow(2 * (1 - x), k);
  return y;
};

/** Kall gradering: avmättad, blågrå skuggor, lätt teal i mellantoner, mjuk S-kurva. */
export const COLD_LUT = () =>
  makeLUT(32, (r, g, b) => {
    const l = luma(r, g, b);
    // avmättnad
    let R = mix(l, r, 0.62), G = mix(l, g, 0.64), B = mix(l, b, 0.7);
    // split toning: kalla skuggor, neutrala högdagrar
    const sh = Math.pow(1 - l, 2.2);
    R += -0.025 * sh; G += 0.005 * sh; B += 0.035 * sh;
    // lyft svärtan en aning (filmisk), dämpa toppar
    R = 0.012 + R * 0.975; G = 0.014 + G * 0.975; B = 0.02 + B * 0.97;
    return [sCurve(R, 1.18), sCurve(G, 1.18), sCurve(B, 1.15)];
  });

/** Varm gradering för människan och Claude-stegen. */
export const WARM_LUT = () =>
  makeLUT(32, (r, g, b) => {
    const l = luma(r, g, b);
    let R = mix(l, r, 0.85), G = mix(l, g, 0.8), B = mix(l, b, 0.72);
    const hi = Math.pow(l, 1.4);
    const sh = Math.pow(1 - l, 2);
    R += 0.04 * hi + 0.006 * sh; G += 0.012 * hi; B += -0.03 * hi + 0.012 * sh;
    R = 0.014 + R * 0.975; G = 0.011 + G * 0.975; B = 0.01 + B * 0.97;
    return [sCurve(R, 1.15), sCurve(G, 1.15), sCurve(B, 1.12)];
  });

const cinemaFrag = /* glsl */ `
uniform highp sampler3D lutCold;
uniform highp sampler3D lutWarm;
uniform float uTime;
uniform float uWarmth;
uniform float uCA;
uniform float uGlitch;
uniform float uGrain;
uniform float uVignette;
uniform float uFlash;
uniform float uFade;
uniform float uExposure;

float hsh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

vec3 aces(vec3 x){
  // ACES (Narkowicz/Hill-fit som i three.js ACESFilmicToneMapping)
  const mat3 ACESInputMat = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 ACESOutputMat = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  x *= uExposure / 0.6;
  x = ACESInputMat * x;
  vec3 a = x * (x + 0.0245786) - 0.000090537;
  vec3 b = x * (0.983729 * x + 0.4329510) + 0.238081;
  x = a / b;
  x = ACESOutputMat * x;
  return clamp(x, 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
vec3 toLin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }

vec3 sampleTM(vec2 uv){ return aces(texture2D(inputBuffer, clamp(uv, 0.0005, 0.9995)).rgb); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  vec2 p = uv;
  float tq = floor(uTime * 24.0);
  // --- Glitch: band som förskjuts i sidled + scanline-ryck
  if (uGlitch > 0.001) {
    float band = floor(p.y * 18.0 + hsh(vec2(tq, 1.0)) * 4.0);
    float r = hsh(vec2(band, tq));
    float shift = (hsh(vec2(band, tq + 7.0)) - 0.5) * 0.05 * uGlitch * step(0.66, r);
    p.x += shift;
    p.y += (hsh(vec2(tq, 3.0)) - 0.5) * 0.02 * uGlitch * step(0.5, hsh(vec2(tq, 9.0)));
  }
  // --- Kromatisk aberration, starkare mot kanterna
  vec2 d = p - 0.5;
  float r2 = dot(d, d);
  vec2 off = d * r2 * uCA + vec2(0.012 * uGlitch, 0.0);
  vec3 col;
  col.r = sampleTM(p + off).r;
  col.g = sampleTM(p).g;
  col.b = sampleTM(p - off).b;
  // --- Gradering via 3D-LUT (i sRGB)
  vec3 s = toSRGB(col);
  vec3 lc = s * (31.0 / 32.0) + 0.5 / 32.0;
  vec3 cold = texture(lutCold, lc).rgb;
  vec3 warm = texture(lutWarm, lc).rgb;
  s = mix(cold, warm, uWarmth);
  col = toLin(s);
  // --- Scanlines under glitch
  col *= 1.0 - uGlitch * 0.25 * step(0.5, fract(p.y * 180.0 + uTime * 40.0));
  // --- Vinjett
  float vig = smoothstep(0.95, 0.25, length(d * vec2(1.0, 0.8)));
  col *= mix(1.0, vig, uVignette);
  // --- Blixt
  col = mix(col, vec3(1.0), clamp(uFlash, 0.0, 1.0));
  // --- Filmkorn (deterministiskt per bildruta)
  float g = hsh(uv * vec2(1931.0, 1777.0) + vec2(tq * 3.17, tq * 1.31)) - 0.5;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col += g * uGrain * (0.35 + 0.65 * (1.0 - lum)) * 0.12;
  col = max(col, 0.0);
  // --- Toning till svart
  col *= uFade;
  outputColor = vec4(col, 1.0);
}
`;

export class CinemaEffect extends Effect {
  constructor() {
    super('CinemaEffect', cinemaFrag, {
      blendFunction: BlendFunction.SRC,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, THREE.Uniform>([
        ['lutCold', new THREE.Uniform(COLD_LUT())],
        ['lutWarm', new THREE.Uniform(WARM_LUT())],
        ['uTime', new THREE.Uniform(0)],
        ['uWarmth', new THREE.Uniform(0)],
        ['uCA', new THREE.Uniform(0.018)],
        ['uGlitch', new THREE.Uniform(0)],
        ['uGrain', new THREE.Uniform(0.3)],
        ['uVignette', new THREE.Uniform(0.85)],
        ['uFlash', new THREE.Uniform(0)],
        ['uFade', new THREE.Uniform(1)],
        ['uExposure', new THREE.Uniform(1.15)],
      ]),
    });
  }
  set(name: string, v: number) {
    this.uniforms.get(name)!.value = v;
  }
}

export type Quality = 'low' | 'medium' | 'high';

export class Post {
  readonly composer: EffectComposer;
  readonly cinema = new CinemaEffect();
  readonly bloom: BloomEffect;
  readonly dof: DepthOfFieldEffect | null;
  private hdrPass: EffectPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, quality: Quality) {
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: quality === 'high' ? 4 : quality === 'medium' ? 2 : 0,
    });
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new BloomEffect({
      mipmapBlur: true,
      luminanceThreshold: 1.0,
      luminanceSmoothing: 0.25,
      intensity: 1.25,
      radius: 0.78,
      levels: quality === 'low' ? 5 : 8,
    });
    this.dof =
      quality === 'low'
        ? null
        : new DepthOfFieldEffect(camera, { focusDistance: 6, focusRange: 3.5, bokehScale: 2.2, resolutionScale: quality === 'high' ? 0.5 : 0.35 });
    const hdr = this.dof ? [this.dof, this.bloom] : [this.bloom];
    this.hdrPass = new EffectPass(camera, ...hdr);
    this.composer.addPass(this.hdrPass);
    this.composer.addPass(new EffectPass(camera, this.cinema));
  }

  setSize(w: number, h: number) {
    this.composer.setSize(w, h, false);
  }

  render() {
    this.composer.render(1 / 60);
  }
}
