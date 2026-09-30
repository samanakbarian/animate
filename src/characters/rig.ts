// Procedurell, riggad humanoid av mjuka, avsmalnande kapslar och svarvade
// torsoformer (inga lådor). Samma rigg används för alla steg – stegen skiljer
// sig i proportioner, material, rörelsestil och effekter.

import * as THREE from 'three';

export interface Proportions {
  height: number; // total längd i meter
  head: number; // huvudskala
  torso: number; // torsolängd
  legs: number; // benlängd
  girth: number; // bredd/tjocklek
  shoulders: number;
}

export const DEFAULT_PROPS: Proportions = { height: 1.75, head: 1, torso: 1, legs: 1, girth: 1, shoulders: 1 };

export interface SideAngles {
  thigh: number; // + = framåt
  thighOut: number; // + = utåt
  knee: number; // + = böjt
  ankle: number; // + = tå upp
  shoulder: number; // + = framåt
  shoulderOut: number; // + = utåt (upp mot T-pose vid ~1.5)
  elbow: number; // + = böjt
}

export interface Pose {
  lift: number; // extra höjd över marken (m, i figurens skala)
  bounce: number; // additivt på höftens höjd
  hipsTwist: number;
  hipsSway: number;
  spineLean: number; // + = framåt
  spineTwist: number;
  neck: number; // + = nedåt
  head: number; // + = nedåt (negativt = tittar upp)
  headTurn: number;
  headTilt: number;
  L: SideAngles;
  R: SideAngles;
  /** Om sant placeras höften så att lägsta foten nuddar marken. */
  plant: boolean;
}

export const zeroSide = (): SideAngles => ({ thigh: 0, thighOut: 0, knee: 0, ankle: 0, shoulder: 0, shoulderOut: 0.08, elbow: 0.15 });
export const restPose = (): Pose => ({
  lift: 0, bounce: 0, hipsTwist: 0, hipsSway: 0, spineLean: 0, spineTwist: 0, neck: 0, head: 0, headTurn: 0, headTilt: 0,
  L: zeroSide(), R: zeroSide(), plant: true,
});

/** Svarvad kapsel som smalnar av: rTop vid y=0, rBottom vid y=-len. */
export function taperedCapsule(rTop: number, rBot: number, len: number, radial = 22, capSeg = 7): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  // Nedre halvsfär (från botten och upp)
  for (let i = 0; i <= capSeg; i++) {
    const a = -Math.PI / 2 + (i / capSeg) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * rBot, -len + Math.sin(a) * rBot));
  }
  const mid = 6;
  for (let i = 1; i < mid; i++) {
    const k = i / mid;
    // lätt muskelbuk: bredast en bit ner på segmentet
    const bulge = Math.sin(k * Math.PI) * 0.08 * Math.min(rTop, rBot);
    pts.push(new THREE.Vector2(rBot + (rTop - rBot) * k + bulge, -len + len * k));
  }
  for (let i = 0; i <= capSeg; i++) {
    const a = (i / capSeg) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * rTop, Math.sin(a) * rTop));
  }
  const g = new THREE.LatheGeometry(pts, radial);
  g.computeVertexNormals();
  return g;
}

function torsoGeometry(y0: number, y1: number, girth: number, torso: number): THREE.BufferGeometry {
  // Profil (radie, höjd) för en stiliserad människokropp, höft→axlar.
  const prof: [number, number][] = [
    [0.0, -0.1], [0.07, -0.095], [0.13, -0.07], [0.158, -0.02], [0.16, 0.05], [0.148, 0.12], [0.132, 0.19],
    [0.136, 0.25], [0.155, 0.32], [0.172, 0.39], [0.175, 0.44], [0.162, 0.485], [0.118, 0.52], [0.06, 0.545], [0.0, 0.552],
  ];
  const pts: THREE.Vector2[] = [];
  for (const [r, y] of prof) {
    const yy = y * torso;
    if (yy < y0 - 0.12 || yy > y1 + 0.12) continue;
    pts.push(new THREE.Vector2(r * girth, yy));
  }
  const g = new THREE.LatheGeometry(pts, 28);
  g.scale(1, 1, 0.64);
  g.computeVertexNormals();
  return g;
}

interface Joints {
  hips: THREE.Object3D;
  spine: THREE.Object3D;
  neck: THREE.Object3D;
  head: THREE.Object3D;
  thighL: THREE.Object3D; kneeL: THREE.Object3D; ankleL: THREE.Object3D;
  thighR: THREE.Object3D; kneeR: THREE.Object3D; ankleR: THREE.Object3D;
  shoulderL: THREE.Object3D; elbowL: THREE.Object3D; handL: THREE.Object3D;
  shoulderR: THREE.Object3D; elbowR: THREE.Object3D; handR: THREE.Object3D;
}

