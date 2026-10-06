// Filmen: bygger scenen och renderar en bildruta för ett givet t.
// renderAt(t) är en ren funktion av t – samma t ger samma bild, oavsett
// bildfrekvens eller i vilken ordning bildrutorna renderas.

import * as THREE from 'three';
import { clamp, smoothstep } from '@nastasteg/engine/core/math';
import { Cast } from './characters/cast';
import { World } from './scenes/world';
import { Rain } from '@nastasteg/engine/scene/rain';
import { Structure } from './scenes/structure';
import { Ending, END_T } from './scenes/ending';
import { createEnvironment } from '@nastasteg/engine/scene/environment';
import { Post, Quality } from '@nastasteg/engine/render/post';
import { Hud } from './hud/hud';
import { bassPulse } from './audio/score';
import {
  BENCH_POS,
  STRUCTURE_CENTER,
  STRUCTURE_RADIUS,
  cameraAt,
  fadeAt,
  flashAt,
  glitchAt,
  makeTracker,
  rainPhase,
  rainSpeed,
} from './director';
import { walkX } from './timeline';

export interface FilmOptions {
  quality: Quality;
  /** Fast storlek (export). Annars fönstrets storlek. */
  fixedSize?: { w: number; h: number };
}

const PRESETS: Record<Quality, { pr: number; shadow: number; refl: number; rain: number; maxW: number }> = {
  high: { pr: 2, shadow: 2048, refl: 0.5, rain: 9000, maxW: 2560 },
  medium: { pr: 1, shadow: 1024, refl: 0.33, rain: 6000, maxW: 1920 },
  low: { pr: 0.8, shadow: 1024, refl: 0, rain: 3500, maxW: 1280 },
};

