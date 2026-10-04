// Procedurell rekvisita för varje epok. Allt placeras med seedad slump så att
// världen blir identisk varje gång.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Rng, fbm1 } from '../core/math';
import { GLSL_NOISE, withFog } from './shaderlib';

/** Tar en geometri, applicerar matris och behåller bara position/normal (+ extra). */
export function bake(g: THREE.BufferGeometry, m: THREE.Matrix4, extra?: Record<string, number[]>): THREE.BufferGeometry {
  const o = g.index ? g.toNonIndexed() : g.clone();
  for (const k of Object.keys(o.attributes)) if (k !== 'position' && k !== 'normal') o.deleteAttribute(k);
  o.applyMatrix4(m);
  if (extra) {
    const n = o.attributes.position.count;
    for (const [k, v] of Object.entries(extra)) {
      const arr = new Float32Array(n * v.length);
      for (let i = 0; i < n; i++) for (let j = 0; j < v.length; j++) arr[i * v.length + j] = v[j];
      o.setAttribute(k, new THREE.BufferAttribute(arr, v.length));
    }
  }
  return o;
}

export function merge(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (!list.length) return new THREE.BufferGeometry();
  const m = mergeGeometries(list, false)!;
  m.computeBoundingSphere();
  return m;
}

const M = () => new THREE.Matrix4();
const q = new THREE.Quaternion();
const v1 = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

/** Cylinder från a till b. */
function segment(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, radial = 6): THREE.BufferGeometry {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r1, r0, len, radial, 1, false);
  g.translate(0, len / 2, 0);
  v1.subVectors(b, a).normalize();
  q.setFromUnitVectors(up, v1);
  return bake(g, M().compose(a, q, new THREE.Vector3(1, 1, 1)));
}

// ---------------------------------------------------------------------------
// Människans epok: döda träd, stenar, bergssiluetter

export function deadTree(rng: Rng, base: THREE.Vector3, height: number): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const grow = (p: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const end = p.clone().addScaledVector(dir, len);
    out.push(segment(p, end, r, r * 0.62, depth > 2 ? 7 : 5));
    if (depth <= 0 || r < 0.012) return;
    const n = depth > 2 ? 2 : rng.int(2, 3);
    for (let i = 0; i < n; i++) {
      const d = dir.clone();
      const ax = new THREE.Vector3(rng.range(-1, 1), rng.range(-0.2, 0.3), rng.range(-1, 1)).normalize();
      d.applyAxisAngle(ax, rng.range(0.35, 0.85)).normalize();
      d.y = Math.max(d.y, -0.15);
      d.normalize();
      grow(end, d, len * rng.range(0.55, 0.78), r * 0.62, depth - 1);
    }
  };
  const d0 = new THREE.Vector3(rng.range(-0.15, 0.15), 1, rng.range(-0.15, 0.15)).normalize();
  grow(base, d0, height * 0.42, height * 0.035, 5);
  return out;
}

export function rock(rng: Rng, pos: THREE.Vector3, size: number): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const p = g.attributes.position;
  const seed = rng.int(0, 9999);
  for (let i = 0; i < p.count; i++) {
    v1.fromBufferAttribute(p, i);
    const n = 1 + 0.28 * fbm1(v1.x * 1.7 + v1.y * 2.3 + v1.z * 3.1 + seed, seed, 3);
    v1.multiplyScalar(n);
    p.setXYZ(i, v1.x, v1.y, v1.z);
  }
  g.computeVertexNormals();
  const s = new THREE.Vector3(size * rng.range(0.8, 1.4), size * rng.range(0.45, 0.8), size * rng.range(0.8, 1.3));
  const e = new THREE.Euler(rng.range(-0.3, 0.3), rng.range(0, 6.28), rng.range(-0.3, 0.3));
  return bake(g, M().compose(pos.clone().setY(size * 0.2), new THREE.Quaternion().setFromEuler(e), s));
}

