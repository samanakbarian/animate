// Regn som partiklar med rörelseoskärpa (streck längs hastigheten) och små
// stänk mot marken. Positioner beräknas helt i shadern från en fas som är
// ∫ regnhastighet dt – så regnet kan sakta in, sväva uppåt och frysa helt,
// deterministiskt för varje t.

import * as THREE from 'three';
import { Rng } from '../core/math';

export class Rain {
  readonly drops: THREE.Mesh;
  readonly splashes: THREE.Mesh;
  readonly uniforms = {
    uPhase: { value: 0 },
    uSpeed: { value: 1 },
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
    uAlpha: { value: 1 },
    uColor: { value: new THREE.Color(0.62, 0.7, 0.8) },
    uLamp: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
    uSplash: { value: 1 },
    uUp: { value: 0 },
  };

  constructor(count = 9000, splashCount = 700) {
    const rng = new Rng(9001);
    // Varje droppe är ett streck (quad) – vertex-shadern sträcker den längs hastigheten.
    const base = new THREE.PlaneGeometry(1, 1, 1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) seeds.set([rng.next(), rng.next(), rng.next(), rng.next()], i * 4);
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    geo.instanceCount = count;

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec4 aSeed;
        uniform float uPhase; uniform float uSpeed; uniform vec3 uCenter; uniform float uTime; uniform float uUp;
        uniform vec4 uLamp[3];
        varying vec2 vUv; varying float vA; varying float vLit;
        const vec3 BOX = vec3(36.0, 16.0, 26.0);
        void main(){
          // Världsfast position som "wrappar" runt kameran.
          vec3 p;
          p.x = uCenter.x + (fract(aSeed.x - uCenter.x / BOX.x) - 0.5) * BOX.x;
          p.z = uCenter.z - 6.0 + (fract(aSeed.z - uCenter.z / BOX.z) - 0.5) * BOX.z;
          float spd = 0.8 + aSeed.w * 0.5;
          float fall = uPhase * 9.5 * spd;
          p.y = (1.0 - fract(aSeed.y + fall / BOX.y)) * BOX.y - 0.3;
          // lätt vind och sväv
          p.x += sin(uTime * 0.7 + aSeed.y * 30.0) * 0.08 * uUp;
          p.z += cos(uTime * 0.6 + aSeed.x * 30.0) * 0.08 * uUp;
          vec3 vel = vec3(0.12, -1.0, 0.0) * 9.5 * spd * uSpeed;
          // Strecklängd ≈ sträcka per bildruta vid 1/40 s slutartid → rörelseoskärpa.
          float len = clamp(abs(uSpeed) * spd * 9.5 * 0.028 + 0.012, 0.012, 0.6);
          vec3 dir = length(vel) > 1e-4 ? normalize(vel) : vec3(0.0, 1.0, 0.0);
          vec3 view = normalize(cameraPosition - p);
          vec3 side = normalize(cross(dir, view)) * 0.0032 * (0.8 + aSeed.w);
          vec3 wp = p + side * position.x * 2.0 + dir * position.y * len;
          vUv = uv;
          float dist = length(cameraPosition - p);
          vA = (0.35 + 0.65 * aSeed.w) * smoothstep(1.2, 4.0, dist) * (1.0 - smoothstep(18.0, 30.0, dist)) * smoothstep(-0.3, 0.2, p.y);
          vLit = 0.0;
          for (int i = 0; i < 3; i++) {
            float d = length(p - uLamp[i].xyz);
            vLit += uLamp[i].w / (1.0 + d * d * 0.6);
          }
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAlpha;
        varying vec2 vUv; varying float vA; varying float vLit;
        void main(){
          float x = 1.0 - abs(vUv.x - 0.5) * 2.0;
          float y = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
          float a = x * y * vA * uAlpha;
          vec3 c = uColor * (0.35 + vLit * 1.4) + vec3(1.0, 0.75, 0.45) * vLit * 0.6;
          gl_FragColor = vec4(c * a, 1.0);
        }`,
    });
    this.drops = new THREE.Mesh(geo, mat);
    this.drops.frustumCulled = false;
    this.drops.renderOrder = 5;

    // Stänk: ringar på marken + en liten krona, cykliskt per slot.
    const sb = new THREE.PlaneGeometry(1, 1);
    const sg = new THREE.InstancedBufferGeometry();
    sg.index = sb.index;
    sg.setAttribute('position', sb.attributes.position);
    sg.setAttribute('uv', sb.attributes.uv);
    const ss = new Float32Array(splashCount * 4);
    for (let i = 0; i < splashCount; i++) ss.set([rng.next(), rng.next(), rng.next(), rng.next()], i * 4);
    sg.setAttribute('aSeed', new THREE.InstancedBufferAttribute(ss, 4));
    sg.instanceCount = splashCount;
    const smat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec4 aSeed;
        uniform float uTime; uniform vec3 uCenter; uniform float uSplash;
        varying vec2 vUv; varying float vAge; varying float vA;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
          float period = 0.45 + aSeed.w * 0.5;
          float tt = uTime / period + aSeed.y * 10.0;
          float n = floor(tt);
          float age = fract(tt);
          vec3 p;
          p.x = uCenter.x + (h(vec2(n, aSeed.x * 91.0)) - 0.5) * 24.0;
          p.z = uCenter.z - 6.0 + (h(vec2(n, aSeed.z * 57.0)) - 0.5) * 14.0;
          p.y = 0.012;
          float r = mix(0.015, 0.085, age) * (0.7 + aSeed.x * 0.6);
          vec3 wp = p + vec3(position.x * r * 2.0, 0.0, -position.y * r * 2.0);
          vUv = uv; vAge = age;
          vA = uSplash * smoothstep(0.0, 0.05, age) * (1.0 - age);
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying vec2 vUv; varying float vAge; varying float vA;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float ring = smoothstep(0.75, 0.9, d) * (1.0 - smoothstep(0.9, 1.0, d));
          float core = (1.0 - smoothstep(0.0, 0.35, d)) * (1.0 - smoothstep(0.0, 0.25, vAge));
          float a = (ring * 0.3 + core * 0.6) * vA;
          gl_FragColor = vec4(uColor * a, 1.0);
        }`,
    });
    this.splashes = new THREE.Mesh(sg, smat);
    this.splashes.frustumCulled = false;
    this.splashes.renderOrder = 4;
  }

  setCount(n: number) {
    (this.drops.geometry as THREE.InstancedBufferGeometry).instanceCount = n;
  }
}
