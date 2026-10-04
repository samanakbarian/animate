// Partikelupplösning: provtar punkter på en figurs yta och låter dem lossna
// underifrån och uppåt – antingen sugs de upp mot en punkt (ASI → strukturen)
// eller blåser bort som damm (stenfiguren). Allt beräknas i shadern från t.

import * as THREE from 'three';
import { Rng } from '../core/math';
import type { Figure } from '../figure/rig';

export type DisintegrateMode = 'suck' | 'wind';

export class Disintegrate {
  readonly points: THREE.Points;
  readonly uniforms = {
    uTime: { value: 0 },
    uT0: { value: 0 },
    uSweep: { value: 4 },
    uFly: { value: 3 },
    uTarget: { value: new THREE.Vector3() },
    uWind: { value: new THREE.Vector3(1, 0.1, -0.3) },
    uColor: { value: new THREE.Color(3, 3, 3.2) },
    uSize: { value: 30 },
    uScale: { value: 1 },
    uMode: { value: 0 },
    uAlpha: { value: 1 },
  };
  private captured = false;
  private count: number;
  private seed: number;

  constructor(count: number, mode: DisintegrateMode, seed = 1) {
    this.count = count;
    this.seed = seed;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aH', new THREE.BufferAttribute(new Float32Array(count), 1));
    const rnd = new Float32Array(count * 4);
    const rng = new Rng(seed * 7919);
    for (let i = 0; i < count * 4; i++) rnd[i] = rng.next();
    g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    this.uniforms.uMode.value = mode === 'suck' ? 0 : 1;
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: mode === 'suck' ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: /* glsl */ `
        attribute float aH; attribute vec4 aRnd;
        uniform float uTime, uT0, uSweep, uFly, uSize, uScale, uMode;
        uniform vec3 uTarget, uWind;
        varying float vA; varying float vK;
        void main(){
          float release = uT0 + aH * uSweep + aRnd.x * 0.35;
          float k = clamp((uTime - release) / (uFly * (0.7 + aRnd.y * 0.6)), 0.0, 1.0);
          vec3 p = position;
          if (uMode < 0.5) {
            // sugs upp i en virvel mot målet
            float e = k * k * (3.0 - 2.0 * k);
            vec3 to = uTarget + (aRnd.xyz - 0.5) * 6.0;
            float ang = e * 6.0 + aRnd.w * 6.28;
            vec3 swirl = vec3(cos(ang), 0.0, sin(ang)) * (1.0 - e) * e * 8.0 * uScale;
            p = mix(position, to, e * e) + swirl + vec3(0.0, e * (1.0 - e) * 10.0 * uScale, 0.0);
          } else {
            // damm som blåser bort och sjunker
            float e = k;
            vec3 turb = vec3(sin(e * 9.0 + aRnd.x * 20.0), cos(e * 7.0 + aRnd.y * 20.0) * 0.5, sin(e * 5.0 + aRnd.z * 20.0)) * 0.25 * e;
            p = position + uWind * (e * e * 4.0 + e * 0.6) * (0.6 + aRnd.z) + turb + vec3(0.0, -e * e * 0.4, 0.0);
            p.y = max(p.y, 0.01);
          }
          vK = k;
          vA = step(0.0001, uTime - release) * (1.0 - smoothstep(0.6, 1.0, k));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.4 + aRnd.w) * (1.0 - k * 0.5) / max(0.5, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAlpha; uniform float uMode;
        varying float vA; varying float vK;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = (1.0 - smoothstep(0.1, 0.5, d)) * vA * uAlpha;
          if (a < 0.003) discard;
          if (uMode < 0.5) gl_FragColor = vec4(uColor * a, 1.0);
          else gl_FragColor = vec4(uColor, a * 0.85);
        }`,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.points.renderOrder = 7;
  }

  get isCaptured() {
    return this.captured;
  }

  /**
   * Provtar ytan på figuren i dess nuvarande (deterministiska) pose.
   * Positionerna lagras i partikelobjektets förälders koordinatsystem.
   */
  capture(fig: Figure) {
    fig.root.updateMatrixWorld(true);
    const parent = this.points.parent;
    if (parent) parent.updateMatrixWorld(true);
    const toLocal = parent ? parent.matrixWorld.clone().invert() : new THREE.Matrix4();
    const rng = new Rng(this.seed);
    const meshes = fig.meshes;
    const weights = meshes.map((m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3);
    const total = weights.reduce((a, b) => a + b, 0);
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute;
    const hAttr = this.points.geometry.attributes.aH as THREE.BufferAttribute;
    const a = new THREE.Vector3(),
      b = new THREE.Vector3(),
      c = new THREE.Vector3();
    const ra = new THREE.Vector3(),
      rb = new THREE.Vector3(),
      rc = new THREE.Vector3();
    for (let i = 0; i < this.count; i++) {
      let r = rng.next() * total;
      let mi = 0;
      while (r > weights[mi] && mi < meshes.length - 1) r -= weights[mi++];
      const g = meshes[mi].geometry;
      const P = g.attributes.position;
      const R = g.attributes.aRest;
      const triCount = weights[mi];
      const tIdx = Math.floor(rng.next() * triCount);
      const idx = (k: number) => (g.index ? g.index.getX(tIdx * 3 + k) : tIdx * 3 + k);
      a.fromBufferAttribute(P, idx(0));
      b.fromBufferAttribute(P, idx(1));
      c.fromBufferAttribute(P, idx(2));
      ra.fromBufferAttribute(R, idx(0));
      rb.fromBufferAttribute(R, idx(1));
      rc.fromBufferAttribute(R, idx(2));
      let u = rng.next(),
        v = rng.next();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      const w = 1 - u - v;
      const p = a
        .clone()
        .multiplyScalar(w)
        .addScaledVector(b, u)
        .addScaledVector(c, v)
        .applyMatrix4(meshes[mi].matrixWorld)
        .applyMatrix4(toLocal);
      const h = (ra.y * w + rb.y * u + rc.y * v) / fig.p.height;
      pos.setXYZ(i, p.x, p.y, p.z);
      hAttr.setX(i, h);
    }
    pos.needsUpdate = true;
    hAttr.needsUpdate = true;
    this.captured = true;
  }
}
