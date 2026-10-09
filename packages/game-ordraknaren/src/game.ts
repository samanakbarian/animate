// Spelytan för Ordräknaren (DOM): texten med sammanhanget markerat, frågan och
// svarsknappar. Efteråt visas hur ofta varje ord följde, som staplar.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, TEXT, mostCommon, nextCounts, probability, probabilityOptions, starsFor } from './counts';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const pct = (v: number) => `${Math.round(v * 100)} %`;

const CSS = `
.or{position:absolute;inset:0;overflow:auto;padding:1.2rem clamp(1rem,4cqi,3rem)}
.or-in{max-width:44rem;margin:0 auto;display:grid;gap:1rem}
.or-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.or-text{margin:0;padding:.8rem 1rem;border-radius:10px;background:rgba(255,255,255,.05);font:400 .95rem/1.8 var(--g-mono)}
.or-text mark{background:rgba(200,100,63,.35);color:var(--g-ink);border-radius:3px;padding:0 .15em}
.or-q{margin:0;font-size:1.1rem;line-height:1.45}
.or-opts{display:flex;flex-wrap:wrap;gap:.5rem}
.or .or-opts button{min-width:6rem;min-height:44px}
.or-bars{display:grid;gap:.3rem;margin:0;padding:0;list-style:none}
.or-bars li{display:grid;grid-template-columns:7rem 1fr 3.5rem;gap:.6rem;align-items:center;font:400 .9rem var(--g-mono)}
.or-bar{height:.7rem;border-radius:3px;background:var(--g-cold)}
`;

/** Texten med alla förekomster av sammanhanget markerade. */
function marked(context: string[]): string {
  return TEXT.map((line) => {
    const w = line.replace('.', ' .').split(' ');
    const out: string[] = [];
    for (let i = 0; i < w.length; i++) {
      if (context.every((c, j) => w[i + j] === c)) {
        out.push(`<mark>${esc(w.slice(i, i + context.length).join(' '))}</mark>`);
        i += context.length - 1;
      } else out.push(esc(w[i]));
    }
    return out.join(' ').replace(' .', '.');
  }).join(' ');
}

export function startCounting(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  let qi = 0,
    right = 0;
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'or';
  host.append(style, el);
  const score = () => api.setScore(`${right} rätt av ${qi}`);

  function show() {
    const q = L.questions[qi];
    const ctx = q.context.join(' ');
    const counts = [...nextCounts(q.context)].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'sv'));
    const total = counts.reduce((a, c) => a + c[1], 0);
    score();
    api.setStatus(`Fråga ${qi + 1} av ${L.questions.length}. ${L.goal}`);
    let options: { label: string; right: boolean }[];
    let question: string;
    if (q.probabilityOf) {
      const p = probability(q.context, q.probabilityOf);
      const r = Math.round(p * 100) / 100;
      options = probabilityOptions(p).map((v) => ({ label: pct(v), right: v === r }));
      question = `Hur stor del av gångerna kommer ”${esc(q.probabilityOf)}” efter ”${esc(ctx)}”?`;
    } else {
      const best = mostCommon(q.context);
      // alla ord som följer, i bokstavsordning så att ordningen inte avslöjar svaret
      options = [...counts]
        .map((c) => c[0])
        .sort((a, b) => a.localeCompare(b, 'sv'))
        .map((w) => ({ label: w, right: w === best }));
      question = `Vilket ord kommer oftast efter ”${esc(ctx)}”?`;
    }
    el.innerHTML = `<div class="or-in">
      <p class="or-lbl">FRÅGA ${qi + 1} / ${L.questions.length} · TEXTEN MODELLEN HAR LÄST</p>
      <p class="or-text">${marked(q.context)}</p>
      <p class="or-q">${question}</p>
      <div class="or-opts">${options.map((o, i) => `<button type="button" data-i="${i}">${esc(o.label)}</button>`).join('')}</div>
      <div class="or-after"></div>
    </div>`;
    el.scrollTop = 0;
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('.or-opts button')];
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        const o = options[Number(b.dataset.i)];
        if (o.right) right++;
        qi++;
        score();
        api.sound(o.right ? 'ok' : 'bad');
        buttons.forEach((x, i) => {
          x.disabled = true;
          if (options[i].right) x.style.borderColor = 'var(--g-cold)';
          else if (x === b) x.style.borderColor = 'var(--g-warm)';
        });
        const max = counts[0]?.[1] ?? 1;
        const last = qi >= L.questions.length;
        el.querySelector('.or-after')!.innerHTML = `
          <p style="margin:0 0 .5rem"><b style="color:${o.right ? 'var(--g-cold)' : 'var(--g-warm)'}">${o.right ? 'Rätt.' : 'Inte riktigt.'}</b>
          Efter ”${esc(ctx)}” kommer ${total} ord i texten:</p>
          <ul class="or-bars">${counts
            .map(
              ([w, n]) =>
                `<li><span>${esc(w)}</span><span class="or-bar" style="width:${(n / max) * 100}%;${w === q.probabilityOf ? 'background:var(--g-warm)' : ''}"></span><span>${n} · ${pct(n / total)}</span></li>`,
            )
            .join('')}</ul>
          <button type="button" class="nsg-primary" style="margin-top:.8rem">${last ? 'Se resultatet' : 'Nästa fråga'}</button>`;
        const next = el.querySelector<HTMLButtonElement>('.or-after button')!;
        next.focus();
        next.addEventListener('click', () =>
          last
            ? api.finish({
                score: right,
                stars: starsFor(right, L.questions.length),
                message: `${right} av ${L.questions.length} rätt. ${L.lesson}`,
              })
            : show(),
        );
      }),
    );
  }

  show();
  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
