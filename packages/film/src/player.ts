// Spelaren: startskärm, kvalitetsval, ljud och renderingsloop runt Film.
// Två ingångar:
//   mountPlayer()        – för webbsidor (Astro) och den fristående dev-sidan
//   mountRenderTarget()  – exportläge för tools/render (window.__film)

import './style.css';
import { Film } from './film';
import type { Quality } from '@nastasteg/engine/render/post';
import { AudioEngine, encodeWav, renderOffline } from '@nastasteg/engine/audio/engine';
import { filmScore } from './audio/score';
import { DURATION } from './timeline';

export type { Quality };

/** Gissar en lämplig kvalitet utifrån grafikkortet. */
export function detectQuality(): Quality {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2');
  if (!gl) return 'low';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) return 'low';
  if (/swiftshader|llvmpipe|software/i.test(name)) return 'low';
  // Hög kvalitet (full pixeltäthet, 4× MSAA) gav trasig bild på vissa datorer och
  // erbjuds inte längre i spelaren. Den används bara vid export (mountRenderTarget).
  return 'medium';
}

/** Har webbläsaren WebGL2? Annars ska sidan visa MP4-reserven. */
export function supportsRealtime(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export interface PlayerOptions {
  quality?: Quality | 'auto';
  /** Starttid i sekunder (dev). */
  startAt?: number;
  /** Visa t/fps och aktivera tangenterna ←/→ (hoppa 5 s). */
  dev?: boolean;
  /** Bygg scenen direkt i stället för vid klick (dev-sidan). */
  preload?: boolean;
  onEnded?: () => void;
}

export interface PlayerHandle {
  destroy(): void;
}

const START_HTML = `
  <h1>NÄSTA STEG</h1>
  <p>en kortfilm · 2 min 30 s · ljud på</p>
  <button type="button">SPELA</button>
  <div class="q" role="radiogroup" aria-label="Kvalitet">
    <span>kvalitet:</span>
    <label><input type="radio" name="ns-q" value="low" /> låg</label>
    <label><input type="radio" name="ns-q" value="medium" /> mellan</label>
  </div>
  <p class="status" aria-live="polite"></p>`;

export function mountPlayer(root: HTMLElement, opts: PlayerOptions = {}): PlayerHandle {
  root.classList.add('ns-player');
  const startEl = document.createElement('div');
  startEl.className = 'ns-start';
  startEl.innerHTML = START_HTML;
  root.appendChild(startEl);
  const btn = startEl.querySelector('button')!;
  const status = startEl.querySelector('.status') as HTMLElement;
  const radios = startEl.querySelectorAll<HTMLInputElement>('input[name=ns-q]');

  let quality: Quality = !opts.quality || opts.quality === 'auto' || opts.quality === 'high' ? detectQuality() : opts.quality;
  radios.forEach((r) => (r.checked = r.value === quality));

  let film: Film | null = null;
  let builtFor: Quality | null = null;
  let ctx: AudioContext | null = null;
  let raf = 0;
  let destroyed = false;
  const startAt = opts.startAt ?? 0;

  const build = async () => {
    if (film && builtFor === quality) return film;
    film?.dispose();
    status.textContent = 'förbereder…';
    await document.fonts.ready;
    film = new Film(root, { quality });
    builtFor = quality;
    root.insertBefore(film.stage, startEl);
    await film.warmup((k) => (status.textContent = `förbereder ${Math.round(k * 100)} %`));
    film.renderAt(startAt);
    status.textContent = '';
    return film;
  };

  radios.forEach((r) =>
    r.addEventListener('change', () => {
      quality = r.value as Quality;
      if (opts.preload) void build();
    }),
  );
  if (opts.preload) void build().catch(fail);

  function fail(e: unknown) {
    console.error(e);
    status.textContent = 'Kunde inte starta filmen: ' + ((e as Error)?.message ?? e);
    btn.disabled = false;
  }

  const play = async () => {
    btn.disabled = true;
    // AudioContext måste skapas direkt i klickhändelsen (webbläsarnas autoplay-regler).
    ctx = new AudioContext({ latencyHint: 'playback' });
    void ctx.resume();
    const f = await build();
    if (destroyed) return;
    startEl.classList.add('hidden');
    const audio = ctx;
    let engine = new AudioEngine(audio, filmScore());
    engine.begin(startAt, audio.currentTime + 0.12);
    let paused = false;
    let pausedAt = 0;

    const devEl = opts.dev ? Object.assign(document.createElement('div'), { className: 'ns-dev' }) : null;
    if (devEl) root.appendChild(devEl);
    const now = () => (paused ? pausedAt : audio.currentTime - engine.origin);

    // Paus: knapp nere till höger, klick i bilden eller mellanslag.
    const ctrl = document.createElement('div');
    ctrl.className = 'ns-ctrl';
    ctrl.innerHTML = `<span class="ns-time"></span><button type="button" class="ns-pp" aria-label="Pausa">❚❚</button>`;
    const pausedEl = Object.assign(document.createElement('div'), { className: 'ns-paused', textContent: 'PAUS' });
    root.append(ctrl, pausedEl);
    const ppBtn = ctrl.querySelector<HTMLButtonElement>('.ns-pp')!;
    const timeEl = ctrl.querySelector<HTMLSpanElement>('.ns-time')!;
    const togglePause = () => {
      const t = now();
      paused = !paused;
      if (paused) {
        pausedAt = t;
        void audio.suspend();
      } else void audio.resume();
      root.classList.toggle('is-paused', paused);
      ppBtn.textContent = paused ? '▶' : '❚❚';
      ppBtn.setAttribute('aria-label', paused ? 'Spela' : 'Pausa');
    };
    ppBtn.addEventListener('click', togglePause);
    const onStageClick = (e: MouseEvent) => {
      if (ctrl.contains(e.target as Node) || startEl.contains(e.target as Node)) return;
      togglePause();
    };
    root.addEventListener('click', onStageClick);
    const inView = () => {
      const r = root.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === ' ' && inView() && (tag !== 'BUTTON' || e.target === ppBtn)) {
        e.preventDefault();
        if (e.target !== ppBtn) togglePause();
      }
      if (opts.dev && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        // Hoppa: tysta den gamla motorn och schemalägg om från nya t.
        const t = Math.max(0, Math.min(DURATION - 0.01, now() + (e.key === 'ArrowRight' ? 5 : -5)));
        engine.stopAll();
        engine = new AudioEngine(audio, filmScore());
        engine.begin(t, audio.currentTime + 0.05);
        if (paused) pausedAt = t;
      }
    };
    window.addEventListener('keydown', onKey);
    const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    let shownSec = -1;

    // Adaptiv kvalitet: sänk upplösningen om bildrutorna tar för lång tid.
    let acc = 0,
      n = 0,
      last = performance.now();
    const loop = () => {
      if (destroyed) return;
      const tc = Math.max(0, Math.min(DURATION, now()));
      engine.scheduleUntil(tc + 0.4);
      f.renderAt(tc);
      const t1 = performance.now();
      const dt = t1 - last;
      last = t1;
      if (tc > 1 && !paused) {
        acc += dt;
        if (++n >= 90) {
          const avg = acc / n;
          if (avg > 19) f.setDynamicScale(f.dynamicScale * 0.85);
          else if (avg < 13 && f.dynamicScale < 1) f.setDynamicScale(f.dynamicScale * 1.08);
          acc = n = 0;
        }
      }
      if (Math.floor(tc) !== shownSec) {
        shownSec = Math.floor(tc);
        timeEl.textContent = `${mmss(tc)} / ${mmss(DURATION)}`;
      }
      if (devEl)
        devEl.textContent = `t ${tc.toFixed(2)}  ${(1000 / Math.max(1, dt)).toFixed(0)} fps  q=${quality} scale=${f.dynamicScale.toFixed(2)}`;
      if (tc < DURATION) raf = requestAnimationFrame(loop);
      else {
        window.removeEventListener('keydown', onKey);
        root.removeEventListener('click', onStageClick);
        ctrl.remove();
        pausedEl.remove();
        devEl?.remove();
        void audio.close();
        startEl.classList.remove('hidden');
        btn.textContent = 'SPELA IGEN';
        btn.disabled = false;
        opts.onEnded?.();
      }
    };
    raf = requestAnimationFrame(loop);
  };
  btn.addEventListener('click', () => void play().catch(fail));

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      void ctx?.close();
      film?.dispose();
      startEl.remove();
      root.classList.remove('ns-player');
    },
  };
}