/** Bergsrygg som ett band vars överkant följer brus. */
export function ridge(x0: number, x1: number, z: number, height: number, seed: number, step = 3): THREE.BufferGeometry {
  const pos: number[] = [];
  for (let x = x0; x < x1; x += step) {
    const h0 = height * (0.35 + 0.65 * (0.5 + 0.5 * fbm1(x * 0.012, seed, 4)));
    const h1 = height * (0.35 + 0.65 * (0.5 + 0.5 * fbm1((x + step) * 0.012, seed, 4)));
    pos.push(x, -2, z, x + step, -2, z, x + step, h1, z, x, -2, z, x + step, h1, z, x, h0, z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------
// Tidiga modeller: elstolpar med slaka ledningar, övergivna CRT-skärmar

export function powerPole(rng: Rng, base: THREE.Vector3, lean: number): { geo: THREE.BufferGeometry[]; tops: THREE.Vector3[] } {
  const h = 8.2;
  const out: THREE.BufferGeometry[] = [];
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(lean * 0.4, 0, lean));
  const top = new THREE.Vector3(0, h, 0).applyQuaternion(tilt).add(base);
  out.push(segment(base, top, 0.13, 0.1, 8));
  const arm = new THREE.Vector3(1, 0, 0).applyQuaternion(tilt);
  const armC = top.clone().addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(tilt), -0.5);
  const a0 = armC.clone().addScaledVector(arm, -1.25);
  const a1 = armC.clone().addScaledVector(arm, 1.25);
  out.push(segment(a0, a1, 0.06, 0.06, 5));
  const tops: THREE.Vector3[] = [];
  for (const k of [-1.1, -0.35, 0.35, 1.1]) {
    const p = armC.clone().addScaledVector(arm, k);
    const ins = p.clone().add(new THREE.Vector3(0, 0.22, 0));
    out.push(segment(p, ins, 0.035, 0.028, 5));
    tops.push(ins);
  }
  // en extra stag-lina ner till marken
  if (rng.next() < 0.5)
    out.push(
      segment(base.clone().add(new THREE.Vector3(rng.sign() * 2.5, 0, -1.5)), top.clone().addScaledVector(arm, 0.2), 0.012, 0.012, 3),
    );
  return { geo: out, tops };
}

export function wire(a: THREE.Vector3, b: THREE.Vector3, sag: number, r = 0.012): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const k = i / 20;
    const p = a.clone().lerp(b, k);
    p.y -= sag * 4 * k * (1 - k);
    p.y = Math.max(p.y, 0.03);
    pts.push(p);
  }
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 4, false);
  return bake(g, M());
}

export function crtBody(
  pos: THREE.Vector3,
  rotY: number,
  tip: number,
  size: number,
): { body: THREE.BufferGeometry; screen: THREE.BufferGeometry } {
  const body = new RoundedBoxGeometry(0.52 * size, 0.44 * size, 0.46 * size, 3, 0.05 * size);
  const back = new THREE.CylinderGeometry(0.12 * size, 0.2 * size, 0.28 * size, 12);
  back.rotateX(-Math.PI / 2);
  back.translate(0, -0.01 * size, -0.34 * size);
  const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(tip, rotY, 0));
  const m = M().compose(pos.clone().setY(0.22 * size + (tip ? 0.05 : 0)), quat, new THREE.Vector3(1, 1, 1));
  const screen = new THREE.PlaneGeometry(0.4 * size, 0.31 * size, 4, 4);
  // lätt buktig skärm
  const sp = screen.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i),
      y = sp.getY(i);
    sp.setZ(i, 0.232 * size + 0.02 * size * (1 - (x * x) / (0.04 * size * size) - (y * y) / (0.025 * size * size)));
  }
  screen.computeVertexNormals();
  const sg = screen.toNonIndexed();
  sg.applyMatrix4(m);
  return { body: merge([bake(body, m), bake(back, m)]), screen: sg };
}

