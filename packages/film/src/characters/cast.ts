// Alla figurer i filmen och hur de rör sig som funktion av t.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Figure, Pose, restPose } from '@nastasteg/engine/figure/rig';
import { LOOKS, LookId } from './looks';
import { STYLES, WalkStyle, lerpPose, lerpStyle, walkPose } from '@nastasteg/engine/figure/animation';
import type { FxMaterial } from '@nastasteg/engine/fx/figureMaterial';
import { Disintegrate } from '@nastasteg/engine/fx/particles';
import { Rng, clamp, easeInOutCubic, hash2, lerp, smoothstep } from '@nastasteg/engine/core/math';
import { STEPS, StepId, TRANSITION, transitionAt, walkSpeed, walkX } from '../timeline';

type MainId = Exclude<StepId, 'end'>;
const MAIN_IDS: MainId[] = [
  'human',
  'transformer',
  'gpt1',
  'gpt2',
  'gpt3',
  'chatgpt',
  'gpt4',
  'claude',
  'claude3',
  'reasoning',
  'claude4',
  'today',
  'agi',
  'asi',
];

export const ASI_TIMES = {
  flash: 108,
  growEnd: 116,
  dissolveStart: 116,
  dissolveEnd: 120.5,
};

export interface CastInfo {
  /** Figurens position (fötter). */
  pos: THREE.Vector3;
  /** Punkt kameran ska fokusera på (bröst/huvud). */
  focus: THREE.Vector3;
  /** Ovanför huvudet – för pratbubblan. */
  head: THREE.Vector3;
  height: number;
  scale: number;
  warmth: number;
  agiGlow: number;
  visible: boolean;
}

export class Cast {
  readonly group = new THREE.Group();
  readonly mains = {} as Record<MainId, Figure>;
  private echoes: Figure[] = [];
  private opus: Figure;
  private haiku: Figure;
  private agents: Figure[] = [];
  private agentOffsets: THREE.Vector3[] = [];
  readonly statues: Figure[] = [];
  private shards: THREE.InstancedMesh;
  private shardData: { r: number; y: number; sp: number; ph: number; tilt: number }[] = [];
  private thoughts: THREE.Points;
  private thoughtSeeds: number[] = [];
  readonly warmLight: THREE.PointLight;
  readonly agiLight: THREE.PointLight;
  readonly asiDust: Disintegrate;
  private tmpPose: Pose = restPose();
  private tmpPose2: Pose = restPose();
  private info: CastInfo = {
    pos: new THREE.Vector3(),
    focus: new THREE.Vector3(),
    head: new THREE.Vector3(),
    height: 1.75,
    scale: 1,
    warmth: 0,
    agiGlow: 0,
    visible: true,
  };
  private materials: FxMaterial[] = [];
  structureTarget = new THREE.Vector3();

