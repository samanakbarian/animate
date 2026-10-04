// Delade GLSL-bitar för egna ShaderMaterial (brus, dimma).

import * as THREE from 'three';

export const GLSL_NOISE = /* glsl */ `
float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), u.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), u.x), u.y); }
float fbm2(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.02 + 17.1; a *= .5; } return s; }
`;

/** Lägger till standard-dimuniforms så att ShaderMaterial kan använda scenens dimma. */
export function withFog(uniforms: Record<string, THREE.IUniform>) {
  return THREE.UniformsUtils.merge([THREE.UniformsLib.fog, uniforms]);
}

export const FOG_VERT_PARS = '#include <fog_pars_vertex>';
export const FOG_VERT = '#include <fog_vertex>';
export const FOG_FRAG_PARS = '#include <fog_pars_fragment>';
export const FOG_FRAG = '#include <fog_fragment>';