export class Film {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 2.39, 0.1, 2500);
  readonly stage: HTMLDivElement;
  readonly world: World;
  readonly cast: Cast;
  readonly rain: Rain;
  readonly structure: Structure;
  readonly ending: Ending;
  readonly post: Post;
  readonly hud: Hud;
  readonly quality: Quality;
  private tracker = makeTracker(walkX);
  private portrait = false;
  private stageW = 1;
  private stageH = 1;
  private dynScale = 1;
  private opts: FilmOptions;
  private container: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private tmpV = new THREE.Vector3();
  /** Kallt ljus från strukturen – det enda som inte dämpas i slutet. */
  private structLight = new THREE.DirectionalLight(0xdfe6f0, 0);

  constructor(container: HTMLElement, opts: FilmOptions) {
    this.opts = opts;
    this.quality = opts.quality;
    const P = PRESETS[opts.quality];
    this.container = container;
    this.stage = document.createElement('div');
    this.stage.className = 'ns-stage';
    container.appendChild(this.stage);
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      preserveDrawingBuffer: !!opts.fixedSize,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.stage.appendChild(this.renderer.domElement);

    this.scene.environment = createEnvironment(this.renderer);
    this.world = new World(this.scene);
    this.world.key.shadow.mapSize.set(P.shadow, P.shadow);
    this.world.reflection.scale = Math.max(P.refl, 0.1);
    // Låg kvalitet: ingen spegelrendering (marken reflekterar bara miljökartan).
    this.world.reflection.enabled = P.refl > 0;
    this.world.ground.uniforms.uReflStrength.value = P.refl > 0 ? 1 : 0;

    this.cast = new Cast();
    this.scene.add(this.cast.group);
    this.cast.structureTarget.copy(STRUCTURE_CENTER);

    this.rain = new Rain(9000, 700);
    this.rain.setCount(P.rain);
    this.scene.add(this.rain.drops, this.rain.splashes);

    this.structure = new Structure(STRUCTURE_CENTER, STRUCTURE_RADIUS);
    this.scene.add(this.structure.group);

    this.ending = new Ending(BENCH_POS);
    this.scene.add(this.ending.group);
    this.scene.add(this.structLight, this.structLight.target);

    this.post = new Post(this.renderer, this.scene, this.camera, opts.quality);
    this.hud = new Hud(this.stage);

    this.layout();
    if (!opts.fixedSize) {
      this.resizeObserver = new ResizeObserver(() => this.layout());
      this.resizeObserver.observe(container);
    }
  }

  /** Placerar bildytan (2,39:1 liggande, ~0,9:1 stående) mitt i fönstret. */
  layout() {
    // Bildytan fyller behållaren (inte fönstret) så att filmen kan bäddas in.
    const W = this.opts.fixedSize?.w ?? Math.max(1, this.container.clientWidth);
    const H = this.opts.fixedSize?.h ?? Math.max(1, this.container.clientHeight);
    this.portrait = H > W * 1.05;
    const aspect = this.portrait ? Math.max(0.8, Math.min(1.0, (W / H) * 1.6)) : 2.39;
    let w = W;
    let h = Math.round(W / aspect);
    if (h > H) {
      h = H;
      w = Math.round(H * aspect);
    }
    const left = Math.round((W - w) / 2);
    const top = Math.round((H - h) / 2);
    Object.assign(this.stage.style, { left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px` });
    this.stage.style.setProperty('--u', `${w / 100}px`);
    this.stageW = w;
    this.stageH = h;
    const P = PRESETS[this.quality];
    const dpr = this.opts.fixedSize ? 1 : Math.min(window.devicePixelRatio || 1, P.pr);
    const pr = Math.min(dpr, P.maxW / w) * this.dynScale;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.post.setSize(w, h);
    this.post.cinema.set('uAspect', w / h);
    this.world.reflection.setSize(w * pr, h * pr);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Frigör GPU-resurser och tar bort bildytan. */
  dispose() {
    this.resizeObserver?.disconnect();
    this.post.composer.dispose();
    this.world.reflection.rt.dispose();
    this.renderer.dispose();
    this.stage.remove();
  }

  /** Dynamisk upplösning (sänks om datorn inte hinner med). */
  setDynamicScale(s: number) {
    const next = clamp(s, 0.5, 1);
    if (Math.abs(next - this.dynScale) < 0.02) return;
    this.dynScale = next;
    this.layout();
  }
  get dynamicScale() {
    return this.dynScale;
  }

  /** Kompilerar alla shaders i förväg genom att rendera nyckelögonblick. */
  async warmup(onProgress?: (k: number) => void) {
    const times = [0.5, 12, 18, 25, 33, 40, 47, 55, 62, 70, 78, 85, 95, 106, 110, 118, 124, 131, 140.5, 144, 148];
    for (let i = 0; i < times.length; i++) {
      this.renderAt(times[i]);
      onProgress?.((i + 1) / times.length);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  renderAt(t: number) {
    const info = this.cast.update(t);
    const ending = t >= 130;

    // Strukturen
    const reveal = ending ? 1 : smoothstep(114, 120, t);
    const pulse = ending ? 0.1 : bassPulse(t);
    const rays = ending ? 0 : smoothstep(120, 124, t);
    this.structure.update(t, reveal, pulse, rays, flashAt(t) * (t > 140 ? 1.5 : 0));

    this.ending.update(t);
    this.structLight.position.copy(STRUCTURE_CENTER);
    this.structLight.target.position.copy(ending ? BENCH_POS : this.tmpV.set(STRUCTURE_CENTER.x, 0, 0));
    this.structLight.intensity = ending ? 0.9 + pulse * 0.8 : reveal * (0.6 + pulse * 0.6);

    // Kamera
    const shot = cameraAt(t, info, this.portrait, this.tracker(t));
    const cam = this.camera;
    cam.position.copy(shot.pos);
    cam.up.set(Math.sin(shot.roll), Math.cos(shot.roll), 0);
    cam.lookAt(shot.target);
    const hf = (shot.hfov * Math.PI) / 180;
    // Liggande: brännvidden bestämmer bredden. Stående: använd samma vinkel
    // (något smalare) på höjden, annars blir figuren pytteliten.
    cam.fov = this.portrait ? shot.hfov * 0.82 : (2 * Math.atan(Math.tan(hf / 2) / cam.aspect) * 180) / Math.PI;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    // Värld
    const flash = flashAt(t);
    // Slutet: mörkare medan lampan är släckt, sedan ljusare än förut.
    const dark = smoothstep(END_T.lampOff - 0.1, END_T.lampOff + 0.1, t) * (1 - smoothstep(END_T.lampBack, END_T.lampBack + 1, t));
    const dawn = smoothstep(END_T.lookUp[0], END_T.lookUp[1] + 2, t);
    const dim = ending ? 1 - 0.6 * dark + 0.15 * dawn : 1;
    const focusX = ending ? BENCH_POS.x : info.pos.x;
    const focusZ = ending ? BENCH_POS.z : 0;
    this.world.update(
      {
        t,
        focusX,
        focusZ,
        sick: ending ? 0 : smoothstep(119, 126, t),
        end: ending ? 1 : 0,
        flash,
        dim,
        rain: clamp(rainSpeed(t)),
      },
      cam,
    );
    // Slutet: släck vägens lyktor, använd bänkens lykta.
    if (ending) for (const l of this.world.lampLights) l.intensity = 0;
    this.world.hemi.intensity += info.agiGlow * 0.4;

    // Regn
    const ru = this.rain.uniforms;
    ru.uPhase.value = rainPhase(t);
    ru.uSpeed.value = rainSpeed(t);
    ru.uTime.value = t;
    ru.uCenter.value.set(cam.position.x, 0, cam.position.z);
    ru.uSplash.value = clamp(rainSpeed(t));
    ru.uUp.value = t >= 105 && t < 130 ? smoothstep(106, 110, t) : 0;
    ru.uAlpha.value = ending ? 1 - smoothstep(139, 143.5, t) : t >= 105 ? 1 - 0.4 * smoothstep(118, 125, t) : 1;
    const lamps = ending ? [this.ending.lampLight] : this.world.lampLights;
    for (let i = 0; i < 3; i++) {
      const L = lamps[i];
      const v = ru.uLamp.value[i];
      if (L) {
        L.getWorldPosition(this.tmpV);
        v.set(this.tmpV.x, this.tmpV.y, this.tmpV.z, L.intensity * 0.06);
      } else v.set(0, -100, 0, 0);
    }

    // Efterbehandling
    const c = this.post.cinema;
    c.set('uTime', t);
    c.set('uWarmth', ending ? 0.25 * (1 - dark) + 0.45 * dawn : info.warmth);
    c.set('uGlitch', glitchAt(t));
    c.set('uFlash', flash);
    c.set('uFade', fadeAt(t) * (t >= 147.5 ? 0 : 1));
    c.set('uCA', 0.02 + glitchAt(t) * 0.05);
    c.set('uExposure', ending ? 1.1 + 0.08 * dawn : 1.12 + info.agiGlow * 0.1 + smoothstep(119, 126, t) * 0.1);
    if (this.post.dof) {
      this.post.dof.target = shot.focus;
      this.post.dof.bokehScale = shot.bokeh;
    }

    // Planar reflection före huvudrenderingen.
    const hide: THREE.Object3D[] = [this.world.ground.mesh, this.rain.splashes];
    this.world.reflection.update(this.renderer, this.scene, cam, hide);
    this.post.render();

    // HUD
    let anchor = { x: 0, y: 0, visible: false };
    if (!ending && info.visible) {
      this.tmpV.copy(info.head).project(cam);
      if (this.tmpV.z < 1) {
        anchor = { x: (this.tmpV.x * 0.5 + 0.5) * this.stageW, y: (-this.tmpV.y * 0.5 + 0.5) * this.stageH, visible: true };
      }
    }
    this.hud.update(t, anchor, this.stageW, this.stageH);
  }
}