export function crtScreenMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: withFog({ uTime: { value: 0 }, uAmount: { value: 1 } }),
    fog: true,
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying vec2 vUv; varying float vSeed;
      #include <fog_pars_vertex>
      void main(){
        vUv = uv; vSeed = aSeed;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uAmount;
      varying vec2 vUv; varying float vSeed;
      #include <fog_pars_fragment>
      ${GLSL_NOISE}
      void main(){
        float on = step(0.35, vSeed);
        float tq = floor(uTime * 24.0);
        float flick = step(0.12, h21(vec2(tq, vSeed * 91.0))) * (0.75 + 0.25 * h21(vec2(tq * 1.3, vSeed)));
        float burst = step(0.93, h21(vec2(floor(uTime * 3.0), vSeed * 13.0)));
        float stat = h21(vUv * 240.0 + vec2(tq * 3.1, tq));
        float scan = 0.75 + 0.25 * sin(vUv.y * 260.0 + uTime * 30.0);
        float roll = smoothstep(0.0, 0.08, abs(fract(vUv.y - uTime * 0.15 * (0.5 + vSeed)) - 0.5));
        vec2 c = vUv - 0.5;
        float vig = smoothstep(0.75, 0.2, length(c * vec2(1.0, 1.25)));
        vec3 tint = mix(vec3(0.55, 0.8, 0.85), vec3(0.8, 0.85, 1.0), vSeed);
        vec3 col = tint * (0.25 + 0.75 * stat) * scan * vig * flick * on * (0.7 + 0.3 * roll);
        col *= 0.9 * uAmount * (1.0 + burst);
        // släckta skärmar: mörkt glas med lite reflex
        col += vec3(0.02, 0.025, 0.03) * (1.0 - on) + vec3(0.03) * pow(1.0 - vUv.y, 3.0);
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }`,
  });
}

// ---------------------------------------------------------------------------
// Serverrack med blinkande lampor

export function rackGeometry(): THREE.BufferGeometry {
  const g = new RoundedBoxGeometry(0.66, 2.15, 1.0, 2, 0.03);
  g.translate(0, 1.075, 0);
  const frame = bake(g, M());
  // horisontella luftspringor på framsidan
  const slots: THREE.BufferGeometry[] = [frame];
  for (let i = 0; i < 9; i++) {
    const s = new THREE.BoxGeometry(0.58, 0.012, 0.02);
    slots.push(bake(s, M().makeTranslation(0, 0.25 + i * 0.2, 0.505)));
  }
  return merge(slots);
}

export function ledMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: withFog({ uTime: { value: 0 }, uAmount: { value: 1 } }),
    fog: true,
    vertexShader: /* glsl */ `
      attribute vec4 aLed; // seed, rate, röd?, ljusstyrka
      varying vec4 vLed; varying vec2 vUv;
      #include <fog_pars_vertex>
      void main(){
        vLed = aLed; vUv = uv;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uAmount;
      varying vec4 vLed; varying vec2 vUv;
      #include <fog_pars_fragment>
      ${GLSL_NOISE}
      void main(){
        float t = uTime * (1.0 + vLed.y * 6.0) + vLed.x * 40.0;
        float blink = step(0.45, h11(floor(t)));
        if (vLed.z > 0.5) blink = 0.35 + 0.65 * step(0.5, fract(uTime * 0.8 + vLed.x));
        vec2 c = vUv - 0.5;
        float d = 1.0 - smoothstep(0.2, 0.5, length(c));
        vec3 col = vLed.z > 0.5 ? vec3(3.2, 0.35, 0.18) : vec3(0.25, 2.6, 2.3);
        col *= d * blink * vLed.w * uAmount;
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }`,
  });
}

// ---------------------------------------------------------------------------
// Volymetriska ljuskäglor (additiva, mjuka)

export function coneMaterial(color: THREE.Color, strength = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uStrength: { value: strength }, uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying float vY; varying vec3 vN; varying vec3 vV; varying vec3 vW;
      uniform float uTime;
      void main(){
        vY = uv.y;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uStrength; uniform float uTime;
      varying float vY; varying vec3 vN; varying vec3 vV; varying vec3 vW;
      ${GLSL_NOISE}
      void main(){
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float soft = pow(facing, 2.2);
        float along = pow(vY, 1.6);            // starkast vid ljuskällan (uv.y=1 i toppen)
        float dust = 0.65 + 0.35 * fbm2(vW.xy * 1.3 + vec2(0.0, -uTime * 0.25));
        float groundFade = smoothstep(0.0, 0.6, vW.y);
        float a = soft * along * dust * groundFade * uStrength;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });
}

export function coneGeometry(topR: number, botR: number, h: number) {
  const g = new THREE.CylinderGeometry(topR, botR, h, 32, 1, true);
  g.translate(0, -h / 2, 0);
  return g;
}

// ---------------------------------------------------------------------------
// Stadssiluett långt bort (få tända fönster)

export function cityMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: withFog({ uTime: { value: 0 }, uLit: { value: 1 }, uFade: { value: 0 } }),
    fog: true,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN;
      #include <fog_pars_vertex>
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normal;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uLit; uniform float uFade;
      varying vec3 vW; varying vec3 vN;
      #include <fog_pars_fragment>
      ${GLSL_NOISE}
      void main(){
        vec3 col = vec3(0.018, 0.02, 0.024);
        vec2 g = vec2(vW.x + vW.z, vW.y) * vec2(1.4, 0.9);
        vec2 cell = floor(g); vec2 f = fract(g);
        float win = step(0.2, f.x) * step(f.x, 0.75) * step(0.25, f.y) * step(f.y, 0.7);
        float r = h21(cell + floor(vW.x / 30.0) * 7.0);
        float lit = step(0.965, r) * win * step(0.5, abs(vN.z) + abs(vN.x));
        float flick = 0.8 + 0.2 * step(0.5, h21(cell + floor(uTime * 0.5)));
        vec3 wc = mix(vec3(1.4, 1.0, 0.6), vec3(0.6, 0.9, 1.3), step(0.985, r));
        col += wc * lit * flick * uLit;
        gl_FragColor = vec4(col, 1.0);
        #ifdef USE_FOG
          float d = 0.14 * fogDensity;
          float ff = 1.0 - exp(-d * d * vFogDepth * vFogDepth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, max(ff, uFade));
        #endif
      }`,
  });
}

