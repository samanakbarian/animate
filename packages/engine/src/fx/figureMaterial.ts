// Gemensamt shadersystem för figurerna. Bygger på MeshPhysicalMaterial (riktig
// PBR-belysning, skuggor, dimma) och injicerar effekter via onBeforeCompile:
//
//  - DISSOLVE: brusig upplösning med glödande kant som sveper från fötterna upp
//  - GLITCH:   vertexförskjutning där skivor av kroppen hoppar i sidled
//  - FRESNEL:  kantljus / genomskinlighet (glas, hologram, obsidian)
//  - LINES:    ledningslinjer (Transformer) eller pulserande nätverk (GPT-3)
//  - CODE:     rader av kod som rinner över kroppen (Claude 4)
//  - STONE:    förstening som sprider sig från fötterna (slutet)
//  - HEADGLOW: glödande, pulserande huvud (resonerande modeller)

import * as THREE from 'three';

export interface FxOptions {
  glitch?: boolean;
  fresnel?: boolean;
  lines?: 0 | 1 | 2; // 0 av, 1 kretslinjer, 2 nätverk
  code?: boolean;
  stone?: boolean;
  headGlow?: boolean;
  /** Opacitet styrs av fresnel (glas/eko). */
  fresnelAlpha?: boolean;
}

export interface FxUniforms {
  uTime: { value: number };
  uHeight: { value: number };
  uDisLo: { value: number };
  uDisHi: { value: number };
  uEdgeColor: { value: THREE.Color };
  uGlitch: { value: number };
  uGlitchSeed: { value: number };
  uRimColor: { value: THREE.Color };
  uRimPower: { value: number };
  uRimStrength: { value: number };
  uAlphaBase: { value: number };
  uLineColor: { value: THREE.Color };
  uLineStrength: { value: number };
  uCodeTex: { value: THREE.Texture | null };
  uCodeColor: { value: THREE.Color };
  uCodeStrength: { value: number };
  uStone: { value: number };
  uStoneColor: { value: THREE.Color };
  uHeadGlow: { value: number };
  uHeadColor: { value: THREE.Color };
  uHeadY: { value: number };
  uFade: { value: number };
}

export type FxMaterial = THREE.MeshPhysicalMaterial & { fx: FxUniforms; fxOpts: FxOptions };

const NOISE = /* glsl */ `
float fxHash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float fxNoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(fxHash(i+vec3(0,0,0)),fxHash(i+vec3(1,0,0)),f.x),
                 mix(fxHash(i+vec3(0,1,0)),fxHash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(fxHash(i+vec3(0,0,1)),fxHash(i+vec3(1,0,1)),f.x),
                 mix(fxHash(i+vec3(0,1,1)),fxHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fxFbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*fxNoise(p); p*=2.03; a*=.5; } return s; }
`;

