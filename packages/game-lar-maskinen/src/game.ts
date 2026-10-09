// Spelytan för Lär maskinen (DOM): vikter och bias med − och +, och alla exempel
// i en tabell som visar neuronens gissning direkt. Klart när allt är rätt.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, LIMIT, MAX_MOVES, examples, guess, hint, par, starsFor, sum, wrong } from './neuron';

const CSS = `
.lm{position:absolute;inset:0;overflow:auto;padding:1.2rem clamp(1rem,4cqi,3rem)}
.lm-in{max-width:44rem;margin:0 auto;display:grid;gap:1rem}
.lm-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.lm-rule{margin:0;padding:.8rem 1rem;border-radius:10px;background:rgba(157,182,214,.14)}
.lm-params{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.5rem}
.lm-param{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:.3rem .4rem;padding:.5rem .6rem;border:1px solid var(--g-line);border-radius:10px}
.lm-param span{grid-column:1/-1;font-size:.9rem}
.lm-param b{font:600 1.1rem var(--g-mono);min-width:2.2rem;text-align:center}
.lm .lm-param button{min-width:44px;min-height:44px;padding:0;font:600 1.1rem var(--g-mono)}
.lm table{width:100%;border-collapse:collapse;font:400 .9rem var(--g-mono)}
.lm th,.lm td{padding:.35rem .4rem;border-bottom:1px solid var(--g-line);text-align:center}
.lm th{color:var(--g-dim);font-weight:400}
.lm td.ok{color:var(--g-cold)}
.lm td.bad{color:var(--g-warm);font-weight:700}
.lm-hint{margin:0;color:var(--g-dim);min-height:1.5em}
`;

export function startTraining(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const ex = examples(L);
  const best = par(L);
  const n = L.inputs.length;
  const p = new Array(n + 1).fill(0);
  let moves = 0,
    finished = false;
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'lm';
  host.append(style, el);
  api.setStatus(L.goal);

  const names = [...L.inputs.map((i) => `Vikt för ${i.label.toLowerCase()}`), 'Bias'];
  el.innerHTML = `<div class="lm-in">
    <p class="lm-rule"><b>Regeln:</b> ${L.ruleText} Neuronen säger ja när summan är över noll.</p>
    <p class="lm-lbl">NEURONEN</p>
    <div class="lm-params">${names
      .map(
        (name, i) => `<div class="lm-param"><span>${name}</span>
          <button type="button" data-i="${i}" data-d="-1" aria-label="Sänk ${name.toLowerCase()}">−</button>
          <b data-v="${i}">0</b>
          <button type="button" data-i="${i}" data-d="1" aria-label="Höj ${name.toLowerCase()}">+</button></div>`,
      )
      .join('')}</div>
    <p class="lm-hint" aria-live="polite"></p>
    <p class="lm-lbl">EXEMPLEN</p>
    <table><thead><tr>${L.inputs.map((i) => `<th scope="col">${i.label}</th>`).join('')}<th scope="col">Summa</th><th scope="col">Neuronen</th><th scope="col">Kim</th></tr></thead><tbody></tbody></table>
  </div>`;
  const tbody = el.querySelector('tbody')!;
  const hintEl = el.querySelector<HTMLParagraphElement>('.lm-hint')!;

  function render() {
    p.forEach((v, i) => (el.querySelector(`[data-v="${i}"]`)!.textContent = String(v)));
    tbody.innerHTML = ex
      .map((e) => {
        const g = guess(p, e.x);
        const ok = g === e.yes;
        return `<tr>${e.x.map((v) => `<td>${v ? 'ja' : 'nej'}</td>`).join('')}<td>${sum(p, e.x)}</td><td class="${ok ? 'ok' : 'bad'}">${g ? 'ja' : 'nej'} ${ok ? '✓' : '✗'}</td><td>${e.yes ? 'ja' : 'nej'}</td></tr>`;
      })
      .join('');
    const w = wrong(p, ex).length;
    api.setScore(`${moves} drag · ${w} fel`);
    hintEl.textContent = hint(L, p) ?? '';
    if (w === 0 && moves > 0 && !finished) {
      finished = true;
      api.sound('win');
      const extra = moves <= best ? 'Kortare går inte.' : `Det går på ${best} drag.`;
      api.finish({ score: moves, stars: starsFor(moves, best), message: `Alla rätt på ${moves} drag. ${extra} ${L.lesson}` });
    } else if (moves >= MAX_MOVES && !finished) {
      finished = true;
      api.finish({ score: moves, stars: 1, message: `${MAX_MOVES} drag och fortfarande fel. Det går på ${best}. ${L.lesson}` });
    }
  }

  el.querySelectorAll<HTMLButtonElement>('.lm-param button').forEach((b) =>
    b.addEventListener('click', () => {
      if (finished) return;
      const i = Number(b.dataset.i),
        d = Number(b.dataset.d);
      if (Math.abs(p[i] + d) > LIMIT) return api.sound('bad');
      p[i] += d;
      moves++;
      api.sound('tick');
      render();
    }),
  );
  render();

  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
