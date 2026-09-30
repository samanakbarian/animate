// Slutet (130–150 s): en ensam människa på en parkbänk under en gatlykta i
// regnet. Lyktan flimrar och slocknar, människan förstenas och vittrar bort.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Figure, restPose } from '../characters/rig';
import { LOOKS } from '../characters/looks';
import type { FxMaterial } from '../fx/figureMaterial';
import { Disintegrate } from '../fx/particles';
import { bake, coneGeometry, coneMaterial, lanternGeometry, merge } from './props';
import { clamp, lerp, smoothstep } from '../core/math';
import { lampOn } from '../audio/score';

export const END_T = {
  start: 130,
  lampOff: 137.25,
  headDown: [137.5, 140] as const,
  stone: [139, 142] as const,
  pulse: 143,
  crumble: [143.2, 145.5] as const,
  fade: [146, 147.5] as const,
  title: 147.5,
};

export class Ending {
  readonly group = new THREE.Group();
  readonly human: Figure;
  readonly dust: Disintegrate;
  readonly lampLight: THREE.PointLight;
  readonly bench = new THREE.Vector3();
  private cone: THREE.Mesh;
  private bulbMat: THREE.MeshBasicMaterial;
  private lampHead: THREE.Vector3;

  constructor(pos: THREE.Vector3) {
    this.bench.copy(pos);
    this.group.position.copy(pos);
    this.group.visible = false;

    // Bänk: trästavar på järnben.
    const wood: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 3; i++) wood.push(bake(new RoundedBoxGeometry(1.9, 0.045, 0.12, 2, 0.015), new THREE.Matrix4().makeTranslation(0, 0.46, -0.16 + i * 0.15)));
    for (let i = 0; i < 2; i++) {
      const m = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.66 + i * 0.16, -0.27), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, 0)), new THREE.Vector3(1, 1, 1));
      wood.push(bake(new RoundedBoxGeometry(1.9, 0.12, 0.04, 2, 0.015), m));
    }
    const iron: THREE.BufferGeometry[] = [];
    for (const x of [-0.8, 0.8]) {
      iron.push(bake(new THREE.BoxGeometry(0.05, 0.46, 0.05), new THREE.Matrix4().makeTranslation(x, 0.23, 0.12)));
      iron.push(bake(new THREE.BoxGeometry(0.05, 0.95, 0.05), new THREE.Matrix4().compose(new THREE.Vector3(x, 0.47, -0.22), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.18, 0, 0)), new THREE.Vector3(1, 1, 1))));
      iron.push(bake(new THREE.BoxGeometry(0.05, 0.04, 0.5), new THREE.Matrix4().makeTranslation(x, 0.43, -0.03)));
    }
    const wm = new THREE.Mesh(merge(wood), new THREE.MeshStandardMaterial({ color: 0x2a1f18, roughness: 0.55 }));
    const im = new THREE.Mesh(merge(iron), new THREE.MeshStandardMaterial({ color: 0x101112, roughness: 0.4, metalness: 0.8 }));
    wm.castShadow = im.castShadow = true;
    wm.receiveShadow = true;
    // Bänken vänds så att den som sitter tittar mot strukturen (−z).
    const benchGroup = new THREE.Group();
    benchGroup.rotation.y = Math.PI;
    benchGroup.add(wm, im);
    this.group.add(benchGroup);

    // Gatlykta bakom bänken.
    const { geo, head } = lanternGeometry(new THREE.Vector3(-1.35, 0, 0.35), 4.4, new THREE.Vector3(1, 0, -0.35));
    const lm = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x121314, roughness: 0.45, metalness: 0.7 }));
    lm.castShadow = true;
    this.group.add(lm);
    this.lampHead = head;
    this.cone = new THREE.Mesh(coneGeometry(0.2, 2.6, head.y), coneMaterial(new THREE.Color(1.0, 0.78, 0.5), 0.55));
    this.cone.position.copy(head);
    this.cone.renderOrder = 3;
    this.group.add(this.cone);
    this.bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.6, 2.2) });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), this.bulbMat);
    bulb.position.copy(head);
    this.group.add(bulb);
    this.lampLight = new THREE.PointLight(0xffc08a, 0, 12, 1.6);
    this.lampLight.position.copy(head).add(new THREE.Vector3(0, -0.15, 0));
    this.group.add(this.lampLight);

    // Människan – samma modell som i början – sittande, tittar upp.
    const mat = LOOKS.human.make();
    this.human = new Figure(LOOKS.human.props, mat, 'lastHuman');
    mat.fx.uHeight.value = this.human.p.height;
    this.human.root.position.set(-0.15, 0, 0.06);
    // Vänd mot strukturen (bort från kameran, lätt snett).
    this.human.root.rotation.y = Math.PI / 2 + 0.05;
    this.group.add(this.human.root);

    this.dust = new Disintegrate(7000, 'wind', 17);
    this.dust.uniforms.uT0.value = END_T.crumble[0];
    this.dust.uniforms.uSweep.value = 1.6;
    this.dust.uniforms.uFly.value = 2.6;
    this.dust.uniforms.uColor.value.setRGB(0.26, 0.26, 0.25);
    this.dust.uniforms.uSize.value = 20;
    this.dust.uniforms.uWind.value.set(0.8, 0.3, -0.55);
    this.dust.uniforms.uMode.value = 1;
    this.group.add(this.dust.points);
  }

  private pose(t: number) {
    const p = restPose();
    p.plant = false;
    p.lift = 0;
    for (const s of [p.L, p.R]) {
      s.thigh = 1.5;
      s.knee = 1.45;
      s.ankle = 0.0;
      s.shoulder = 0.42;
      s.elbow = 1.05;
      s.shoulderOut = 0.12;
      s.thighOut = 0.08;
    }
    p.L.thigh = 1.46;
    const down = smoothstep(END_T.headDown[0], END_T.headDown[1], t);
    const breathe = Math.sin(t * 1.4) * 0.015 * (1 - smoothstep(139, 140.5, t));
    p.spineLean = lerp(0.02, 0.26, down) + breathe;
    p.head = lerp(-0.55, 0.62, down);
    p.neck = lerp(-0.25, 0.3, down);
    p.headTurn = lerp(-0.12, 0, down);
    this.human.applyPose(p);
    // Sätt höften på sitsen.
    this.human.joints.hips.position.y = 0.5 + 0.02;
  }

  update(t: number) {
    const on = t >= END_T.start;
    this.group.visible = on;
    if (!on) return;
    const fx = (this.human.mat as FxMaterial).fx;
    fx.uTime.value = t;
    this.pose(t);
    // Förstening från fötterna.
    const st = clamp((t - END_T.stone[0]) / (END_T.stone[1] - END_T.stone[0]));
    fx.uStone.value = lerp(-0.2, 1.25, st);
    // Vittring: kroppen löses upp nerifrån, damm blåser bort.
    const cr = clamp((t - END_T.crumble[0]) / (END_T.crumble[1] - END_T.crumble[0]));
    fx.uDisLo.value = cr > 0 ? lerp(-0.1, 1.2, cr) : -1;
    fx.uEdgeColor.value.setRGB(0.25, 0.25, 0.25);
    this.human.root.visible = cr < 1;
    if (t >= END_T.crumble[0] - 0.3) {
      if (!this.dust.isCaptured) {
        this.group.updateMatrixWorld(true);
        this.pose(END_T.crumble[0]);
        this.dust.capture(this.human);
        this.pose(t);
      }
      this.dust.points.visible = true;
      this.dust.uniforms.uTime.value = t;
    } else this.dust.points.visible = false;

    // Lyktan flimrar och slocknar.
    const lit = lampOn(t) ? 1 : 0;
    this.lampLight.intensity = lit * 16;
    (this.cone.material as THREE.ShaderMaterial).uniforms.uStrength.value = lit * 0.55;
    (this.cone.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    this.bulbMat.color.setRGB(lit ? 5 : 0.03, lit ? 3.6 : 0.03, lit ? 2.2 : 0.03);
    void this.lampHead;
  }
}