  constructor() {
    this.group.name = 'cast';
    const mk = (id: LookId, name: string) => {
      const look = LOOKS[id];
      const mat = look.make();
      this.materials.push(mat);
      const f = new Figure(look.props, mat, name);
      mat.fx.uHeight.value = f.p.height;
      if (mat.fxOpts.headGlow) mat.fx.uHeadY.value = f.headTopY - 0.27 * f.p.head * f.s;
      f.root.visible = false;
      this.group.add(f.root);
      return f;
    };
    for (const id of MAIN_IDS) this.mains[id] = mk(id as LookId, id);
    this.mains.agi.setShadows(false);
    for (let i = 0; i < 3; i++) {
      const e = mk('echo', 'echo' + i);
      e.setShadows(false);
      (e.mat as FxMaterial).fx.uFade.value = [0.6, 0.38, 0.2][i];
      this.echoes.push(e);
    }
    this.opus = mk('opus', 'opus');
    this.haiku = mk('haiku', 'haiku');
    const agentMat = LOOKS.agent.make();
    this.materials.push(agentMat);
    const rng = new Rng(42);
    for (let i = 0; i < 10; i++) {
      const a = new Figure({ ...LOOKS.agent.props, height: 0.55 + rng.range(0, 0.18) }, agentMat, 'agent' + i);
      agentMat.fx.uHeight.value = 0.64;
      a.root.visible = false;
      a.setShadows(false);
      this.group.add(a.root);
      this.agents.push(a);
      // formation bakom och bredvid (inte mellan kamera och huvudfigur)
      this.agentOffsets.push(new THREE.Vector3(-0.9 - rng.range(0, 3.2), 0, -0.4 - rng.range(0, 2.2)));
    }

    // Statyer längs vägen: tidiga tittar ner, sena tittar upp.
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5b5a57, roughness: 0.9, metalness: 0 });
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x3a3937, roughness: 0.85 });
    const times = [5.5, 19, 33, 47.5, 62, 77, 96, 101.5];
    times.forEach((ts, i) => {
      const s = new Figure({ height: 1.8 + (i % 3) * 0.12, girth: 1 + (i % 2) * 0.06 }, stoneMat, 'statue' + i);
      const k = i / (times.length - 1);
      const p = restPose();
      p.head = lerp(0.55, -0.62, k);
      p.neck = lerp(0.3, -0.35, k);
      p.spineLean = lerp(0.18, -0.08, k);
      const armPose = i % 3;
      p.L.shoulder = armPose === 1 ? 0.35 : 0.05;
      p.L.elbow = armPose === 1 ? 1.6 : 0.2;
      p.R.shoulder = armPose === 2 ? -0.1 : 0.05;
      p.R.shoulderOut = armPose === 2 ? 0.35 : 0.08;
      p.L.thigh = 0.08;
      p.R.thigh = -0.06;
      s.applyPose(p);
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.4, 0.95, 2, 0.04), plinthMat);
      const x = walkX(ts) + 1.6;
      const z = -2.9 - (i % 2) * 1.1;
      plinth.position.set(x, 0.2, z);
      plinth.castShadow = plinth.receiveShadow = true;
      s.root.position.set(x, 0.4, z);
      s.root.rotation.y = -Math.PI / 2 + (i % 2 ? 0.35 : -0.3);
      this.group.add(s.root, plinth);
      this.statues.push(s);
    });

    // AGI: skärvor som kretsar runt kroppen.
    const sg = new THREE.OctahedronGeometry(1, 0);
    sg.scale(0.025, 0.09, 0.018);
    this.shards = new THREE.InstancedMesh(
      sg,
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 3.5, roughness: 0.2 }),
      22,
    );
    this.shards.frustumCulled = false;
    for (let i = 0; i < 22; i++)
      this.shardData.push({
        r: rng.range(0.5, 0.95),
        y: rng.range(0.5, 1.9),
        sp: rng.range(0.8, 1.8) * rng.sign(),
        ph: rng.range(0, 6.28),
        tilt: rng.range(-0.4, 0.4),
      });
    this.group.add(this.shards);

    // Resonerande: små ljuspartiklar som stiger som tankar.
    const N = 70;
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    tg.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(N), 1));
    for (let i = 0; i < N; i++) this.thoughtSeeds.push(rng.next());
    this.thoughts = new THREE.Points(
      tg,
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `attribute float aA; varying float vA; void main(){ vA = aA; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = 26.0 * (0.4 + aA) / max(0.5, -mv.z); }`,
        fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if (d>0.5) discard; float a = (1.0-smoothstep(0.0,0.5,d)) * vA; gl_FragColor = vec4(vec3(2.4,2.0,1.4)*a, 1.0); }`,
      }),
    );
    this.thoughts.frustumCulled = false;
    this.group.add(this.thoughts);

    this.warmLight = new THREE.PointLight(0xffa872, 0, 7, 2);
    this.agiLight = new THREE.PointLight(0xf2f6ff, 0, 14, 2);
    this.group.add(this.warmLight, this.agiLight);

    this.asiDust = new Disintegrate(9000, 'suck', 3);
    this.asiDust.uniforms.uT0.value = ASI_TIMES.dissolveStart;
    this.asiDust.uniforms.uSweep.value = ASI_TIMES.dissolveEnd - ASI_TIMES.dissolveStart - 0.6;
    this.asiDust.uniforms.uFly.value = 3.2;
    this.asiDust.uniforms.uSize.value = 260;
    this.asiDust.uniforms.uColor.value.setRGB(1.6, 1.65, 1.8);
    this.asiDust.uniforms.uScale.value = 6;
    this.group.add(this.asiDust.points);
  }

  /** Alla figurmaterial (för förkompilering). */
  allFigures(): Figure[] {
    return [...Object.values(this.mains), ...this.echoes, this.opus, this.haiku, ...this.agents];
  }

  private styleFor(id: MainId, t: number): WalkStyle {
    if (id === 'human') return lerpStyle(STYLES.primal, STYLES.human, smoothstep(0.5, 9.5, t));
    return STYLES[LOOKS[id as LookId].style];
  }

  /** Pose för en huvudfigur vid tid t (ren funktion). */
  private poseFor(id: MainId, fig: Figure, t: number, out: Pose): Pose {
    const st = this.styleFor(id, t);
    const tp = id === 'gpt1' ? Math.floor(t * 6) / 6 : t;
    const x = walkX(tp);
    let amount = 1;
    if (t >= 104 && (id === 'agi' || id === 'asi')) amount = clamp(walkSpeed(t) / 0.9);
    walkPose(x / (st.cycle * fig.s), st, amount, out);
    if (id === 'gpt1') {
      out.headTilt = Math.sin(tp * 3.1) * 0.12;
    }
    if (id === 'reasoning') out.headTilt = Math.sin(t * 0.9) * 0.08;
    if ((id === 'agi' || id === 'asi') && t >= 105) {
      // Stannar och tittar upp mot himlen.
      const up = smoothstep(105.6, 107.8, t);
      out.head = lerp(out.head, -0.62, up);
      out.neck = lerp(out.neck, -0.3, up);
      out.spineLean = lerp(out.spineLean, -0.06, up);
    }
    if (id === 'asi' && t >= ASI_TIMES.flash) {
      // Lyfter, sträcker ut armarna, benen hänger.
      const k = smoothstep(108.2, 112.5, t);
      const f = this.tmpPose2;
      Object.assign(f, restPose());
      f.plant = false;
      f.head = -0.42;
      f.neck = -0.15;
      f.spineLean = -0.12;
      for (const sd of [f.L, f.R]) {
        sd.shoulderOut = 1.32;
        sd.shoulder = 0.12;
        sd.elbow = 0.06;
        sd.thigh = 0.06;
        sd.knee = 0.16;
        sd.ankle = -0.55;
        sd.thighOut = 0.06;
      }
      f.L.thigh = 0.1;
      f.R.thigh = -0.02;
      // mjuk andning
      f.spineLean += Math.sin(t * 1.3) * 0.02;
      lerpPose(out, f, k, out);
      out.plant = k < 0.02;
    }
    return out;
  }

  private placeMain(id: MainId, fig: Figure, t: number) {
    const x = walkX(t);
    fig.root.position.set(x, 0, 0);
    fig.root.scale.setScalar(1);
    if (id === 'asi' && t >= ASI_TIMES.flash) {
      const g = easeInOutCubic(clamp((t - 108.4) / 7.4));
      const lift = easeInOutCubic(clamp((t - 108.2) / 7)) * 3.2;
      fig.root.scale.setScalar(1 + 9 * g);
      fig.root.position.y = lift;
      // vänder sig mot kameran medan den lyfter
      fig.root.rotation.y = (-Math.PI / 2) * smoothstep(108.3, 111.5, t);
    } else {
      fig.root.rotation.y = 0;
    }
    this.poseFor(id, fig, t, this.tmpPose);
    fig.applyPose(this.tmpPose);
  }

  /** Vilken figur representerar steget vid t (ASI är AGI fram till blixten). */
  private mainIdFor(stepIndex: number, t: number): MainId | null {
    const id = STEPS[stepIndex].id;
    if (id === 'end') return null;
    if (id === 'asi') return t < ASI_TIMES.flash ? 'agi' : 'asi';
    return id;
  }

  update(t: number): CastInfo {
    for (const m of this.materials) m.fx.uTime.value = t;
    for (const f of Object.values(this.mains)) f.root.visible = false;
    for (const e of this.echoes) e.root.visible = false;
    this.opus.root.visible = this.haiku.root.visible = false;
    for (const a of this.agents) a.root.visible = false;
    this.shards.visible = false;
    this.thoughts.visible = false;
    this.asiDust.points.visible = false;

    const tr = transitionAt(t);
    const fromId = this.mainIdFor(tr.from, t);
    const toId = this.mainIdFor(tr.to, t);
    const info = this.info;
    info.visible = !!toId || !!fromId;
    // Upplösningssvep: fötter → huvud.
    const edge = lerp(-0.12, 1.12, clamp(tr.k));
    const dissolve = fromId !== toId && tr.from !== tr.to;

    const show = (id: MainId, role: 'from' | 'to' | 'solo') => {
      const fig = this.mains[id];
      fig.root.visible = true;
      this.placeMain(id, fig, t);
      const fx = (fig.mat as FxMaterial).fx;
      fx.uDisLo.value = role === 'from' ? edge : -1;
      fx.uDisHi.value = role === 'to' ? edge : 2;
      if (id === 'asi') {
        // Upplöses i partiklar som sugs upp mot strukturen.
        const d = clamp((t - ASI_TIMES.dissolveStart) / (ASI_TIMES.dissolveEnd - ASI_TIMES.dissolveStart));
        if (d > 0) fx.uDisLo.value = lerp(-0.1, 1.15, d);
        fig.root.visible = d < 1;
        fig.setShadows(d < 0.3);
      }
      this.extras(id, fig, t, fx.uDisLo.value, fx.uDisHi.value);
      return fig;
    };

    let main: Figure | null = null;
    let mainId: MainId | null = null;
    if (dissolve && fromId && toId) {
      show(fromId, 'from');
      main = show(toId, 'to');
      mainId = toId;
    } else if (toId) {
      main = show(toId, 'solo');
      mainId = toId;
    }

    // Partikelsystemet för ASI (fångar punkter en gång, deterministiskt).
    if (t >= ASI_TIMES.dissolveStart - 0.2 && t < ASI_TIMES.dissolveEnd + 5 && t < 130) {
      if (!this.asiDust.isCaptured) {
        const fig = this.mains.asi;
        const vis = fig.root.visible;
        this.group.updateMatrixWorld(true);
        this.placeMain('asi', fig, ASI_TIMES.dissolveStart + 0.5);
        this.asiDust.capture(fig);
        fig.root.visible = vis;
        if (vis) this.placeMain('asi', fig, t);
      }
      this.asiDust.points.visible = true;
      this.asiDust.uniforms.uTime.value = t;
      this.asiDust.uniforms.uTarget.value.copy(this.structureTarget);
    }

    // Värme: människa och Claude-stegen får ett varmt ljus.
    const wFrom = STEPS[tr.from].warmth,
      wTo = STEPS[tr.to].warmth;
    info.warmth = lerp(wFrom, wTo, smoothstep(0, 1, tr.k));
    if (main && mainId) {
      info.pos.copy(main.root.position);
      info.scale = main.root.scale.x;
      info.height = main.p.height * info.scale;
      info.focus.set(info.pos.x, info.pos.y + info.height * 0.62, 0);
      main.headWorld(info.head);
      if (mainId === 'claude3') {
        // bubblan hamnar över den högsta figuren
        info.head.y = Math.max(info.head.y, this.opus.root.visible ? 2.25 : info.head.y);
      }
    } else {
      info.pos.set(walkX(Math.min(t, 108)), 0, 0);
    }
    this.warmLight.position.set(info.pos.x + 1.1, 1.8, 1.8);
    this.warmLight.intensity = info.warmth * 4 * (t < 105 ? 1 : 0);
    // AGI-glöd lyser upp marken.
    const agiOn = fromId === 'agi' || toId === 'agi' ? 1 : 0;
    info.agiGlow = agiOn * (toId === 'agi' ? smoothstep(89.7, 90.3, t) : 1);
    this.agiLight.position.set(info.pos.x, 1.2, 0.3);
    this.agiLight.intensity = info.agiGlow * 9;
    return info;
  }

  /** Stegspecifika tillägg: ekon, trion, agenter, skärvor, tankar, glitch. */
  private extras(id: MainId, fig: Figure, t: number, lo: number, hi: number) {
    const fx = (fig.mat as FxMaterial).fx;
    if (id === 'gpt2') {
      const burst = hash2(Math.floor(t * 2.5), 77) > 0.5 ? 1 : 0;
      fx.uGlitch.value = 0.25 + 0.75 * burst;
    }
    if (id === 'gpt4') {
      this.echoes.forEach((e, i) => {
        const d = 0.22 * (i + 1);
        e.root.visible = true;
        e.root.position.set(walkX(t - d), 0, -0.05 * (i + 1));
        this.poseFor('gpt4', e, t - d, this.tmpPose);
        e.applyPose(this.tmpPose);
        const efx = (e.mat as FxMaterial).fx;
        efx.uDisLo.value = lo;
        efx.uDisHi.value = hi;
      });
    }
    if (id === 'claude3') {
      const place = (f: Figure, dx: number, dz: number, phaseOff: number) => {
        f.root.visible = true;
        f.root.position.set(walkX(t) + dx, 0, dz);
        const st = STYLES[LOOKS[f === this.opus ? 'opus' : 'haiku'].style];
        walkPose((walkX(t) + phaseOff) / (st.cycle * f.s), st, 1, this.tmpPose);
        f.applyPose(this.tmpPose);
        const ffx = (f.mat as FxMaterial).fx;
        ffx.uDisLo.value = lo;
        ffx.uDisHi.value = hi;
      };
      place(this.opus, -0.7, -1.3, 0.37);
      place(this.haiku, 0.85, -0.6, 0.71);
    }
    if (id === 'today') {
      const t0 = STEPS.find((s) => s.id === 'today')!.start;
      this.agents.forEach((a, i) => {
        const appear = t0 + 0.5 + i * 0.55;
        if (t < appear) return;
        // flimrar in under första 0,4 s
        const age = t - appear;
        if (age < 0.4 && hash2(Math.floor(t * 30), i) < 0.5) return;
        if (hash2(Math.floor(t * 12), i + 50) < 0.03) return; // enstaka flimmer
        a.root.visible = true;
        const off = this.agentOffsets[i];
        const x = walkX(t) + off.x;
        a.root.position.set(x, 0, off.z);
        walkPose(x / (STYLES.agent.cycle * a.s) + i * 0.13, STYLES.agent, 1, this.tmpPose);
        a.applyPose(this.tmpPose);
      });
      const afx = (this.agents[0].mat as FxMaterial).fx;
      afx.uDisLo.value = lo;
      afx.uDisHi.value = hi;
    }
    if (id === 'agi') {
      this.shards.visible = true;
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const p = new THREE.Vector3();
      const s = new THREE.Vector3();
      const pres = clamp(Math.min(hi, 1.0) - Math.max(lo, 0) + 0.1);
      this.shardData.forEach((d, i) => {
        const a = d.ph + t * d.sp;
        p.set(fig.root.position.x + Math.cos(a) * d.r, d.y + Math.sin(a * 1.7 + d.tilt * 5) * 0.12 * (1 + d.tilt), Math.sin(a) * d.r);
        q.setFromEuler(new THREE.Euler(t * 2 + i, a, d.tilt));
        s.setScalar(pres);
        m.compose(p, q, s);
        this.shards.setMatrixAt(i, m);
      });
      this.shards.instanceMatrix.needsUpdate = true;
    }
    if (id === 'reasoning') {
      this.thoughts.visible = true;
      const pos = this.thoughts.geometry.attributes.position as THREE.BufferAttribute;
      const aA = this.thoughts.geometry.attributes.aA as THREE.BufferAttribute;
      const P = 1.3;
      const headY = fig.headTopY - 0.05;
      const s = STEPS.find((q) => q.id === 'reasoning')!;
      const fadeIn = smoothstep(s.start - TRANSITION / 2, s.start + 0.6, t) * (1 - smoothstep(s.end - 0.3, s.end + 0.3, t));
      this.thoughtSeeds.forEach((sd, i) => {
        const age = (((t / P + sd) % 1) + 1) % 1;
        const born = t - age * P;
        const bx = walkX(t) - age * 0.45 + (walkX(born) - walkX(t)) * 0.15;
        const r1 = hash2(i, Math.floor(t / P + sd));
        const r2 = hash2(i + 99, Math.floor(t / P + sd));
        pos.setXYZ(i, bx + (r1 - 0.5) * 0.35 + Math.sin(age * 6 + i) * 0.05, headY + age * 0.95 + (r2 - 0.3) * 0.1, (r2 - 0.5) * 0.3);
        aA.setX(i, Math.sin(age * Math.PI) * 0.9 * fadeIn);
      });
      pos.needsUpdate = true;
      aA.needsUpdate = true;
    }
  }

  /** Förbered alla figurer för shaderkompilering. */
  showAllForCompile(on: boolean) {
    for (const f of this.allFigures()) f.root.visible = on;
    this.shards.visible = on;
    this.thoughts.visible = on;
    this.asiDust.points.visible = on;
  }
}
