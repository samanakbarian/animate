// Slutet (130–150 s): en ensam människa på en parkbänk under en gatlykta i
// regnet. Lyktan flimrar och slocknar – och tänds igen. Regnet upphör, ljuset
// blir varmare och människan lyfter blicken.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Figure, restPose } from '@nastasteg/engine/figure/rig';
import { LOOKS } from '../characters/looks';
import type { FxMaterial } from '@nastasteg/engine/fx/figureMaterial';
import { bake, coneGeometry, coneMaterial, lanternGeometry, merge } from '@nastasteg/engine/scene/props';
import { lerp, smoothstep } from '@nastasteg/engine/core/math';
import { lampOn } from '../audio/score';

export const END_T = {
  start: 130,
  lampOff: 137.25,
  lampBack: 138.5,
  /** Huvudet sjunker när det blir mörkt … */
  headDown: [136.8, 138.2] as const,
  /** … och lyfts mot ljuset när lampan tänds igen. */
  lookUp: [139, 142] as const,
  fade: [146, 147.5] as const,
  title: 147.5,
};

export class Ending {
  readonly group = new THREE.Group();
  readonly human: Figure;
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
    for (let i = 0; i < 3; i++)
      wood.push(bake(new RoundedBoxGeometry(1.9, 0.045, 0.12, 2, 0.015), new THREE.Matrix4().makeTranslation(0, 0.46, -0.16 + i * 0.15)));
    for (let i = 0; i < 2; i++) {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(0, 0.66 + i * 0.16, -0.27),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, 0)),
        new THREE.Vector3(1, 1, 1),
      );
      wood.push(bake(new RoundedBoxGeometry(1.9, 0.12, 0.04, 2, 0.015), m));
    }
    const iron: THREE.BufferGeometry[] = [];
    for (const x of [-0.8, 0.8]) {
      iron.push(bake(new THREE.BoxGeometry(0.05, 0.46, 0.05), new THREE.Matrix4().makeTranslation(x, 0.23, 0.12)));
      iron.push(
        bake(
          new THREE.BoxGeometry(0.05, 0.95, 0.05),
          new THREE.Matrix4().compose(
            new THREE.Vector3(x, 0.47, -0.22),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.18, 0, 0)),
            new THREE.Vector3(1, 1, 1),
          ),
        ),
      );
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
    const up = smoothstep(END_T.lookUp[0], END_T.lookUp[1], t);
    const breathe = Math.sin(t * 1.4) * 0.015;
    // vila (lätt nedböjt) → sjunker ihop i mörkret → rätar på sig och tittar upp
    p.spineLean = lerp(lerp(0.1, 0.26, down), -0.04, up) + breathe;
    p.head = lerp(lerp(0.2, 0.62, down), -0.6, up);
    p.neck = lerp(lerp(0.05, 0.3, down), -0.28, up);
    p.headTurn = lerp(lerp(-0.08, 0, down), -0.14, up);
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
    // Ingen förstening eller upplösning – människan finns kvar.
    fx.uStone.value = -0.2;
    fx.uDisLo.value = -1;
    this.human.root.visible = true;

    // Lyktan flimrar, slocknar och tänds igen – varmare.
    const lit = lampOn(t) ? 1 : 0;
    const warm = smoothstep(END_T.lampBack, END_T.lampBack + 3, t);
    this.lampLight.intensity = lit * (16 + 6 * warm);
    (this.cone.material as THREE.ShaderMaterial).uniforms.uStrength.value = lit * 0.55;
    (this.cone.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    this.bulbMat.color.setRGB(lit ? 5 : 0.03, lit ? 3.6 : 0.03, lit ? 2.2 : 0.03);
    void this.lampHead;
  }
}
