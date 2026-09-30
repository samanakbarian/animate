// Världen: mark, himmel, dimma, ljus, rekvisita per epok och lyktor.
// Miljön byts gradvis med positionen längs vägen, inte med hårda klipp.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Rng, clamp, hash2, lerp, smoothstep } from '../core/math';
import { ASI_X, eraRanges, stepX } from '../timeline';
import { Ground, PlanarReflection } from './ground';
import { Sky } from './sky';
import {
  bake, cityBlocks, cityMaterial, coneGeometry, coneMaterial, crtBody, crtScreenMaterial, deadTree, groundCable,
  lanternGeometry, ledMaterial, merge, powerPole, rackGeometry, ridge, rock, silhouetteMaterial, wire,
} from './props';
import { GLSL_NOISE, withFog } from './shaderlib';

export interface Lamp {
  pos: THREE.Vector3;
  color: THREE.Color;
  intensity: number;
  seed: number;
  broken: boolean;
  cone?: THREE.Mesh;
}

const C = (hex: number) => new THREE.Color(hex);

/** Epokernas stämning. Blandas utifrån kamerans x. */
interface Mood {
  fog: THREE.Color;
  density: number;
  skyTop: THREE.Color;
  skyHorizon: THREE.Color;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  key: THREE.Color;
  keyI: number;
  env: number;
}

const MOODS: Record<string, Mood> = {
  wild: { fog: C(0x4a4038), density: 0.028, skyTop: C(0x100f0e), skyHorizon: C(0x5c5046), hemiSky: C(0x75675a), hemiGround: C(0x1a1612), key: C(0xd0c3b2), keyI: 3.0, env: 0.45 },
  wires: { fog: C(0x323c47), density: 0.028, skyTop: C(0x0a0c0f), skyHorizon: C(0x3e4a56), hemiSky: C(0x5b6978), hemiGround: C(0x0d1013), key: C(0xb4c8e0), keyI: 3.4, env: 0.45 },
  servers: { fog: C(0x243039), density: 0.03, skyTop: C(0x06080a), skyHorizon: C(0x2e3b47), hemiSky: C(0x4a5b6e), hemiGround: C(0x0a0c0e), key: C(0xa8c0de), keyI: 3.6, env: 0.45 },
  white: { fog: C(0x8c949b), density: 0.026, skyTop: C(0x6f767d), skyHorizon: C(0xb7bec4), hemiSky: C(0xc6ccd2), hemiGround: C(0x3c4044), key: C(0xe8eef6), keyI: 3.0, env: 0.8 },
  void: { fog: C(0x2e3134), density: 0.022, skyTop: C(0x0b0c0d), skyHorizon: C(0x3d4144), hemiSky: C(0x5a5f63), hemiGround: C(0x101112), key: C(0xb9c4cf), keyI: 2.2, env: 0.4 },
  sick: { fog: C(0x8d8f88), density: 0.02, skyTop: C(0x6b6d68), skyHorizon: C(0xb3b4ab), hemiSky: C(0xb0b1a8), hemiGround: C(0x2e2f2c), key: C(0xdcdcd0), keyI: 2.2, env: 0.7 },
  end: { fog: C(0x1d2124), density: 0.028, skyTop: C(0x050606), skyHorizon: C(0x2a2e31), hemiSky: C(0x3b4146), hemiGround: C(0x0a0b0c), key: C(0x9fb0c2), keyI: 1.4, env: 0.25 },
};

function blendMood(a: Mood, b: Mood, k: number, out: Mood): Mood {
  out.fog.copy(a.fog).lerp(b.fog, k);
  out.density = lerp(a.density, b.density, k);
  out.skyTop.copy(a.skyTop).lerp(b.skyTop, k);
  out.skyHorizon.copy(a.skyHorizon).lerp(b.skyHorizon, k);
  out.hemiSky.copy(a.hemiSky).lerp(b.hemiSky, k);
  out.hemiGround.copy(a.hemiGround).lerp(b.hemiGround, k);
  out.key.copy(a.key).lerp(b.key, k);
  out.keyI = lerp(a.keyI, b.keyI, k);
  out.env = lerp(a.env, b.env, k);
  return out;
}
const cloneMood = (m: Mood): Mood => ({ ...m, fog: m.fog.clone(), skyTop: m.skyTop.clone(), skyHorizon: m.skyHorizon.clone(), hemiSky: m.hemiSky.clone(), hemiGround: m.hemiGround.clone(), key: m.key.clone() });