export function createFxMaterial(params: THREE.MeshPhysicalMaterialParameters, opts: FxOptions = {}): FxMaterial {
  const mat = new THREE.MeshPhysicalMaterial(params) as FxMaterial;
  const fx: FxUniforms = {
    uTime: { value: 0 },
    uHeight: { value: 1.75 },
    uDisLo: { value: -1 },
    uDisHi: { value: 2 },
    uEdgeColor: { value: new THREE.Color(3.0, 1.9, 1.2) },
    uGlitch: { value: 0 },
    uGlitchSeed: { value: 0 },
    uRimColor: { value: new THREE.Color(0.6, 0.8, 1.0) },
    uRimPower: { value: 3 },
    uRimStrength: { value: 0 },
    uAlphaBase: { value: 1 },
    uLineColor: { value: new THREE.Color(0.2, 1.4, 1.3) },
    uLineStrength: { value: 0 },
    uCodeTex: { value: null },
    uCodeColor: { value: new THREE.Color(1.6, 0.9, 0.6) },
    uCodeStrength: { value: 0 },
    uStone: { value: -0.2 },
    uStoneColor: { value: new THREE.Color(0.17, 0.17, 0.165) },
    uHeadGlow: { value: 0 },
    uHeadColor: { value: new THREE.Color(1.8, 1.6, 1.2) },
    uHeadY: { value: 1.45 },
    uFade: { value: 1 },
  };
  mat.fx = fx;
  mat.fxOpts = opts;
  const defines: Record<string, string> = {};
  if (opts.glitch) defines.FX_GLITCH = '';
  if (opts.fresnel) defines.FX_FRESNEL = '';
  if (opts.fresnelAlpha) defines.FX_FRESNEL_ALPHA = '';
  if (opts.lines) defines.FX_LINES = String(opts.lines);
  if (opts.code) defines.FX_CODE = '';
  if (opts.stone) defines.FX_STONE = '';
  if (opts.headGlow) defines.FX_HEADGLOW = '';
  mat.defines = { ...(mat.defines ?? {}), ...defines };
  const key = 'fx:' + Object.keys(defines).sort().join(',') + (opts.lines ?? '');
  mat.customProgramCacheKey = () => key;

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, fx);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute vec3 aRest;
attribute float aPart;
varying vec3 vRest;
varying vec3 vWorldP;
uniform float uTime;
uniform float uGlitch;
uniform float uGlitchSeed;
${NOISE}`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vRest = aRest;
#ifdef FX_GLITCH
{
  // Skivor av kroppen hoppar i sidled i stegvisa ryck.
  float tq = floor(uTime * 11.0 + uGlitchSeed);
  float slice = floor(aRest.y * 7.0);
  float r = fxHash(vec3(slice, tq, aPart * 0.37));
  float on = step(0.72, r) * uGlitch;
  vec3 dir = vec3(fxHash(vec3(slice, tq, 3.1)) - 0.5, (fxHash(vec3(slice, tq, 5.7)) - 0.5) * 0.3, fxHash(vec3(slice, tq, 9.3)) - 0.5);
  transformed += dir * on * 0.22;
  // hela delar som hoppar ur led
  float pj = step(0.9, fxHash(vec3(aPart, tq, 1.9))) * uGlitch;
  transformed += vec3(0.0, 0.0, (fxHash(vec3(aPart, tq, 7.7)) - 0.5) * 0.3) * pj;
}
#endif`,
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
vWorldP = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vRest;
varying vec3 vWorldP;
uniform float uTime;
uniform float uHeight;
uniform float uDisLo;
uniform float uDisHi;
uniform vec3 uEdgeColor;
uniform vec3 uRimColor;
uniform float uRimPower;
uniform float uRimStrength;
uniform float uAlphaBase;
uniform vec3 uLineColor;
uniform float uLineStrength;
uniform sampler2D uCodeTex;
uniform vec3 uCodeColor;
uniform float uCodeStrength;
uniform float uStone;
uniform vec3 uStoneColor;
uniform float uHeadGlow;
uniform vec3 uHeadColor;
uniform float uHeadY;
uniform float uFade;
${NOISE}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
  float fxH = vRest.y / uHeight;
  float fxN = (fxFbm(vRest * 9.0) - 0.5) * 0.12;
  float fxHN = fxH + fxN;
  if (fxHN < uDisLo || fxHN > uDisHi) discard;
  float fxEdge = max(1.0 - smoothstep(0.0, 0.035, fxHN - uDisLo), 1.0 - smoothstep(0.0, 0.035, uDisHi - fxHN));
  fxEdge *= step(-0.5, uDisLo) + step(uDisHi, 1.5);
  fxEdge = clamp(fxEdge, 0.0, 1.0);
`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
#ifdef FX_STONE
  float fxStoneN = (fxFbm(vRest * 14.0) - 0.5) * 0.18;
  float fxSt = 1.0 - smoothstep(uStone - 0.03, uStone + 0.01, fxH + fxStoneN);
  float fxGrain = fxFbm(vRest * 60.0);
  diffuseColor.rgb = mix(diffuseColor.rgb, uStoneColor * (0.75 + 0.5 * fxGrain), fxSt);
  roughnessFactor = mix(roughnessFactor, 0.93, fxSt);
#endif`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
#ifdef FX_STONE
  metalnessFactor = mix(metalnessFactor, 0.0, fxSt);
#endif`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
  vec3 fxV = normalize(vViewPosition);
  float fxFres = pow(1.0 - abs(dot(normal, fxV)), uRimPower);
#ifdef FX_FRESNEL
  totalEmissiveRadiance += uRimColor * fxFres * uRimStrength;
#endif
#ifdef FX_FRESNEL_ALPHA
  diffuseColor.a *= clamp(uAlphaBase + fxFres * 0.9, 0.0, 1.0);
