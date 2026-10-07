// Spelytan för Vem är ”den”? (DOM): meningen som klickbara ord, pronomenet
// markerat. Efter valet visas uppmärksamheten från pronomenet som staplar
// ovanför orden, och en förklaring.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, bare, parse, shuffled, starsFor } from './sentences';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const CSS = `
.vd{position:absolute;inset:0;display:grid;align-content:safe center;gap:1.1rem;padding:1.2rem clamp(1rem,4cqi,3rem);overflow:auto}
.vd-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.vd-sent{display:flex;flex-wrap:wrap;align-items:flex-end;column-gap:.1rem;row-gap:.5rem;font-size:clamp(1.1rem,3.4cqi,1.6rem);line-height:1.2}
.vd-w{display:grid;grid-template-rows:2.6rem auto;justify-items:center}
.vd-bar{align-self:end;width:70%;border-radius:3px 3px 0 0;background:var(--g-cold);opacity:.75;height:0;transition:height .5s ease}
.vd-bar.top{background:var(--g-warm);opacity:1}
.vd button.vd-word{all:unset;box-sizing:border-box;cursor:pointer;padding:.25rem .3rem;border-radius:6px;border:2px solid transparent}
.vd button.vd-word:hover,.vd button.vd-word:focus-visible{background:rgba(157,182,214,.16);border-color:transparent}
.vd button.vd-word:disabled{cursor:default;background:none}
.vd button.vd-word.post{color:var(--g-dim);cursor:default}
.vd button.vd-word.pron{color:var(--g-ink);background:rgba(200,100,63,.28);cursor:default}
.vd button.vd-word.right{border-color:var(--g-cold)}
.vd button.vd-word.wrong{border-color:var(--g-warm);border-style:dashed}
.vd-pct{font:400 .62rem/1 var(--g-mono);color:var(--g-dim);align-self:end;justify-self:center;margin-bottom:.15rem}
`;

export function startWho(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const items = shuffled(level, api.rng);
  let i = 0,
    right = 0;
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'vd';
  host.append(style, el);
  const score = () => api.setScore(`${right} rätt av ${i}`);

  function show() {
    const it = items[i];
    const p = parse(it);
    score();
    api.setStatus(`Mening ${i + 1} av ${items.length}. ${L.goal}`);
    const pron = bare(p.words[p.pronoun]);
    el.innerHTML = `
      <p class="vd-lbl">MENING ${i + 1} / ${items.length} · VEM ELLER VAD ÄR ”${esc(pron.toUpperCase())}”?</p>
      <div class="vd-sent">${p.words
        .map(
          (w, k) =>
            `<span class="vd-w"><span class="vd-bar" data-k="${k}"></span><button type="button" class="vd-word${
              k === p.pronoun ? ' pron' : k > p.pronoun ? ' post' : ''
            }" data-k="${k}"${k >= p.pronoun ? ' tabindex="-1" aria-disabled="true"' : ''}>${esc(w)}</button></span>`,
        )
        .join('')}</div>
      <div class="after"></div>`;
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('.vd-word')];
    buttons.forEach((b) => {
      const k = Number(b.dataset.k);
      if (k < p.pronoun) b.addEventListener('click', () => pick(k));
    });
    buttons[0]?.focus();

    function pick(k: number) {
      const ok = k === p.answer;
      if (ok) right++;
      i++;
      score();
      api.sound(ok ? 'ok' : 'bad');
      buttons.forEach((b) => (b.disabled = true));
      buttons[p.answer].classList.add('right');
      if (!ok) buttons[k].classList.add('wrong');
      // staplarna: uppmärksamhet från pronomenet
      const max = Math.max(...p.weights);
      el.querySelectorAll<HTMLSpanElement>('.vd-bar').forEach((bar) => {
        const j = Number(bar.dataset.k);
        if (j >= p.pronoun) return;
        bar.style.height = `${Math.max(4, (p.weights[j] / max) * 100)}%`;
        if (j === p.headPick) bar.classList.add('top');
      });
      const head = bare(p.words[p.headPick]);
      const headLine =
        p.headPick === p.answer
          ? `Uppmärksamheten lade mest vikt på ”${esc(head)}”, alltså rätt ord.`
          : `Uppmärksamheten lade mest vikt på ”${esc(head)}” och valde fel. Ett enda huvud räcker inte alltid, därför har modellerna många.`;
      const last = i >= items.length;
      const after = el.querySelector('.after')!;
      after.innerHTML = `
        <p style="margin:0 0 .4rem;line-height:1.5"><b style="color:${ok ? 'var(--g-cold)' : 'var(--g-warm)'}">${
          ok ? 'Rätt.' : 'Inte riktigt.'
        }</b> ${esc(it.why)}</p>
        <p style="margin:0 0 .8rem;line-height:1.5;color:var(--g-dim)">${headLine}</p>
        <button type="button" class="nsg-primary">${last ? 'Se resultatet' : 'Nästa mening'}</button>`;
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
  }

  show();
  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