export interface WorldState {
  t: number;
  focusX: number;
  focusZ: number;
  /** 0..1: himlen blir sjukligt ljusgrå (ASI). */
  sick: number;
  /** 0..1: slutscenens stämning. */
  end: number;
  flash: number;
  /** Ljusnivå för allt utom strukturen (slutet dämpar). */
  dim: number;
  rain: number;
}

export class World {
  readonly scene: THREE.Scene;
  readonly reflection = new PlanarReflection();
  readonly ground: Ground;
  readonly sky = new Sky();
  readonly key: THREE.DirectionalLight;
  readonly fill: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly fog: THREE.FogExp2;
  readonly lamps: Lamp[] = [];
  readonly lampLights: THREE.PointLight[] = [];
  private bulbs: { mat: THREE.MeshBasicMaterial; base: THREE.Color }[] = [];
  readonly animated: THREE.ShaderMaterial[] = [];
  private mood = cloneMood(MOODS.wild);
  private mistMat!: THREE.ShaderMaterial;
  private cityMat!: THREE.ShaderMaterial;
  private ledMat!: THREE.ShaderMaterial;
  private crtMat!: THREE.ShaderMaterial;
  private eraGroups: Record<string, THREE.Group> = {};
  private city!: THREE.Mesh;
  private ridges: THREE.Mesh[] = [];
  shadowSize = 2048;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.fog = new THREE.FogExp2(0x1b2127, 0.03);
    scene.fog = this.fog;
    scene.add(this.sky.mesh);
    this.sky.mesh.onBeforeRender = (_r, _s, cam) => {
      this.sky.mesh.position.copy(cam.position);
      this.sky.mesh.updateMatrixWorld();
    };
    this.ground = new Ground(this.reflection);
    scene.add(this.ground.mesh);

    // Nyckelljus: kallt, lågt, bakifrån → tydlig kantlinje.
    this.key = new THREE.DirectionalLight(0xa9bfd9, 3);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(this.shadowSize, this.shadowSize);
    this.key.shadow.radius = 6;
    this.key.shadow.blurSamples = 12;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.02;
    const sc = this.key.shadow.camera;
    sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 0.5; sc.far = 40;
    scene.add(this.key, this.key.target);
    this.fill = new THREE.DirectionalLight(0x7d8b9e, 0.8);
    scene.add(this.fill, this.fill.target);
    this.hemi = new THREE.HemisphereLight(0x4a5866, 0x0b0d10, 0.5);
    scene.add(this.hemi);

    for (let i = 0; i < 3; i++) {
      const l = new THREE.PointLight(0xffc98a, 0, 16, 2);
      this.lampLights.push(l);
      scene.add(l);
    }