export function cityBlocks(rng: Rng, x0: number, x1: number): THREE.BufferGeometry {
  const list: THREE.BufferGeometry[] = [];
  for (let x = x0; x < x1; x += rng.range(6, 14)) {
    const w = rng.range(6, 16),
      d = rng.range(6, 14),
      h = rng.range(14, 70);
    const z = -rng.range(170, 240);
    const g = new THREE.BoxGeometry(w, h, d);
    list.push(bake(g, M().makeTranslation(x, h / 2, z)));
    if (rng.next() < 0.3) {
      const s = new THREE.BoxGeometry(0.4, rng.range(6, 16), 0.4);
      list.push(bake(s, M().makeTranslation(x, h + 4, z)));
    }
  }
  return merge(list);
}

// ---------------------------------------------------------------------------
// Kablar på marken

export function groundCable(rng: Rng, x: number, z0: number, z1: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    pts.push(new THREE.Vector3(x + rng.range(-0.8, 0.8) + k * rng.range(-2, 2), 0.025, z0 + (z1 - z0) * k));
  }
  const r = rng.range(0.018, 0.035);
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 5, false);
  g.translate(0, r - 0.01, 0);
  return bake(g, M());
}

// ---------------------------------------------------------------------------
// Gatlykta

export function lanternGeometry(
  base: THREE.Vector3,
  h = 4.6,
  armDir: number | THREE.Vector3 = 1,
): { geo: THREE.BufferGeometry; head: THREE.Vector3 } {
  const list: THREE.BufferGeometry[] = [];
  const top = base.clone().setY(h);
  list.push(segment(base, top, 0.07, 0.045, 8));
  const arm = typeof armDir === 'number' ? new THREE.Vector3(0, 0, armDir) : armDir.clone().normalize();
  const armEnd = top
    .clone()
    .add(new THREE.Vector3(0, 0.05, 0))
    .addScaledVector(arm, 0.9);
  list.push(segment(top.clone().add(new THREE.Vector3(0, -0.1, 0)), armEnd, 0.03, 0.025, 5));
  const shade = new THREE.CylinderGeometry(0.1, 0.28, 0.2, 14, 1, false);
  const head = armEnd.clone().add(new THREE.Vector3(0, -0.12, 0));
  list.push(bake(shade, M().makeTranslation(head.x, head.y, head.z)));
  return { geo: merge(list), head: head.clone().add(new THREE.Vector3(0, -0.12, 0)) };
}

// ---------------------------------------------------------------------------
// Fjärran siluetter (berg, stad): egen, svagare dimma så att de läses som
// mörka, skiktade former mot den disiga himlen.

export function silhouetteMaterial(color: THREE.Color, fogScale: number) {
  return new THREE.ShaderMaterial({
    uniforms: withFog({ uColor: { value: color }, uFogScale: { value: fogScale }, uFade: { value: 0 } }),
    fog: true,
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      void main(){
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFogScale; uniform float uFade;
      #include <fog_pars_fragment>
      void main(){
        gl_FragColor = vec4(uColor, 1.0);
        #ifdef USE_FOG
          float d = uFogScale * fogDensity;
          float ff = 1.0 - exp(-d * d * vFogDepth * vFogDepth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, max(ff, uFade));
        #endif
      }`,
  });
}
