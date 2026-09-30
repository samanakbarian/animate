// ASI-strukturen på himlen: ikosaeder i trådram med svart kärna, roterande
// ringar, ett hundratal kretsande skärvor och volumetriska ljusstrålar ner
// genom dimman. Pulserar i takt med basen.

import * as THREE from 'three';
import { Rng, clamp, smoothstep } from '../core/math';
import { coneGeometry, coneMaterial } from './props';

export class Structure {
  readonly group = new THREE.Group();
  readonly center: THREE.Vector3;
  readonly radius: number;
  private edges: THREE.InstancedMesh;
  private edgeData: { a: THREE.Vector3; b: THREE.Vector3; delay: number }[] = [];
  private edgeMat: THREE.MeshBasicMaterial;
  private nodeMat: THREE.MeshBasicMaterial;
  private core: THREE.Mesh;
  private coreMat: THREE.ShaderMaterial;
  private rings: THREE.Mesh[] = [];
  private ringMat: THREE.MeshBasicMaterial;
  private shards: THREE.InstancedMesh;
  private shardData: { r: number; incl: THREE.Quaternion; speed: number; phase: number; scale: number; spin: number; bright: boolean }[] = [];
  private rays: THREE.Mesh[] = [];
  private inner = new THREE.Group();
  private tmpM = new THREE.Matrix4();
  private tmpQ = new THREE.Quaternion();
  private tmpV = new THREE.Vector3();
  private tmpS = new THREE.Vector3();