#endif
#if defined(FX_LINES)
  #if FX_LINES == 1
  {
    // Kretslinjer: ortogonala ledningar i figurrymd.
    vec3 q = vRest * vec3(26.0, 18.0, 26.0);
    float n = fxNoise(floor(q * 0.25) + 3.0);
    float lx = abs(fract(q.x + n * 3.0) - 0.5);
    float ly = abs(fract(q.y + n * 5.0) - 0.5);
    float lz = abs(fract(q.z + n * 7.0) - 0.5);
    float gate = step(0.45, fxNoise(floor(q * 0.5)));
    float line = max(1.0 - smoothstep(0.0, 0.06, ly) , gate * (1.0 - smoothstep(0.0, 0.06, min(lx, lz))));
    float flow = 0.55 + 0.45 * sin(vRest.y * 9.0 - uTime * 3.0 + n * 6.28);
    totalEmissiveRadiance += uLineColor * line * flow * uLineStrength;
  }
  #else
  {
    // Nätverk: cellkanter (voronoi) med pulser som färdas uppåt.
    vec3 q = vRest * 11.0;
    vec3 ip = floor(q); vec3 fp = fract(q);
    float d1 = 8.0, d2 = 8.0;
    for (int k = -1; k <= 1; k++) for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec3 b = vec3(float(i), float(j), float(k));
      vec3 o = vec3(fxHash(ip + b), fxHash(ip + b + 17.0), fxHash(ip + b + 31.0));
      float d = length(b + o - fp);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
    float edge = 1.0 - smoothstep(0.0, 0.07, d2 - d1);
    float pulse = pow(0.5 + 0.5 * sin(vRest.y * 7.0 - uTime * 4.2), 6.0);
    float node = 1.0 - smoothstep(0.0, 0.12, d1);
    totalEmissiveRadiance += uLineColor * (edge * (0.25 + 1.6 * pulse) + node * 0.6 * pulse) * uLineStrength;
  }
  #endif
#endif
#ifdef FX_CODE
  {
    vec2 cuv = vec2(vRest.x * 1.3 + vRest.z * 2.1, vRest.y * 1.1 + uTime * 0.12);
    vec3 code = texture2D(uCodeTex, cuv).rgb;
    float scan = 0.6 + 0.4 * sin(vRest.y * 4.0 - uTime * 2.0);
    totalEmissiveRadiance += uCodeColor * code.r * scan * uCodeStrength;
  }
#endif
#ifdef FX_HEADGLOW
  {
    float hg = smoothstep(uHeadY - 0.05, uHeadY + 0.08, vRest.y);
    float pulse = 0.55 + 0.45 * sin(uTime * 5.0);
    totalEmissiveRadiance += uHeadColor * hg * uHeadGlow * pulse * (0.6 + fxFres);
  }
#endif
#ifdef FX_STONE
  totalEmissiveRadiance *= 1.0 - fxSt;
  // tunn glödande front där stenen tar över
  float fxFront = 1.0 - smoothstep(0.0, 0.02, abs(fxH + fxStoneN - uStone + 0.01));
  totalEmissiveRadiance += vec3(0.5, 0.52, 0.55) * fxFront * step(0.0, uStone) * step(uStone, 1.2) * 0.12;
#endif
  totalEmissiveRadiance += uEdgeColor * fxEdge * 2.0;
  diffuseColor.rgb = mix(diffuseColor.rgb, uEdgeColor * 0.2, fxEdge * 0.6);
  diffuseColor.a *= uFade;
`,
      );
  };
  return mat;
}

/** Procedurell kodtextur (seedad) för Claude 4. */
export function makeCodeTexture(seed = 7): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 512, 512);
  g.font = '15px monospace';
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const toks = [
    'fn',
    'let',
    'return',
    'if',
    'await',
    'map(',
    '=>',
    '{',
    '}',
    'self',
    'test',
    'ok',
    '0x1f',
    'for',
    'in',
    'yield',
    'plan',
    'step()',
    '&&',
    '::',
    'impl',
    'const',
    'git',
    'diff',
    '+',
    '-',
    'Ok(())',
  ];
  for (let y = 16; y < 512; y += 17) {
    let x = 4 + Math.floor(rnd() * 5) * 16;
    g.fillStyle = `rgba(255,255,255,${0.45 + rnd() * 0.55})`;
    while (x < 500) {
      const tk = toks[Math.floor(rnd() * toks.length)];
      g.fillText(tk, x, y);
      x += g.measureText(tk).width + 8;
      if (rnd() < 0.12) break;
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  return tex;
}
