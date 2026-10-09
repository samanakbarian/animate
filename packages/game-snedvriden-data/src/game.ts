// Spelytan för Snedvriden data (DOM): korten i högen, välj så många som banan
// tillåter, träna och se resultatet på ett rättvist test.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, evaluate, pool, starsFor } from './pool';

const CSS = `
.sd{position:absolute;inset:0;overflow:auto;padding:1.2rem clamp(1rem,4cqi,3rem)}
.sd-in{max-width:46rem;margin:0 auto;display:grid;gap:1rem}
.sd-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.sd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(6.5rem,1fr));gap:.5rem}
.sd button.sd-card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;border-radius:10px;overflow:hidden;border:2px solid var(--g-line);min-height:44px}
.sd button.sd-card:focus-visible{outline:2px solid var(--g-cold);outline-offset:2px}
.sd button.sd-card[aria-pressed=true]{border-color:var(--g-cold)}
.sd button.sd-card:disabled{cursor:default}
.sd-bg{height:2.6rem;display:grid;place-items:center;font-size:1.3rem}
.sd-bg.snow{background:linear-gradient(#e8ebee,#c9d3dc)}
.sd-bg.grass{background:linear-gradient(#5f8f52,#3f6b39)}
.sd-dot{width:1.1rem;height:1.1rem;border-radius:50%}
.sd-name{padding:.35rem .5rem;font-size:.82rem;text-align:center;background:var(--g-surface)}
.sd button.sd-card[aria-pressed=true] .sd-name{background:rgba(157,182,214,.2)}
.sd-row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}
.sd-count{margin-right:auto;font:400 .9rem var(--g-mono)}
`;

export function startData(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const cards = pool(level);
  // fast blandning per bana
  const order = cards.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(api.rng.next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const chosen = new Set<number>();
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'sd';
  host.append(style, el);
  api.setStatus(L.goal);

  el.innerHTML = `<div class="sd-in">
    <p class="sd-lbl">HÖGEN MED BILDER · VÄLJ HÖGST ${L.picks}</p>
    <div class="sd-grid">${order
      .map((i) => {
        const c = cards[i];
        return `<button type="button" class="sd-card" aria-pressed="false" data-i="${i}" aria-label="${c.label}">
          <span class="sd-bg ${c.snow > 0.5 ? 'snow' : 'grass'}"><span class="sd-dot" style="background:${c.wolf ? '#c8643f' : '#9db6d6'}"></span></span>
          <span class="sd-name">${c.label}</span></button>`;
      })
      .join('')}</div>
    <div class="sd-row"><span class="sd-count" aria-live="polite"></span><button type="button" class="nsg-primary" data-train>Träna modellen</button></div>
    <div class="sd-after"></div>
  </div>`;
  const countEl = el.querySelector<HTMLSpanElement>('.sd-count')!;
  const trainBtn = el.querySelector<HTMLButtonElement>('[data-train]')!;
  const update = () => {
    countEl.textContent = `${chosen.size} av högst ${L.picks} valda`;
    trainBtn.disabled = chosen.size < 2;
    api.setScore(`${chosen.size}/${L.picks}`);
  };
  update();
  el.querySelectorAll<HTMLButtonElement>('.sd-card').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (chosen.has(i)) chosen.delete(i);
      else if (chosen.size < L.picks) chosen.add(i);
      else return api.sound('bad');
      b.setAttribute('aria-pressed', String(chosen.has(i)));
      api.sound('tick');
      update();
    }),
  );
  trainBtn.addEventListener('click', () => {
    trainBtn.disabled = true;
    el.querySelectorAll<HTMLButtonElement>('.sd-card').forEach((b) => (b.disabled = true));
    const picked = [...chosen].map((i) => cards[i]);
    const r = evaluate(picked);
    const pct = Math.round(r.accuracy * 100);
    const snow = Math.round(r.snow * 100);
    api.sound(pct >= 85 ? 'win' : pct >= 70 ? 'ok' : 'bad');
    el.querySelector('.sd-after')!.innerHTML = `
      <p style="margin:0 0 .4rem;line-height:1.5"><b>${pct} % rätt</b> på ett rättvist test där vargar och hundar står lika ofta i snö.
      Snön avgör ${snow} % av beslutet.</p>
      <p style="margin:0;line-height:1.5;color:var(--g-dim)">${
        snow > 50
          ? 'Modellen tog genvägen: snö betyder varg. Ta med fler vargar på gräs och hundar i snö.'
          : pct >= 85
            ? 'Modellen lärde sig formen, inte snön.'
            : 'Snön avgör inte allt, men modellen har för få bra exempel på formen.'
      }</p>
      <div class="sd-row" style="margin-top:.8rem"><button type="button" class="nsg-primary" data-done>Se resultatet</button></div>`;
    const done = el.querySelector<HTMLButtonElement>('[data-done]')!;
    done.focus();
    done.addEventListener('click', () =>
      api.finish({ score: pct, stars: starsFor(r.accuracy), message: `${pct} % rätt på det rättvisa testet. ${L.lesson}` }),
    );
  });

  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