let partCounter = 0;

export class Figure {
  /** Placeras i världen (x = position längs vägen). Framåt = +x. */
  readonly root = new THREE.Group();
  /** Inre grupp som vänds så att riggens +z pekar längs världens +x. */
  readonly body = new THREE.Group();
  readonly joints: Joints;
  readonly meshes: THREE.Mesh[] = [];
  readonly p: Proportions;
  readonly s: number;
  // mått (i meter, skalade)
  readonly thighLen: number;
  readonly shinLen: number;
  readonly ankleH: number;
  readonly hipH: number;
  readonly headTopY: number;
  private material: THREE.Material;

  constructor(props: Partial<Proportions>, material: THREE.Material, name = 'figure') {
    this.p = { ...DEFAULT_PROPS, ...props };
    const p = this.p;
    const s = (this.s = p.height / 1.75);
    this.material = material;
    this.root.name = name;
    this.root.add(this.body);
    this.body.rotation.y = Math.PI / 2;

    this.thighLen = 0.43 * p.legs * s;
    this.shinLen = 0.42 * p.legs * s;
    this.ankleH = 0.06 * s;
    this.hipH = this.thighLen + this.shinLen + this.ankleH;

    const J = (parent: THREE.Object3D, x: number, y: number, z = 0, n = '') => {
      const o = new THREE.Object3D();
      o.name = n;
      o.position.set(x, y, z);
      parent.add(o);
      return o;
    };
    const hips = J(this.body, 0, this.hipH, 0, 'hips');
    const spine = J(hips, 0, 0.1 * p.torso * s, 0, 'spine');
    const shoulderY = 0.47 * p.torso * s - 0.1 * p.torso * s;
    const neck = J(spine, 0, 0.52 * p.torso * s - 0.1 * p.torso * s, -0.01 * s, 'neck');
    const head = J(neck, 0, 0.1 * s, 0.01 * s, 'head');
    const hipX = 0.092 * p.girth * s;
    const thighL = J(hips, hipX, 0, 0, 'thighL');
    const kneeL = J(thighL, 0, -this.thighLen, 0, 'kneeL');
    const ankleL = J(kneeL, 0, -this.shinLen, 0, 'ankleL');
    const thighR = J(hips, -hipX, 0, 0, 'thighR');
    const kneeR = J(thighR, 0, -this.thighLen, 0, 'kneeR');
    const ankleR = J(kneeR, 0, -this.shinLen, 0, 'ankleR');
    const shX = 0.185 * p.shoulders * p.girth * s;
    const upperArm = 0.29 * s;
    const foreArm = 0.26 * s;
    const shoulderL = J(spine, shX, shoulderY, -0.005 * s, 'shoulderL');
    const elbowL = J(shoulderL, 0, -upperArm, 0, 'elbowL');
    const handL = J(elbowL, 0, -foreArm, 0, 'handL');
    const shoulderR = J(spine, -shX, shoulderY, -0.005 * s, 'shoulderR');
    const elbowR = J(shoulderR, 0, -upperArm, 0, 'elbowR');
    const handR = J(elbowR, 0, -foreArm, 0, 'handR');
    this.joints = { hips, spine, neck, head, thighL, kneeL, ankleL, thighR, kneeR, ankleR, shoulderL, elbowL, handL, shoulderR, elbowR, handR };

    const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, pos?: THREE.Vector3, rot?: THREE.Euler, scale?: THREE.Vector3) => {
      const m = new THREE.Mesh(g, material);
      if (pos) m.position.copy(pos);
      if (rot) m.rotation.copy(rot);
      if (scale) m.scale.copy(scale);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      this.meshes.push(m);
      return m;
    };
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const g = p.girth;

