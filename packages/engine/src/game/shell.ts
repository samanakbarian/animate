// Spelskalet (DOM): startskärm med banor och bästa resultat, spelyta, poäng och
// status, och en resultatskärm med stjärnor. Spelet självt ritar i spelytan.

import './game.css';
import { Rng } from '../core/math';
import { readBest, saveBest } from './best';
import { playSound } from './sfx';
import type { GameDefinition, GameResult, GameSession } from './types';

const seedOf = (id: string, level: number) => [...id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 17) + level * 7919;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export interface GameHandle {
  destroy(): void;
}

export function mountGame(root: HTMLElement, def: GameDefinition, opts: { moduleHref?: string; moduleTitle?: string } = {}): GameHandle {
  root.classList.add('ns-game');
  root.innerHTML = `
    <div class="nsg-head"><span class="nsg-level">${esc(def.title)}</span><span class="nsg-score"></span></div>
    <div class="nsg-stage">
      <div class="nsg-host"></div>
      <div class="nsg-overlay" role="dialog" aria-live="polite"></div>
    </div>
    <div class="nsg-foot"><span class="nsg-status" aria-live="polite"></span></div>`;
  const q = <T extends Element>(s: string) => root.querySelector(s) as T;
  const host = q<HTMLDivElement>('.nsg-host');
  const overlay = q<HTMLDivElement>('.nsg-overlay');
  const levelEl = q<HTMLSpanElement>('.nsg-level');
  const scoreEl = q<HTMLSpanElement>('.nsg-score');
  const statusEl = q<HTMLSpanElement>('.nsg-status');

  let session: GameSession | null = null;
  let current = 0;

  const resize = () => {
    const r = host.getBoundingClientRect();
    session?.resize?.(Math.max(1, r.width), Math.max(1, r.height), Math.min(window.devicePixelRatio || 1, 2));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const fmtBest = (i: number) => {
    const b = readBest(def.id, i);
    return b === null ? 'inte spelad' : `bäst: ${b} ${def.scoreLabel}`;
  };

  function stop() {
    session?.dispose();
    session = null;
    host.innerHTML = '';
  }

  function menu() {
    stop();
    levelEl.textContent = def.title;
    scoreEl.textContent = '';
    statusEl.textContent = '';
    overlay.hidden = false;
    overlay.innerHTML = `
      <h3>${esc(def.title)}</h3>
      <p>${esc(def.intro)}</p>
      <div class="nsg-levels">
        ${def.levels
          .map(
            (l, i) => `<button type="button" class="nsg-level-btn${i === 0 ? ' nsg-primary' : ''}" data-level="${i}">
              <span>${i + 1}. ${esc(l.title)}</span><small>${esc(fmtBest(i))}</small></button>`,
          )
          .join('')}
      </div>`;
    overlay
      .querySelectorAll<HTMLButtonElement>('[data-level]')
      .forEach((b) => b.addEventListener('click', () => start(Number(b.dataset.level))));
  }

  function start(i: number) {
    stop();
    current = i;
    const level = def.levels[i];
    levelEl.textContent = `${def.title} · bana ${i + 1}: ${level.title}`;
    scoreEl.textContent = '';
    statusEl.textContent = level.goal;
    overlay.hidden = true;
    overlay.innerHTML = '';
    let done = false;
    session = def.start(host, i, {
      rng: new Rng(seedOf(def.id, i)),
      setScore: (t) => (scoreEl.textContent = t),
      setStatus: (t) => (statusEl.textContent = t),
      sound: (k) => playSound(k),
      finish: (r) => {
        if (done) return;
        done = true;
        result(r);
      },
    });
    resize();
  }

  function result(r: GameResult) {
    const record = saveBest(def.id, current, r.score, def.lowerIsBetter);
    playSound(r.stars === 3 ? 'win' : 'ok');
    const hasNext = current + 1 < def.levels.length;
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="nsg-stars" aria-label="${r.stars} av 3 stjärnor">${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}</div>
      <h3>${r.score} ${esc(def.scoreLabel)}${record && (r.score > 0 || def.lowerIsBetter) ? ' · nytt rekord' : ''}</h3>
      <p>${esc(r.message)}</p>
      <div class="nsg-actions">
        ${hasNext ? '<button type="button" class="nsg-primary" data-act="next">Nästa bana</button>' : ''}
        <button type="button" data-act="again">Spela igen</button>
        <button type="button" data-act="menu">Alla banor</button>
      </div>
      ${opts.moduleHref ? `<p><a href="${esc(opts.moduleHref)}">Läs mer i modulen ${esc(opts.moduleTitle ?? '')} →</a></p>` : ''}`;
    overlay.querySelector('[data-act=next]')?.addEventListener('click', () => start(current + 1));
    overlay.querySelector('[data-act=again]')?.addEventListener('click', () => start(current));
    overlay.querySelector('[data-act=menu]')?.addEventListener('click', menu);
    overlay.querySelector<HTMLButtonElement>('button')?.focus();
  }

  menu();
  return {
    destroy() {
      stop();
      ro.disconnect();
      root.innerHTML = '';
      root.classList.remove('ns-game');
    },
  };
}