/**
 * Exportläge: renderar i fast storlek och exponerar window.__film för
 * tools/render (bildruta för bildruta + offline-ljud).
 */
export async function mountRenderTarget(root: HTMLElement, o: { w: number; h: number; quality: Quality }) {
  root.classList.add('ns-player');
  Object.assign(root.style, { position: 'fixed', inset: '0' });
  const film = new Film(root, { quality: o.quality, fixedSize: { w: o.w, h: o.h } });
  await document.fonts.ready;
  await film.warmup();
  let wav: Uint8Array | null = null;
  const api = {
    duration: DURATION,
    film,
    renderAt: (t: number) => {
      film.renderAt(t);
      film.renderer.getContext().finish();
    },
    renderAudio: async (sampleRate = 48000) => {
      wav = new Uint8Array(encodeWav(await renderOffline(filmScore(), sampleRate)));
      return wav.length;
    },
    /** WAV-bytes som base64 i bitar (Playwright tål inte jättestora strängar). */
    wavChunk: (offset: number, len: number) => {
      if (!wav) throw new Error('renderAudio() måste köras först');
      let s = '';
      const end = Math.min(wav.length, offset + len);
      for (let i = offset; i < end; i += 0x8000) s += String.fromCharCode(...wav.subarray(i, Math.min(end, i + 0x8000)));
      return btoa(s);
    },
  };
  Object.assign(window, { __film: api, __ready: true });
  return api;
}
