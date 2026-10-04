// Modulspelaren (DOM): scenyta med berättartext, uppspelningsrad med kapitel-
// markeringar och reglage för modulens parametrar. När besökaren rör ett
// reglage pausas filmen och utforskaläget tar över.

import './player.css';
import { ModuleController } from './controller';
import { chapterIndexAt, formatNumber } from './params';
import type { ModuleDefinition, ModuleScene } from './types';

export interface ModulePlayerHandle {
  controller: ModuleController;
  destroy(): void;
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Skriver fram texten tecken för tecken (deterministiskt av tiden sedan start). */
const typed = (text: string, since: number, now: number, cps = 45) => text.slice(0, Math.max(0, Math.floor((now - since) * cps)));

export function mountModulePlayer(root: HTMLElement, def: ModuleDefinition, opts: { clock?: () => number } = {}): ModulePlayerHandle {
  const clock = opts.clock ?? (() => performance.now() / 1000);
  const ctl = new ModuleController(def, clock);
  root.classList.add('ns-module');
  root.innerHTML = `
    <div class="nsm-stage" aria-label="${def.title} – klicka för att spela eller pausa">
      <div class="nsm-canvas"></div>
      <div class="nsm-caption" aria-live="polite"><div class="nsm-chapter"></div><p class="nsm-text"></p></div>
      <button type="button" class="nsm-bigplay" aria-label="Spela filmen">▶</button>
    </div>
    <div class="nsm-bar">
      <button type="button" class="nsm-play" aria-label="Spela">▶</button>
      <span class="nsm-time">0:00 / ${fmtTime(def.duration)}</span>
      <div class="nsm-scrub">
        <input type="range" min="0" max="${def.duration}" step="0.01" value="0" aria-label="Tid i filmen" />
        <div class="nsm-ticks">${def.chapters.map((c) => `<span style="left:${(c.start / def.duration) * 100}%"></span>`).join('')}</div>
      </div>
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
  const bigPlay = q<HTMLButtonElement>('.nsm-bigplay');
  const playBtn = q<HTMLButtonElement>('.nsm-play');
  const timeEl = q<HTMLSpanElement>('.nsm-time');
  const scrub = q<HTMLInputElement>('.nsm-scrub input');
  const modeEl = q<HTMLSpanElement>('.nsm-mode');
  const sliders = [...root.querySelectorAll<HTMLInputElement>('input[data-param]')];
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
    ctl.toggle();
  });
  bigPlay.addEventListener('click', () => ctl.play());
  playBtn.addEventListener('click', () => ctl.toggle());
  scrub.addEventListener('input', () => ctl.seek(Number(scrub.value)));
  for (const s of sliders) s.addEventListener('input', () => ctl.setParam(s.dataset.param!, Number(s.value)));
  q<HTMLButtonElement>('.nsm-resume').addEventListener('click', () => ctl.play());
  q<HTMLButtonElement>('.nsm-reset').addEventListener('click', () => ctl.resetParams());
  const onKey = (e: KeyboardEvent) => {
    if (!root.contains(document.activeElement) || (document.activeElement as HTMLElement)?.dataset?.param) return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      ctl.toggle();
    }
  };
  window.addEventListener('keydown', onKey);

  // --- ritloop (bara när spelaren syns)
  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
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

    // berättartext
    const ci = chapterIndexAt(def.chapters, t);
    const ch = def.chapters[ci];
    const title = mode === 'explore' ? 'Utforska' : ch.title;
    const text = mode === 'explore' ? def.exploreCaption : typed(ch.caption, ch.start, t);
    if (chapterEl.textContent !== title) chapterEl.textContent = title;
    if (text !== lastText) textEl.textContent = lastText = text;

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
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      scene.dispose();
      root.innerHTML = '';
      root.classList.remove('ns-module');
    },
  };
}
