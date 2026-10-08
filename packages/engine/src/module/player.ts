// Modulspelaren (DOM): scenyta med berättartext, uppspelningsrad med kapitel-
// markeringar och reglage för modulens parametrar. När besökaren rör ett
// reglage pausas filmen och utforskaläget tar över.

import './player.css';
import { ModuleController } from './controller';
import { chapterIndexAt, formatNumber } from './params';
import { ModuleSound } from './sound';
import type { ModuleDefinition, ModuleScene } from './types';

export interface ModulePlayerHandle {
  controller: ModuleController;
  destroy(): void;
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Skriver fram texten tecken för tecken (deterministiskt av tiden sedan start). Med reducerad rörelse visas hela texten direkt. */
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const typed = (text: string, since: number, now: number, cps = 45) =>
  reducedMotion() ? text : text.slice(0, Math.max(0, Math.floor((now - since) * cps)));

/** Händelser för statistik: filmen startade, besökaren rörde ett reglage, filmen spelades klart. */
export type ModuleEvent = 'start' | 'interact' | 'end';

export function mountModulePlayer(
  root: HTMLElement,
  def: ModuleDefinition,
  opts: { clock?: () => number; onEvent?: (e: ModuleEvent) => void } = {},
): ModulePlayerHandle {
  const emitted = new Set<ModuleEvent>();
  const emit = (e: ModuleEvent) => {
    if (emitted.has(e)) return;
    emitted.add(e);
    opts.onEvent?.(e);
  };
  const clock = opts.clock ?? (() => performance.now() / 1000);
  const ctl = new ModuleController(def, clock);
  root.classList.add('ns-module');
  root.innerHTML = `
    <div class="nsm-stage" aria-label="${def.title} – klicka för att spela eller pausa">
      <div class="nsm-canvas" role="img" aria-label="${def.title}: animerad illustration. Kapitlens text läses upp, och reglagen nedanför styr den."></div>
      <div class="nsm-caption" aria-hidden="true"><div class="nsm-chapter"></div><p class="nsm-text"></p></div>
      <p class="nsm-sr" aria-live="polite"></p>
      <button type="button" class="nsm-bigplay" aria-label="Spela filmen">▶</button>
    </div>
    <div class="nsm-bar">
      <button type="button" class="nsm-play" aria-label="Spela">▶</button>
      <span class="nsm-time">0:00 / ${fmtTime(def.duration)}</span>
      <div class="nsm-scrub">
        <input type="range" min="0" max="${def.duration}" step="0.01" value="0" aria-label="Tid i filmen" />
        <div class="nsm-ticks">${def.chapters.map((c) => `<span style="left:${(c.start / def.duration) * 100}%"></span>`).join('')}</div>
      </div>
      <button type="button" class="nsm-sound" aria-pressed="true">ljud på</button>
      <span class="nsm-mode" data-mode="film">film</span>
    </div>
    <div class="nsm-params" role="group" aria-label="Reglage">
      ${def.params
        .map(
          (p) => `<div class="nsm-param">
            <label for="nsm-${def.id}-${p.id}"><span>${p.label}</span><output id="nsm-${def.id}-${p.id}-out"></output></label>
            <input id="nsm-${def.id}-${p.id}" data-param="${p.id}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.default}" />
          </div>`,
        )
        .join('')}
      <div class="nsm-actions">
        <button type="button" class="nsm-resume">Fortsätt filmen</button>
        <button type="button" class="nsm-reset">Återställ reglagen</button>
        <span class="nsm-hint">Dra i ett reglage för att pausa och styra själv.</span>
      </div>
    </div>`;

  const q = <T extends Element>(s: string) => root.querySelector(s) as T;
  const stage = q<HTMLDivElement>('.nsm-stage');
  const host = q<HTMLDivElement>('.nsm-canvas');
  const chapterEl = q<HTMLDivElement>('.nsm-chapter');
  const textEl = q<HTMLParagraphElement>('.nsm-text');
  // Skärmläsare får hela kapiteltexten en gång, inte varje tecken som skrivs fram.
  const srEl = q<HTMLParagraphElement>('.nsm-sr');
  let srKey = '';
  const bigPlay = q<HTMLButtonElement>('.nsm-bigplay');
  const playBtn = q<HTMLButtonElement>('.nsm-play');
  const timeEl = q<HTMLSpanElement>('.nsm-time');
  const scrub = q<HTMLInputElement>('.nsm-scrub input');
  const modeEl = q<HTMLSpanElement>('.nsm-mode');
  const sliders = [...root.querySelectorAll<HTMLInputElement>('input[data-param]')];
  const soundBtn = q<HTMLButtonElement>('.nsm-sound');
  const sound = new ModuleSound(def);
  const showSound = () => {
    soundBtn.textContent = sound.enabled ? 'ljud på' : 'ljud av';
    soundBtn.setAttribute('aria-pressed', String(sound.enabled));
    soundBtn.setAttribute('aria-label', sound.enabled ? 'Stäng av ljudet' : 'Slå på ljudet');
  };
  showSound();
  host.style.cssText = 'position:absolute;inset:0';

  const scene: ModuleScene = def.createScene(host);
  const resize = () => {
    const r = host.getBoundingClientRect();
    scene.resize(Math.max(1, r.width), Math.max(1, r.height), Math.min(window.devicePixelRatio || 1, 2));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // --- interaktion
  stage.addEventListener('click', (e) => {
    if (e.target === bigPlay) return;
    sound.unlock();
    ctl.toggle();
  });
  bigPlay.addEventListener('click', () => {
    sound.unlock();
    ctl.play();
  });
  playBtn.addEventListener('click', () => {
    sound.unlock();
    ctl.toggle();
  });
  soundBtn.addEventListener('click', () => {
    sound.setEnabled(!sound.enabled);
    showSound();
  });
  scrub.addEventListener('input', () => ctl.seek(Number(scrub.value)));
  for (const s of sliders)
    s.addEventListener('input', () => {
      ctl.setParam(s.dataset.param!, Number(s.value));
      emit('interact');
    });
  q<HTMLButtonElement>('.nsm-resume').addEventListener('click', () => {
    sound.unlock();
    ctl.play();
  });
  q<HTMLButtonElement>('.nsm-reset').addEventListener('click', () => ctl.resetParams());
  const onKey = (e: KeyboardEvent) => {
    if (!root.contains(document.activeElement) || (document.activeElement as HTMLElement)?.dataset?.param) return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      sound.unlock();
      ctl.toggle();
    }
  };
  window.addEventListener('keydown', onKey);

  // --- ritloop (bara när spelaren syns)
  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) sound.stop();
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  io.observe(root);

