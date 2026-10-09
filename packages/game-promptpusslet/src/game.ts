// Spelytan för Promptpusslet (DOM): målet överst, bitarna som knappar att slå
// på och av, frågan som den blir, och efter att den skickats en genomgång bit för bit.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, type Piece, maxScore, scoreTask, shuffledOrder, starsFor } from './tasks';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const CSS = `
.pp{position:absolute;inset:0;overflow:auto;padding:1.2rem clamp(1rem,4cqi,3rem)}
.pp-in{max-width:44rem;margin:0 auto;display:grid;gap:1rem}
.pp-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.pp-goal{margin:0;padding:.8rem 1rem;border-radius:10px;background:rgba(157,182,214,.14);line-height:1.45}
.pp-pieces{display:grid;gap:.45rem}
.pp button.pp-piece{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:.6rem;align-items:flex-start;min-height:44px;padding:.6rem .8rem;border-radius:10px;border:1px solid var(--g-line);line-height:1.4}
.pp button.pp-piece:hover,.pp button.pp-piece:focus-visible{border-color:var(--g-cold)}
.pp button.pp-piece[aria-pressed=true]{border-color:var(--g-cold);background:rgba(157,182,214,.14)}
.pp button.pp-piece:disabled{cursor:default}
.pp-box{flex:none;width:1.1rem;height:1.1rem;margin-top:.15rem;border:1px solid var(--g-dim);border-radius:4px;display:grid;place-items:center;font-size:.8rem}
.pp button.pp-piece[aria-pressed=true] .pp-box{background:var(--g-cold);border-color:var(--g-cold);color:#07090b}
.pp-prompt{margin:0;padding:.8rem 1rem;border-radius:10px;border:1px dashed var(--g-line);font:400 .95rem/1.5 var(--g-mono);min-height:3rem}
.pp-row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}
.pp-review{display:grid;gap:.4rem;margin:0;padding:0;list-style:none}
.pp-review li{padding:.5rem .7rem;border-radius:8px;line-height:1.4;border-left:3px solid var(--g-line)}
.pp-review .good{border-color:var(--g-cold)}
.pp-review .bad{border-color:var(--g-warm)}
.pp-review b{font-family:var(--g-mono);font-weight:600;margin-right:.4rem}
`;

export function startPuzzle(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const max = maxScore(level);
  let ti = 0,
    total = 0;
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'pp';
  host.append(style, el);
  const score = () => api.setScore(`${total} av ${max} poäng`);

  function show() {
    const task = L.tasks[ti];
    const order = shuffledOrder(task.pieces.length, api.rng);
    const chosen = new Set<number>();
    score();
    api.setStatus(`Uppgift ${ti + 1} av ${L.tasks.length}. ${L.goal}`);
    el.innerHTML = `<div class="pp-in">
      <p class="pp-lbl">UPPGIFT ${ti + 1} / ${L.tasks.length} · DITT MÅL</p>
      <p class="pp-goal">${esc(task.goal)}</p>
      <p class="pp-lbl">VÄLJ BITAR TILL FRÅGAN</p>
      <div class="pp-pieces">${order
        .map(
          (i) =>
            `<button type="button" class="pp-piece" aria-pressed="false" data-i="${i}"><span class="pp-box" aria-hidden="true"></span><span>${esc(task.pieces[i].text)}</span></button>`,
        )
        .join('')}</div>
      <p class="pp-lbl">DIN FRÅGA</p>
      <p class="pp-prompt" aria-live="polite"></p>
      <div class="pp-row"><button type="button" class="nsg-primary" data-send>Skicka frågan</button></div>
      <div class="pp-after"></div>
    </div>`;
    el.scrollTop = 0;
    const promptEl = el.querySelector<HTMLParagraphElement>('.pp-prompt')!;
    const renderPrompt = () => {
      // bitarna i den ordning de visas, så att frågan läses uppifrån och ned
      const text = order.filter((i) => chosen.has(i)).map((i) => task.pieces[i].text);
      promptEl.textContent = text.length ? text.join(' ') : 'Välj bitar ovanför.';
    };
    renderPrompt();
    el.querySelectorAll<HTMLButtonElement>('.pp-piece').forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.i);
        if (chosen.has(i)) chosen.delete(i);
        else chosen.add(i);
        b.setAttribute('aria-pressed', String(chosen.has(i)));
        b.querySelector('.pp-box')!.textContent = chosen.has(i) ? '✓' : '';
        api.sound('tick');
        renderPrompt();
      }),
    );
    el.querySelector('[data-send]')!.addEventListener('click', (e) => {
      (e.currentTarget as HTMLButtonElement).disabled = true;
      el.querySelectorAll<HTMLButtonElement>('.pp-piece').forEach((b) => (b.disabled = true));
      const r = scoreTask(task, chosen);
      total += r.points;
      score();
      api.sound(r.points === r.max ? 'ok' : 'bad');
      const line = (p: Piece, i: number) => {
        const picked = chosen.has(i);
        const good = (p.kind === 'need' && picked) || (p.kind !== 'need' && !picked);
        const tag =
          p.kind === 'need' ? (picked ? '+1' : 'saknas') : p.kind === 'trap' ? (picked ? '−1' : 'undvek') : picked ? '±0' : 'undvek';
        return `<li class="${good ? 'good' : 'bad'}"><b>${tag}</b>${esc(p.text)} <span style="color:var(--g-dim)">${esc(p.why)}</span></li>`;
      };
      const last = ti >= L.tasks.length - 1;
      el.querySelector('.pp-after')!.innerHTML = `
        <p style="margin:.4rem 0;line-height:1.5"><b style="color:${r.points === r.max ? 'var(--g-cold)' : 'var(--g-warm)'}">${r.points} av ${r.max} poäng.</b> ${
          r.points === r.max && !r.traps.length ? 'Frågan säger allt modellen behöver.' : 'Så här bidrog varje bit:'
        }</p>
        <ul class="pp-review">${order.map((i) => line(task.pieces[i], i)).join('')}</ul>
        <div class="pp-row" style="margin-top:.8rem"><button type="button" class="nsg-primary" data-next>${last ? 'Se resultatet' : 'Nästa uppgift'}</button></div>`;
      const next = el.querySelector<HTMLButtonElement>('[data-next]')!;
      next.focus();
      next.addEventListener('click', () => {
        if (!last) {
          ti++;
          return show();
        }
        api.finish({ score: total, stars: starsFor(total, max), message: `${total} av ${max} poäng. ${L.lesson}` });
      });
    });
  }

  show();
  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