  constructor(center: THREE.Vector3, radius: number) {
    this.center = center;
    this.radius = radius;
    this.group.position.copy(center);
    this.group.add(this.inner);
    this.inner.scale.setScalar(radius);
    const rng = new Rng(777);

    // Trådram: ikosaederns 30 kanter som tunna, självlysande cylindrar.
    const ico = new THREE.IcosahedronGeometry(1, 0);
    const pos = ico.attributes.position;
    const verts: THREE.Vector3[] = [];
    const key = (v: THREE.Vector3) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    const vmap = new Map<string, number>();
    const tri: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const k = key(v);
      if (!vmap.has(k)) {
        vmap.set(k, verts.length);
        verts.push(v);
      }
      tri.push(vmap.get(k)!);
    }
    const edgeSet = new Set<string>();
    for (let i = 0; i < tri.length; i += 3) {
      for (const [a, b] of [[tri[i], tri[i + 1]], [tri[i + 1], tri[i + 2]], [tri[i + 2], tri[i]]]) {
        const k = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (edgeSet.has(k)) continue;
        edgeSet.add(k);
        this.edgeData.push({ a: verts[a], b: verts[b], delay: rng.next() });
      }
    }
    this.edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3.2), fog: false, toneMapped: true });
    const cyl = new THREE.CylinderGeometry(0.008, 0.008, 1, 6, 1, true);
    cyl.translate(0, 0.5, 0);
    this.edges = new THREE.InstancedMesh(cyl, this.edgeMat, this.edgeData.length);
    this.edges.frustumCulled = false;
    this.inner.add(this.edges);

    // Noder i hörnen
    this.nodeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4), fog: false });
    for (const v of verts) {
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), this.nodeMat);
      n.position.copy(v);
      this.inner.add(n);
    }

    // Svart kärna med svag kant.
    this.coreMat = new THREE.ShaderMaterial({
      uniforms: { uRim: { value: 0 }, uPulse: { value: 0 } },
      fog: false,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform float uRim; uniform float uPulse; varying vec3 vN; varying vec3 vV; void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
        gl_FragColor = vec4(vec3(0.9,0.93,1.0) * f * uRim * (0.5 + uPulse), 1.0);
      }`,
    });
    this.core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 0), this.coreMat);
    this.inner.add(this.core);

    // Roterande ringar.
    this.ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.4), fog: false, transparent: true });
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(1.45 + i * 0.28, 0.005 + (i % 2) * 0.004, 6, 220), this.ringMat);
      r.rotation.set(rng.range(0, Math.PI), rng.range(0, Math.PI), 0);
      this.rings.push(r);
      this.inner.add(r);
    }

    // Kretsande skärvor.
    const shardGeo = new THREE.OctahedronGeometry(1, 0);
    shardGeo.scale(0.03, 0.14, 0.02);
    const shardMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    const N = 110;
    this.shards = new THREE.InstancedMesh(shardGeo, shardMat, N);
    this.shards.frustumCulled = false;
    for (let i = 0; i < N; i++) {
      const bright = rng.next() < 0.35;
      this.shardData.push({
        r: rng.range(1.5, 3.4),
        incl: new THREE.Quaternion().setFromEuler(new THREE.Euler(rng.range(-0.9, 0.9), rng.range(0, 6.28), rng.range(-0.9, 0.9))),
        speed: rng.range(0.05, 0.22) * rng.sign(),
        phase: rng.range(0, Math.PI * 2),
        scale: rng.range(0.5, 1.6),
        spin: rng.range(-2, 2),
        bright,
      });
      this.shards.setColorAt(i, bright ? new THREE.Color(2.6, 2.6, 2.8) : new THREE.Color(0.015, 0.015, 0.018));
    }
    this.inner.add(this.shards);

    // Ljusstrålar ner genom dimman.
    for (let i = 0; i < 7; i++) {
      const len = center.y + 30;
      const ray = new THREE.Mesh(coneGeometry(radius * 0.25, radius * rng.range(1.2, 2.4), len), coneMaterial(new THREE.Color(0.9, 0.92, 0.85), 0));
      ray.position.set(rng.range(-radius * 0.6, radius * 0.6), 0, rng.range(-radius * 0.6, radius * 0.6));
      ray.rotation.set(rng.range(-0.35, 0.35), 0, rng.range(-0.35, 0.35));
      ray.userData.w = rng.range(0.5, 1);
      ray.renderOrder = 6;
      this.rays.push(ray);
      this.group.add(ray);
    }
    this.group.visible = false;
  }

  /**
   * @param reveal 0..1 – strukturen tänds (kanter ritas upp en efter en)
   * @param pulse basens puls 0..1
   * @param rays 0..1 – ljusstrålar
   */
  update(t: number, reveal: number, pulse: number, rays: number, flash = 0) {
    this.group.visible = reveal > 0.001;
    if (!this.group.visible) return;
    const glow = reveal * (1 + pulse * 1.4) + flash * 2;
    this.inner.rotation.set(t * 0.03, t * 0.05, 0);
    this.edgeData.forEach((e, i) => {
      const k = clamp((reveal * 1.6 - e.delay * 0.6) / 1.0);
      const dir = this.tmpV.subVectors(e.b, e.a);
      const len = dir.length() * smoothstep(0, 1, k);
      this.tmpQ.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      this.tmpS.set(1 + pulse * 0.8, Math.max(1e-4, len), 1 + pulse * 0.8);
      this.tmpM.compose(e.a, this.tmpQ, this.tmpS);
      this.edges.setMatrixAt(i, this.tmpM);
    });
    this.edges.instanceMatrix.needsUpdate = true;
    this.edgeMat.color.setRGB(2.6 * glow, 2.6 * glow, 2.9 * glow);
    this.nodeMat.color.setRGB(4 * glow, 4 * glow, 4.2 * glow);
    this.coreMat.uniforms.uRim.value = reveal;
    this.coreMat.uniforms.uPulse.value = pulse;
    this.ringMat.opacity = smoothstep(0.3, 0.9, reveal);
    this.ringMat.color.setRGB(1.6 * glow, 1.6 * glow, 1.8 * glow);
    this.rings.forEach((r, i) => {
      r.rotation.x += 0; // rotationen är en ren funktion av t:
      r.rotation.z = t * (0.08 + i * 0.05) * (i % 2 ? -1 : 1);
      r.rotation.y = i * 0.9 + t * 0.03;
      const s = smoothstep(0.2 + i * 0.1, 0.8 + i * 0.05, reveal);
      r.scale.setScalar(Math.max(1e-3, s));
    });
    const sr = smoothstep(0.35, 1, reveal);
    this.shardData.forEach((d, i) => {
      const a = d.phase + t * d.speed * 2;
      this.tmpV.set(Math.cos(a) * d.r, Math.sin(a * 2.0) * 0.08, Math.sin(a) * d.r).applyQuaternion(d.incl);
      this.tmpV.multiplyScalar(0.6 + 0.4 * sr);
      this.tmpQ.setFromEuler(new THREE.Euler(t * d.spin, a, t * d.spin * 0.5));
      this.tmpS.setScalar(d.scale * sr * (d.bright ? 1 + pulse * 0.6 : 1));
      this.tmpM.compose(this.tmpV, this.tmpQ, this.tmpS);
      this.shards.setMatrixAt(i, this.tmpM);
    });
    this.shards.instanceMatrix.needsUpdate = true;
    for (const r of this.rays) {
      const m = r.material as THREE.ShaderMaterial;
      m.uniforms.uStrength.value = rays * 0.22 * r.userData.w * (0.8 + pulse * 0.4);
      m.uniforms.uTime.value = t;
      r.visible = rays > 0.001;
    }
  }
}