  let lastText = '';
  function frame() {
    raf = 0;
    ctl.tick();
    const t = ctl.time;
    const params = ctl.params();
    const mode = ctl.mode;
    scene.render(t, params, mode);
    sound.update(t, ctl.isPlaying && mode === 'film');

    // berättartext
    const ci = chapterIndexAt(def.chapters, t);
    const ch = def.chapters[ci];
    const title = mode === 'explore' ? 'Utforska' : ch.title;
    const text = mode === 'explore' ? def.exploreCaption : typed(ch.caption, ch.start, t);
    if (chapterEl.textContent !== title) chapterEl.textContent = title;
    if (text !== lastText) textEl.textContent = lastText = text;
    const full = mode === 'explore' ? `Utforska. ${def.exploreCaption}` : `${ch.title}. ${ch.caption}`;
    if (full !== srKey && (ctl.isPlaying || mode === 'explore')) srEl.textContent = srKey = full;
    if (ctl.isPlaying) emit('start');
    if (mode === 'film' && t >= def.duration - 0.05) emit('end');

    // uppspelningsrad
    const playing = ctl.isPlaying;
    playBtn.textContent = playing ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'Pausa' : 'Spela');
    bigPlay.hidden = playing || mode === 'explore' || t > 0;
    timeEl.textContent = `${fmtTime(t)} / ${fmtTime(def.duration)}`;
    if (document.activeElement !== scrub) scrub.value = String(t);
    modeEl.dataset.mode = mode;
    modeEl.textContent = mode === 'explore' ? 'du styr' : playing ? 'film' : 'pausad';

    // reglagen följer filmen (utom det besökaren just drar i)
    for (const s of sliders) {
      const id = s.dataset.param!;
      const v = params[id];
      if (document.activeElement !== s) s.value = String(v);
      const spec = def.params.find((p) => p.id === id)!;
      const out = root.querySelector<HTMLOutputElement>(`#nsm-${def.id}-${id}-out`)!;
      const shown = spec.format ? spec.format(v) : formatNumber(v);
      if (out.textContent !== shown) out.textContent = shown;
    }
    if (visible) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    controller: ctl,
    destroy() {
      cancelAnimationFrame(raf);
      sound.dispose();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      scene.dispose();
      root.innerHTML = '';
      root.classList.remove('ns-module');
    },
  };
}