    // Bål: bäcken på höften, bröstkorg på ryggen (överlappar för mjuk skarv).
    const pelvis = torsoGeometry(-0.1, 0.16, g, p.torso);
    pelvis.scale(s, s, s);
    add(hips, pelvis);
    const chest = torsoGeometry(0.12, 0.56, g, p.torso);
    chest.scale(s, s, s);
    chest.translate(0, -0.1 * p.torso * s, 0);
    add(spine, chest);
    // Hals och huvud
    add(neck, taperedCapsule(0.042 * s * g, 0.05 * s * g, 0.1 * s), V(0, 0.1 * s, 0));
    const hs = p.head * s;
    const skull = new THREE.SphereGeometry(1, 36, 26);
    add(head, skull, V(0, 0.115 * hs, -0.005 * hs), undefined, V(0.083 * hs, 0.112 * hs, 0.097 * hs));
    const jaw = new THREE.SphereGeometry(1, 28, 18);
    add(head, jaw, V(0, 0.055 * hs, 0.03 * hs), undefined, V(0.062 * hs, 0.058 * hs, 0.07 * hs));
    // Armar
    for (const [sh, el, ha] of [[shoulderL, elbowL, handL], [shoulderR, elbowR, handR]] as const) {
      add(sh, taperedCapsule(0.05 * s * g, 0.04 * s * g, upperArm));
      add(el, taperedCapsule(0.04 * s * g, 0.031 * s * g, foreArm));
      const hand = taperedCapsule(0.032 * s, 0.026 * s, 0.085 * s, 14, 5);
      hand.scale(0.75, 1, 1.15);
      add(ha, hand);
    }
    // Ben
    for (const [th, kn, an] of [[thighL, kneeL, ankleL], [thighR, kneeR, ankleR]] as const) {
      add(th, taperedCapsule(0.075 * s * g, 0.05 * s * g, this.thighLen));
      add(kn, taperedCapsule(0.052 * s * g, 0.036 * s * g, this.shinLen));
      const foot = taperedCapsule(0.034 * s, 0.04 * s, 0.2 * s, 16, 6);
      foot.scale(1.1, 1, 0.8);
      add(an, foot, V(0, -0.035 * s, -0.04 * s), new THREE.Euler(-Math.PI / 2, 0, 0));
    }

    // Vilopose → beräkna aRest (figurrymdsposition per vertex) så att
    // mönster, upplösning och sten "sitter fast" på kroppen när den rör sig.
    this.body.rotation.y = 0;
    this.root.updateMatrixWorld(true);
    const tmp = new THREE.Vector3();
    for (const m of this.meshes) {
      const geo = m.geometry;
      const pos = geo.attributes.position;
      const rest = new Float32Array(pos.count * 3);
      const part = new Float32Array(pos.count);
      const pid = partCounter++ % 97;
      for (let i = 0; i < pos.count; i++) {
        tmp.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        rest[i * 3] = tmp.x;
        rest[i * 3 + 1] = tmp.y;
        rest[i * 3 + 2] = tmp.z;
        part[i] = pid;
      }
      geo.setAttribute('aRest', new THREE.BufferAttribute(rest, 3));
      geo.setAttribute('aPart', new THREE.BufferAttribute(part, 1));
    }
    this.headTopY = (0.52 * p.torso + 0.1 + 0.23 * p.head) * s + this.hipH;
    this.body.rotation.y = Math.PI / 2;
  }

  get mat() {
    return this.material;
  }

  setMaterial(m: THREE.Material) {
    this.material = m;
    for (const mesh of this.meshes) mesh.material = m;
  }

  setShadows(cast: boolean) {
    for (const m of this.meshes) m.castShadow = cast;
  }

  /** Sätter ledvinklar från en pose. Höften planteras så att lägsta foten når marken. */
  applyPose(p: Pose) {
    const j = this.joints;
    const side = (a: SideAngles, sgn: number, th: THREE.Object3D, kn: THREE.Object3D, an: THREE.Object3D, sh: THREE.Object3D, el: THREE.Object3D) => {
      th.rotation.set(-a.thigh, 0, sgn * a.thighOut);
      kn.rotation.set(a.knee, 0, 0);
      // Håll foten plan mot marken, plus tåvinkel.
      an.rotation.set(a.thigh - a.knee - a.ankle, 0, 0);
      sh.rotation.set(-a.shoulder, 0, sgn * a.shoulderOut);
      el.rotation.set(-a.elbow, 0, 0);
    };
    side(p.L, 1, j.thighL, j.kneeL, j.ankleL, j.shoulderL, j.elbowL);
    side(p.R, -1, j.thighR, j.kneeR, j.ankleR, j.shoulderR, j.elbowR);
    j.hips.rotation.set(0, p.hipsTwist, p.hipsSway);
    j.spine.rotation.set(p.spineLean, p.spineTwist, -p.hipsSway * 0.6);
    j.neck.rotation.set(p.neck, 0, 0);
    j.head.rotation.set(p.head, p.headTurn, p.headTilt);

    let hy = this.hipH;
    if (p.plant) {
      // Vertikal räckvidd för varje ben (höft → fotled), inklusive tå/häl.
      const reach = (a: SideAngles) => {
        const th = a.thigh;
        const sh = th - a.knee;
        return this.thighLen * Math.cos(th) * Math.cos(a.thighOut) + this.shinLen * Math.cos(sh) + this.ankleH;
      };
      hy = Math.max(reach(p.L), reach(p.R));
    }
    j.hips.position.y = hy + p.bounce * this.s + p.lift;
  }

  /** Huvudets världsposition (ovanför hjässan) – ankare för pratbubblor. */
  headWorld(out: THREE.Vector3) {
    this.joints.head.updateWorldMatrix(true, false);
    return out.set(0, 0.26 * this.p.head * this.s, 0).applyMatrix4(this.joints.head.matrixWorld);
  }
}
