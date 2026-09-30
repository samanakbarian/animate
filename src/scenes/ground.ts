// Våt asfalt/betong med PBR, pölar som krusas av regnet och planar reflection.

import * as THREE from 'three';
import { GLSL_NOISE } from './shaderlib';

/** Spegelkamera för marken (y = 0). */
export class PlanarReflection {
  readonly rt: THREE.WebGLRenderTarget;
  readonly camera = new THREE.PerspectiveCamera();
  readonly textureMatrix = new THREE.Matrix4();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.0);
  enabled = true;
  scale = 0.5;

  constructor() {
    this.rt = new THREE.WebGLRenderTarget(16, 16, {
      type: THREE.HalfFloatType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      samples: 0,
    });
    this.camera.layers.enableAll();
  }

  setSize(w: number, h: number) {
    this.rt.setSize(Math.max(16, Math.floor(w * this.scale)), Math.max(16, Math.floor(h * this.scale)));
  }

  update(renderer: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera, hide: THREE.Object3D[]) {
    if (!this.enabled) return;
    const rc = this.camera;
    rc.fov = cam.fov;
    rc.aspect = cam.aspect;
    rc.near = cam.near;
    rc.far = cam.far;
    rc.updateProjectionMatrix();
    cam.updateMatrixWorld();
    const pos = new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld);
    const dir = new THREE.Vector3(0, 0, -1).transformDirection(cam.matrixWorld);
    const up = new THREE.Vector3(0, 1, 0).transformDirection(cam.matrixWorld);
    const target = pos.clone().add(dir);
    pos.y = -pos.y;
    target.y = -target.y;
    up.y = -up.y;
    rc.position.copy(pos);
    rc.up.copy(up);
    rc.lookAt(target);
    rc.updateMatrixWorld();
    // Bias * P * V
    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    this.textureMatrix.multiply(rc.projectionMatrix).multiply(rc.matrixWorldInverse);

    const vis = hide.map((o) => o.visible);
    hide.forEach((o) => (o.visible = false));
    const prevRT = renderer.getRenderTarget();
    const prevClip = renderer.clippingPlanes;
    const prevShadowAuto = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    // Klipp bort allt under marken (spegelvärlden).
    this.plane.set(new THREE.Vector3(0, 1, 0), 0.01);
    renderer.clippingPlanes = [this.plane];
    renderer.setRenderTarget(this.rt);
    renderer.clear();
    renderer.render(scene, rc);
    renderer.setRenderTarget(prevRT);
    renderer.clippingPlanes = prevClip;
    renderer.shadowMap.autoUpdate = prevShadowAuto;
    hide.forEach((o, i) => (o.visible = vis[i]));
  }
}

export class Ground {
  readonly mesh: THREE.Mesh;
  readonly uniforms = {
    uTime: { value: 0 },
    uRain: { value: 1 },
    uReflTex: { value: null as THREE.Texture | null },
    uReflMat: { value: new THREE.Matrix4() },
    uReflStrength: { value: 1 },
    uWet: { value: 1 },
    uTint: { value: new THREE.Color(1, 1, 1) },
  };

  constructor(reflection: PlanarReflection) {
    this.uniforms.uReflTex.value = reflection.rt.texture;
    this.uniforms.uReflMat.value = reflection.textureMatrix;
    const geo = new THREE.PlaneGeometry(1400, 500, 1, 1);
    geo.rotateX(-Math.PI / 2);
    geo.translate(250, 0, -120);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x2b2c2e,
      roughness: 0.62,
      metalness: 0.0,
      envMapIntensity: 0.25,
      specularIntensity: 0.4,
    });
    const U = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vGW;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvGW = (modelMatrix * vec4(transformed,1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
varying vec3 vGW;
uniform float uTime; uniform float uRain; uniform sampler2D uReflTex; uniform mat4 uReflMat;
uniform float uReflStrength; uniform float uWet; uniform vec3 uTint;
${GLSL_NOISE}
float puddleMask(vec2 p){
  float n = fbm2(p * 0.16) * 0.8 + vnoise(p * 0.9) * 0.2;
  return smoothstep(0.52, 0.6, n);
}
// Ringar från regndroppar i celler – deterministiska av tiden.
vec2 ripples(vec2 p, float t){
  vec2 acc = vec2(0.0);
  for (int k = 0; k < 2; k++) {
    vec2 q = p * (k == 0 ? 2.2 : 3.1) + float(k) * 7.3;
    vec2 i = floor(q); vec2 f = fract(q);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 b = vec2(float(x), float(y));
      vec2 o = h22(i + b);
      float ph = h21(i + b + 3.7);
      float tt = fract(t * (0.9 + ph * 0.6) + ph);
      vec2 d = b + o - f;
      float r = length(d);
      float ring = sin((r - tt * 0.9) * 42.0) * smoothstep(0.0, 0.1, r) * (1.0 - smoothstep(tt * 0.9 - 0.12, tt * 0.9 + 0.02, r)) * (1.0 - tt) * (1.0 - tt);
      acc += normalize(d + 1e-4) * ring;
    }
  }
  return acc;
}
`,
        )
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
  vec2 gp = vGW.xz;
  float pud = puddleMask(gp) * uWet;
  float grit = fbm2(gp * 3.0);
  float fine = vnoise(gp * 38.0);
  float crack = smoothstep(0.02, 0.0, abs(fbm2(gp * 0.7 + 3.0) - 0.5)) * 0.6;
  diffuseColor.rgb *= (0.62 + 0.55 * grit + 0.15 * fine) * uTint;
  diffuseColor.rgb *= 1.0 - crack * 0.5;
  // Vått = mörkare.
  diffuseColor.rgb *= mix(1.0, 0.45, max(pud, 0.55 * uWet));
`,
        )
        .replace(
          '#include <roughnessmap_fragment>',
          `#include <roughnessmap_fragment>
  roughnessFactor = mix(0.55 + 0.25 * fine, 0.12, pud);
  roughnessFactor = mix(roughnessFactor, 0.3, 0.4 * uWet * (1.0 - pud));
`,
        )
        .replace(
          '#include <normal_fragment_maps>',
          `#include <normal_fragment_maps>
  vec2 rip = ripples(gp, uTime) * pud * uRain;
  vec2 bump = vec2(vnoise(gp * 20.0) - 0.5, vnoise(gp * 20.0 + 11.0) - 0.5) * (1.0 - pud) * 0.35;
  vec3 nW = normalize(vec3(-(rip.x * 0.18 + bump.x), 1.0, -(rip.y * 0.18 + bump.y)));
  normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
`,
        )
        .replace(
          '#include <opaque_fragment>',
          `
  {
    vec4 rp = uReflMat * vec4(vGW, 1.0);
    vec2 ruv = rp.xy / rp.w;
    vec2 distort = (rip * 0.035 + bump * 0.02) ;
    float lod = mix(4.0, 0.3, pud);
    vec3 refl = textureLod(uReflTex, ruv + distort, lod).rgb;
    vec3 V = normalize(vViewPosition);
    float ndv = clamp(dot(normal, V), 0.0, 1.0);
    float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    float k = mix(0.22 * uWet, 1.0, pud) * mix(0.35, 1.0, fres) * uReflStrength;
    outgoingLight = outgoingLight * (1.0 - k * 0.6) + refl * k;
  }
#include <opaque_fragment>`,
        );
    };
    mat.customProgramCacheKey = () => 'ground-v1';
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'ground';
  }
}
