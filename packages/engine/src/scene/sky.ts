// Gradienthimmel med drivande moln, blixtar och ASI-epokens sjukligt ljusgrå ton.

import * as THREE from 'three';
import { GLSL_NOISE } from './shaderlib';

export class Sky {
  readonly mesh: THREE.Mesh;
  readonly uniforms = {
    uTime: { value: 0 },
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uFlash: { value: 0 },
    uClouds: { value: 1 },
    uGlow: { value: new THREE.Vector3(0, 0.3, -1) },
    uGlowColor: { value: new THREE.Color(0, 0, 0) },
  };

  constructor() {
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main(){
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uTop; uniform vec3 uHorizon; uniform float uFlash; uniform float uClouds;
        uniform vec3 uGlow; uniform vec3 uGlowColor;
        varying vec3 vDir;
        ${GLSL_NOISE}
        void main(){
          vec3 d = normalize(vDir);
          float h = clamp(d.y, -0.2, 1.0);
          vec3 col = mix(uHorizon, uTop, smoothstep(0.02, 0.6, h));
          // Molnbankar – tunga, långsamma.
          vec2 uv = d.xz / max(0.12, d.y + 0.18) * 1.4;
          float c = fbm2(uv * 0.9 + vec2(uTime * 0.012, uTime * 0.004));
          float c2 = fbm2(uv * 2.3 - vec2(uTime * 0.02, 0.0));
          float clouds = smoothstep(0.35, 0.85, c * 0.75 + c2 * 0.35) * smoothstep(-0.02, 0.25, d.y);
          col = mix(col, col * 1.35 + uFlash * 0.4, clouds * 0.55 * uClouds);
          col *= 1.0 - clouds * 0.25 * uClouds;
          // Glöd kring en riktning (strukturen)
          float g = max(0.0, dot(d, normalize(uGlow)));
          col += uGlowColor * (pow(g, 12.0) * 1.5 + pow(g, 3.0) * 0.6) * smoothstep(-0.05, 0.1, d.y + 0.05);
          col += vec3(0.85, 0.9, 1.0) * uFlash * (0.6 + clouds);
          // svagt dither mot banding
          col += (h21(gl_FragCoord.xy) - 0.5) / 255.0;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
  }
}