    this.buildMist();
    this.buildWild();
    this.buildWires();
    this.buildServers();
    this.buildWhite();
    this.buildLanterns();
  }

  private group(name: string) {
    const g = new THREE.Group();
    g.name = name;
    this.scene.add(g);
    this.eraGroups[name] = g;
    return g;
  }

  private buildMist() {
    // Dimbankar i djupled: stora plan med drivande brus. Ger känslan av volym.
    this.mistMat = new THREE.ShaderMaterial({
      uniforms: withFog({ uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uAmount: { value: 1 } }),
      transparent: true,
      depthWrite: false,
      fog: true,
      vertexShader: /* glsl */ `
        varying vec3 vW; varying vec2 vUv;
        #include <fog_pars_vertex>
        void main(){
          vUv = uv;
          vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uColor; uniform float uAmount;
        varying vec3 vW; varying vec2 vUv;
        #include <fog_pars_fragment>
        ${GLSL_NOISE}
        void main(){
          vec2 p = vec2(vW.x * 0.06 + uTime * 0.03, vW.y * 0.12);
          float n = fbm2(p + vec2(vW.z * 0.1, 0.0));
          n = smoothstep(0.3, 0.85, n);
          float v = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y));
          float a = n * v * 0.32 * uAmount;
          gl_FragColor = vec4(uColor, a);
          #include <fog_fragment>
        }`,
    });
    this.animated.push(this.mistMat);
    const g = new THREE.Group();
    for (const [z, h] of [[-3.8, 5], [-9, 9], [-18, 16], [3.2, 3.2]] as const) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(90, h, 1, 1), this.mistMat);
      m.position.set(0, h / 2 - 0.2, z);
      m.userData.follow = true;
      m.userData.dz = z - 6.2;
      m.renderOrder = 2;
      g.add(m);
    }
    g.name = 'mist';
    this.scene.add(g);
    this.eraGroups.mist = g;
  }

  private range(era: keyof ReturnType<typeof eraRanges>, pad = 0): [number, number] {
    const r = eraRanges()[era];
    return [r[0] - pad, r[1] + pad];
  }

  private buildWild() {
    const g = this.group('wild');
    const rng = new Rng(101);
    const [x0, x1] = this.range('wild', 6);
    const trees: THREE.BufferGeometry[] = [];
    const rocks: THREE.BufferGeometry[] = [];
    for (let x = x0 + 4; x < x1; x += rng.range(3.5, 8)) {
      const z = -rng.range(2.6, 22);
      trees.push(...deadTree(rng, new THREE.Vector3(x, 0, z), rng.range(3.5, 7.5)));
      if (rng.next() < 0.35) trees.push(...deadTree(rng, new THREE.Vector3(x + rng.range(-2, 2), 0, rng.range(2.2, 3.4)), rng.range(2.5, 4)));
    }
    for (let x = x0; x < x1 + 8; x += rng.range(1.2, 3.2)) {
      const z = rng.next() < 0.75 ? -rng.range(1.2, 14) : rng.range(1.2, 3.5);
      rocks.push(rock(rng, new THREE.Vector3(x, 0, z), rng.range(0.15, z < -6 ? 1.3 : 0.55)));
    }
    const wood = new THREE.MeshStandardMaterial({ color: 0x1d1814, roughness: 0.92 });
    const stone = new THREE.MeshStandardMaterial({ color: 0x3b3935, roughness: 0.88 });
    const tm = new THREE.Mesh(merge(trees), wood);
    tm.castShadow = true;
    const rm = new THREE.Mesh(merge(rocks), stone);
    rm.castShadow = true;
    rm.receiveShadow = true;
    g.add(tm, rm);
    // Bergssiluetter i disen (hela vägen, högre i början).
    const r1 = new THREE.Mesh(ridge(-120, stepX('chatgpt') + 20, -70, 22, 5), silhouetteMaterial(new THREE.Color(0x0b0b0b), 0.38));
    const r2 = new THREE.Mesh(ridge(-160, ASI_X + 200, -140, 48, 9, 5), silhouetteMaterial(new THREE.Color(0x0a0a0a), 0.2));
    const r3 = new THREE.Mesh(ridge(-200, ASI_X + 300, -260, 90, 13, 8), silhouetteMaterial(new THREE.Color(0x090909), 0.13));
    this.scene.add(r1, r2, r3);
    this.ridges.push(r1, r2, r3);
  }

  private buildWires() {
    const g = this.group('wires');
    const rng = new Rng(202);
    const [x0, x1] = this.range('wires', 8);
    const poles: THREE.BufferGeometry[] = [];
    const wires: THREE.BufferGeometry[] = [];
    let prev: THREE.Vector3[] | null = null;
    for (let x = x0; x < x1; x += rng.range(11, 15)) {
      const lean = rng.next() < 0.3 ? rng.range(-0.18, 0.18) : rng.range(-0.04, 0.04);
      const { geo, tops } = powerPole(rng, new THREE.Vector3(x, 0, -5.2 + rng.range(-0.4, 0.4)), lean);
      poles.push(...geo);
      if (prev) {
        for (let i = 0; i < tops.length; i++) {
          const snapped = rng.next() < 0.12;
          const sag = snapped ? 12 : rng.range(0.9, 2.2);
          wires.push(wire(prev[i], tops[i], sag));
        }
      }
      prev = tops;
      // en andra rad längre bort
      if (rng.next() < 0.6) {
        const { geo: g2 } = powerPole(rng, new THREE.Vector3(x + 5, 0, -19), rng.range(-0.1, 0.1));
        poles.push(...g2);
      }
    }
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x17140f, roughness: 0.85 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.3 });
    const pm = new THREE.Mesh(merge(poles), poleMat);
    pm.castShadow = true;
    g.add(pm, new THREE.Mesh(merge(wires), wireMat));

    // Övergivna CRT-skärmar på marken.
    const bodies: THREE.BufferGeometry[] = [];
    const screens: THREE.BufferGeometry[] = [];
    for (let x = x0 + 3; x < x1; x += rng.range(2.5, 6)) {
      const front = rng.next() < 0.22;
      const z = front ? rng.range(1.3, 2.4) : -rng.range(1.2, 6);
      const tip = rng.next() < 0.2 ? rng.range(-0.6, -0.3) : 0;
      const face = front ? rng.range(2.4, 3.9) : rng.range(-0.9, 0.9);
      const { body, screen } = crtBody(new THREE.Vector3(x, 0, z), face, tip, rng.range(0.85, 1.25));
      bodies.push(body);
      const seed = rng.next();
      const n = screen.attributes.position.count;
      screen.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(n).fill(seed), 1));
      screens.push(screen);
      if (rng.next() < 0.3) {
        const { body: b2, screen: s2 } = crtBody(new THREE.Vector3(x + 0.6, 0, z - 0.4), face + 0.3, 0, 0.9);
        bodies.push(b2);
        s2.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(s2.attributes.position.count).fill(rng.next()), 1));
        screens.push(s2);
      }
    }
    const plastic = new THREE.MeshStandardMaterial({ color: 0x3a3833, roughness: 0.6 });
    const bm = new THREE.Mesh(merge(bodies), plastic);
    bm.castShadow = true;
    bm.receiveShadow = true;
    this.crtMat = crtScreenMaterial();
    this.animated.push(this.crtMat);
    g.add(bm, new THREE.Mesh(merge(screens), this.crtMat));
  }

  private buildServers() {
    const g = this.group('servers');
    const rng = new Rng(303);
    const [x0, x1] = this.range('servers', 4);
    const rack = rackGeometry();
    const racks: THREE.BufferGeometry[] = [];
    const leds: { m: THREE.Matrix4; a: number[] }[] = [];
    const cones: THREE.Vector3[] = [];
    const warn: THREE.Vector3[] = [];
    const rows = [
      { z: -3.4, gap: 0.15, face: 1 },
      { z: -7.5, gap: 0.2, face: 1 },
      { z: -12, gap: 0.2, face: 1 },
    ];
    for (const row of rows) {
      let x = x0 + rng.range(0, 3);
      while (x < x1) {
        const n = rng.int(4, 9);
        for (let i = 0; i < n && x < x1; i++) {
          const h = 1;
          const rot = rng.range(-0.02, 0.02);
          const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 0, row.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0)), new THREE.Vector3(1, h, 1));
          racks.push(bake(rack, m));
          // lampor på framsidan
          if (row.z > -13) {
            const cnt = rng.int(6, 16);
            for (let k = 0; k < cnt; k++) {
              const lx = x + rng.range(-0.26, 0.26);
              const ly = rng.range(0.25, 2.0);
              const lm = new THREE.Matrix4().makeTranslation(lx, ly, row.z + 0.515);
              const red = rng.next() < 0.07 ? 1 : 0;
              leds.push({ m: lm, a: [rng.next(), rng.next(), red, rng.range(0.6, 1.4)] });
            }
          }
          if (row.z === -3.4 && rng.next() < 0.14) cones.push(new THREE.Vector3(x, 4.2, row.z + 1.1));
          if (rng.next() < 0.05) warn.push(new THREE.Vector3(x, 2.25, row.z + 0.2));
          x += 0.66 + row.gap * 0.1;
        }
        x += rng.range(1.5, 5);
      }
    }
    const metal = new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 0.42, metalness: 0.6 });
    const rm = new THREE.Mesh(merge(racks), metal);
    rm.castShadow = true;
    rm.receiveShadow = true;
    g.add(rm);

    this.ledMat = ledMaterial();
    this.animated.push(this.ledMat);
    const ledGeo = new THREE.PlaneGeometry(0.028, 0.028);
    const im = new THREE.InstancedMesh(ledGeo, this.ledMat, leds.length);
    const aLed = new Float32Array(leds.length * 4);
    leds.forEach((l, i) => {
      im.setMatrixAt(i, l.m);
      aLed.set(l.a, i * 4);
    });
    ledGeo.setAttribute('aLed', new THREE.InstancedBufferAttribute(aLed, 4));
    im.frustumCulled = false;
    g.add(im);

    // Varningslampor (rostrött) – små pulserande klot.
    const warnMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 0.35, 0.15) });
    for (const w of warn) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), warnMat);
      s.position.copy(w);
      g.add(s);
    }

    // Kablar på marken, några korsar vägen.
    const cables: THREE.BufferGeometry[] = [];
    for (let x = x0; x < x1; x += rng.range(1.2, 4)) cables.push(groundCable(rng, x, -3.0, rng.next() < 0.4 ? rng.range(1.5, 3.5) : rng.range(-1.5, 0.5)));
    const cm = new THREE.Mesh(merge(cables), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.35 }));
    cm.receiveShadow = true;
    g.add(cm);

    // Ljuskäglor från lampor över racken.
    for (const c of cones) {
      const cone = new THREE.Mesh(coneGeometry(0.12, 1.6, 4.2), coneMaterial(new THREE.Color(0.25, 0.55, 0.6), 0.35));
      cone.position.copy(c);
      cone.renderOrder = 3;
      g.add(cone);
      const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 2.2, 2.3) });
      this.bulbs.push({ mat: headMat, base: headMat.color.clone() });
      const lampHead = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.12, 12), headMat);
      lampHead.position.copy(c);
      g.add(lampHead);
      this.lamps.push({ pos: c.clone().add(new THREE.Vector3(0, -0.2, 0)), color: new THREE.Color(0x77d6e0), intensity: 9, seed: rng.next(), broken: false, cone });
    }

    // Stadssiluett långt bort.
    this.cityMat = cityMaterial();
    this.animated.push(this.cityMat);
    const city = new THREE.Mesh(cityBlocks(rng, x0 - 25, x1 + 10), this.cityMat);
    this.scene.add(city);
    this.city = city;
  }

  private buildWhite() {
    const g = this.group('white');
    const rng = new Rng(404);
    const [x0, x1] = this.range('white', 10);
    const mono: THREE.BufferGeometry[] = [];
    for (let x = x0 + 5; x < x1 + 20; x += rng.range(5, 11)) {
      const h = rng.range(4, 13);
      const w = rng.range(0.8, 2.2);
      const d = rng.range(0.4, 1.0);
      const z = -rng.range(5, 36);
      const box = new RoundedBoxGeometry(w, h, d, 4, 0.08);
      mono.push(bake(box, new THREE.Matrix4().compose(new THREE.Vector3(x, h / 2 - 0.05, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng.range(-0.5, 0.5), 0)), new THREE.Vector3(1, 1, 1))));
    }
    const m = new THREE.Mesh(merge(mono), new THREE.MeshStandardMaterial({ color: 0xe9ecef, roughness: 0.3, metalness: 0.0, emissive: 0x6b7178, emissiveIntensity: 0.25 }));
    m.castShadow = true;
    g.add(m);
  }

  private buildLanterns() {
    const rng = new Rng(505);
    const x0 = stepX('transformer') - 4;
    const x1 = stepX('agi') - 6;
    const geos: THREE.BufferGeometry[] = [];
    for (let x = x0 + 6; x < x1; x += rng.range(15, 24)) {
      const z = -2.3 + rng.range(-0.3, 0.2);
      const { geo, head } = lanternGeometry(new THREE.Vector3(x, 0, z), rng.range(4.3, 4.9), 1);
      geos.push(geo);
      const broken = rng.next() < 0.25;
      const cone = new THREE.Mesh(coneGeometry(0.2, 2.2, head.y), coneMaterial(new THREE.Color(1.0, 0.72, 0.42), broken ? 0 : 0.42));
      cone.position.copy(head);
      cone.renderOrder = 3;
      this.scene.add(cone);
      const bulbMat = new THREE.MeshBasicMaterial({ color: broken ? new THREE.Color(0.05, 0.05, 0.05) : new THREE.Color(4, 2.6, 1.4) });
      this.bulbs.push({ mat: bulbMat, base: bulbMat.color.clone() });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bulbMat);
      bulb.position.copy(head);
      this.scene.add(bulb);
      this.lamps.push({ pos: head.clone(), color: new THREE.Color(0xffb56b), intensity: broken ? 0 : 14, seed: rng.next(), broken, cone });
    }
    const mesh = new THREE.Mesh(merge(geos), new THREE.MeshStandardMaterial({ color: 0x121314, roughness: 0.5, metalness: 0.7 }));
    mesh.castShadow = true;
    this.scene.add(mesh);
  }

  /** Enstaka flimmer för lyktor (deterministiskt). */
  static lampFlicker(seed: number, t: number) {
    const q = Math.floor(t * 20 + seed * 100);
    return hash2(q, Math.floor(seed * 1e4)) < 0.06 ? 0.2 : 1;
  }

  update(s: WorldState, camera: THREE.PerspectiveCamera) {
    const t = s.t;
    for (const a of this.animated) a.uniforms.uTime.value = t;
    this.ground.uniforms.uTime.value = t;
    this.ground.uniforms.uRain.value = s.rain;
    this.sky.uniforms.uTime.value = t;

    // Stämning utifrån position längs vägen.
    const x = s.focusX;
    const R = eraRanges();
    const order: (keyof typeof R)[] = ['wild', 'wires', 'servers', 'white', 'void'];
    let a = MOODS.wild, b = MOODS.wild, k = 0;
    for (let i = 0; i < order.length; i++) {
      const [r0, r1] = R[order[i]];
      if (x >= r0 - 1e-6 && (x < r1 || i === order.length - 1)) {
        a = MOODS[order[i]];
        const next = order[i + 1];
        b = next ? MOODS[next] : a;
        k = next ? smoothstep(r1 - 9, r1 + 3, x) : 0;
        const prev = order[i - 1];
        if (prev && x < r0 + 3) {
          b = a;
          a = MOODS[prev];
          k = smoothstep(r0 - 9, r0 + 3, x);
        }
        break;
      }
    }
    const m = blendMood(a, b, k, this.mood);
    if (s.sick > 0) blendMood(m, MOODS.sick, s.sick, m);
    if (s.end > 0) blendMood(m, MOODS.end, s.end, m);

    this.fog.color.copy(m.fog).multiplyScalar(lerp(1, 0.55, 1 - s.dim));
    this.fog.density = m.density;
    this.sky.uniforms.uTop.value.copy(m.skyTop).multiplyScalar(s.dim * 0.7 + 0.3);
    // Horisonten möter dimfärgen så att dimmiga former smälter in i himlen.
    this.sky.uniforms.uHorizon.value.copy(this.fog.color);
    this.sky.uniforms.uFlash.value = s.flash;
    // Disigt motljus i himlen bakom figuren (samma håll som nyckelljuset).
    this.sky.uniforms.uGlow.value.set(0.22, 0.12, -1);
    this.sky.uniforms.uGlowColor.value.copy(m.key).multiplyScalar(0.16 * s.dim);
    if (s.end > 0) {
      // I slutet lyser disen runt strukturen – det enda ljuset som blir kvar.
      this.sky.uniforms.uGlow.value.set(-0.06, 0.3, -1);
      this.sky.uniforms.uGlowColor.value.setRGB(0.15, 0.16, 0.18);
    }
    this.hemi.color.copy(m.hemiSky);
    this.hemi.groundColor.copy(m.hemiGround);
    this.hemi.intensity = 0.9 * s.dim + s.flash * 2;
    this.key.color.copy(m.key);
    this.key.intensity = m.keyI * s.dim + s.flash * 6;
    this.fill.intensity = 0.85 * s.dim;
    this.scene.environmentIntensity = m.env * (0.3 + 0.7 * s.dim);
    this.mistMat.uniforms.uColor.value.copy(m.fog).multiplyScalar(1.25);
    this.mistMat.uniforms.uAmount.value = 1;
    this.ground.uniforms.uTint.value.setScalar(1);

    // Följ figuren med ljus och dimbankar.
    const kx = s.focusX;
    const kz = s.focusZ;
    this.key.position.set(kx + 3.0, 4.2, kz - 10);
    this.key.target.position.set(kx, 0.8, kz);
    this.fill.position.set(kx - 2, 3, kz + 12);
    this.fill.target.position.set(kx, 1, kz);
    for (const c of this.eraGroups.mist.children) {
      if (!c.userData.follow) continue;
      c.position.x = camera.position.x;
      c.position.z = camera.position.z + c.userData.dz;
    }

    // Synlighet per epok (enkel avståndskulling för prestanda).
    const cx = camera.position.x;
    const vis = (name: string, pad = 60) => {
      const r = (R as any)[name] as [number, number];
      this.eraGroups[name].visible = cx > r[0] - pad && cx < r[1] + pad;
    };
    vis('wild');
    vis('wires');
    vis('servers');
    vis('white', 80);
    // Staden och bergen hör inte hemma i ASI-tomrummet.
    // (tonas ut i dimman i stället för att poppa bort)
    const sr = R.servers;
    const cityFade = Math.max(1 - smoothstep(sr[0] - 60, sr[0] - 30, cx), smoothstep(sr[1] - 12, sr[1] + 6, cx));
    this.cityMat.uniforms.uFade.value = cityFade;
    this.city.visible = cityFade < 0.999;
    const ridgeFade = s.end > 0 ? 0.8 : smoothstep(R.white[1] - 30, R.white[1], cx);
    for (const r of this.ridges) {
      (r.material as THREE.ShaderMaterial).uniforms.uFade.value = ridgeFade;
      r.visible = ridgeFade < 0.999;
    }

    // Tre punktljus flyttas till de närmaste lyktorna (deterministiskt).
    const near = this.lamps
      .map((l, i) => ({ l, i, d: Math.abs(l.pos.x - kx) }))
      .filter((e) => !e.l.broken)
      .sort((p, q2) => p.d - q2.d || p.i - q2.i)
      .slice(0, 3);
    for (let i = 0; i < this.lampLights.length; i++) {
      const L = this.lampLights[i];
      const e = near[i];
      if (!e || e.d > 22) {
        L.intensity = 0;
        continue;
      }
      L.position.copy(e.l.pos);
      L.color.copy(e.l.color);
      L.intensity = e.l.intensity * World.lampFlicker(e.l.seed, t) * clamp(1 - (e.d - 12) / 10) * s.dim;
    }
    for (const l of this.lamps) {
      if (!l.cone) continue;
      const u = (l.cone.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = t;
      if (l.cone.userData.base === undefined) l.cone.userData.base = u.uStrength.value;
      u.uStrength.value = l.cone.userData.base * s.dim * s.dim;
    }
    for (const b of this.bulbs) b.mat.color.copy(b.base).multiplyScalar(s.dim * s.dim);
    this.ledMat.uniforms.uAmount.value = s.dim * s.dim;
    this.crtMat.uniforms.uAmount.value = s.dim * s.dim;
  }
}
