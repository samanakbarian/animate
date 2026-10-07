// Spelytan för Hallucinationsjakten (DOM): en fråga, AI:ns svar i en pratbubbla
// och två knappar. Efter gissningen visas facit och en förklaring.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, shuffled, starsFor } from './items';

/** ”Stämmer. …” → ”Svaret stämmer. …”, ”Påhittat. …” → ”Svaret är påhittat. …”. */
const verdict = (why: string) => why.replace(/^Stämmer\./, 'Svaret stämmer.').replace(/^Påhittat\./, 'Svaret är påhittat.');

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function startHunt(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const items = shuffled(level, api.rng);
  let i = 0,
    right = 0;
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;inset:0;display:grid;align-content:center;gap:1rem;padding:1.2rem clamp(1rem,4cqi,3rem);overflow:auto';
  host.appendChild(el);
  const score = () => api.setScore(`${right} rätt av ${i}`);

  function show() {
    const it = items[i];
    score();
    api.setStatus(`Fråga ${i + 1} av ${items.length}. ${L.goal}`);
    el.innerHTML = `
      <p style="margin:0;font:400 .75rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)">FRÅGA ${i + 1} / ${items.length}</p>
      <p style="justify-self:end;max-width:80%;margin:0;padding:.8rem 1rem;border-radius:12px;background:rgba(157,182,214,.16);font-size:clamp(1rem,2.6cqi,1.2rem)">${esc(it.question)}</p>
      <div style="display:grid;gap:.3rem;max-width:85%">
        <span style="font:400 .7rem/1 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)">AI</span>
        <p style="margin:0;padding:.8rem 1rem;border-radius:12px;background:rgba(255,255,255,.07);font-size:clamp(1.05rem,2.8cqi,1.3rem);line-height:1.45">${esc(it.answer)}</p>
      </div>
      <div class="choice" style="display:flex;gap:.6rem;flex-wrap:wrap">
        <button type="button" data-v="1" style="flex:1;min-width:8rem;padding:.9rem">Stämmer</button>
        <button type="button" data-v="0" style="flex:1;min-width:8rem;padding:.9rem">Påhittat</button>
      </div>
      <div class="after"></div>`;
    el.querySelectorAll<HTMLButtonElement>('[data-v]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.v === '1')));
    el.querySelector<HTMLButtonElement>('[data-v]')?.focus();
  }

  function pick(saysTrue: boolean) {
    const it = items[i];
    const ok = saysTrue === it.true;
    if (ok) right++;
    i++;
    score();
    api.sound(ok ? 'ok' : 'bad');
    el.querySelectorAll<HTMLButtonElement>('[data-v]').forEach((b) => {
      b.disabled = true;
      const isTruth = (b.dataset.v === '1') === it.true;
      if (isTruth) b.style.borderColor = 'var(--g-cold)';
      else if ((b.dataset.v === '1') === saysTrue) b.style.borderColor = 'var(--g-warm)';
    });
    const last = i >= items.length;
    const after = el.querySelector('.after')!;
    after.innerHTML = `
      <p style="margin:0 0 .8rem;line-height:1.5"><b style="color:${ok ? 'var(--g-cold)' : 'var(--g-warm)'}">${ok ? 'Du hade rätt.' : 'Du hade fel.'}</b> ${esc(verdict(it.why))}</p>
      <button type="button" class="nsg-primary">${last ? 'Se resultatet' : 'Nästa fråga'}</button>`;
    const next = after.querySelector('button')!;
    next.focus();
    next.addEventListener('click', () => {
      if (!last) return show();
      api.finish({
        score: right,
        stars: starsFor(right, items.length),
        message: `${right} av ${items.length} rätt. ${L.lesson}`,
      });
    });
  }

  show();
  return {
    dispose() {
      el.remove();
    },
  };
}
