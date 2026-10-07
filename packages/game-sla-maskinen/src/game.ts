// Spelytan för Slå maskinen (DOM): meningen med en lucka, alternativen som
// knappar, och efter varje gissning vad maskinen valde och hur sannolika
// alternativen var enligt modellen.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { ROUNDS, type Round, makeRounds, starsFor } from './rounds';

export const CHOICES = [4, 6];

const pct = (p: number) => `${Math.round(p * 100)} %`;

export function startMachine(host: HTMLElement, level: number, api: GameApi): GameSession {
  const rounds: Round[] = makeRounds(api.rng, CHOICES[level]);
  let i = 0,
    you = 0,
    machine = 0;
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;inset:0;display:grid;align-content:center;gap:1.2rem;padding:1.2rem clamp(1rem,4cqi,3rem);overflow:auto';
  host.appendChild(el);
  const score = () => api.setScore(`du ${you} · maskinen ${machine}`);

  function show() {
    const r = rounds[i];
    score();
    api.setStatus(`Runda ${i + 1} av ${ROUNDS}. Vilket ord kommer härnäst i texten?`);
    el.innerHTML = `
      <p style="margin:0;font:400 .75rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)">RUNDA ${i + 1} / ${ROUNDS}</p>
      <p style="margin:0;font-size:clamp(1.3rem,4.4cqi,2.1rem);line-height:1.3">${r.context.join(' ')} <span style="display:inline-block;min-width:4em;border-bottom:2px solid var(--g-warm)">&nbsp;</span></p>
      <div class="opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));gap:.5rem">
        ${r.options.map((o, k) => `<button type="button" data-k="${k}" style="font-size:1.05rem;padding:.8rem">${o.token}</button>`).join('')}
      </div>
      <div class="after"></div>`;
    el.querySelectorAll<HTMLButtonElement>('[data-k]').forEach((b) => b.addEventListener('click', () => pick(Number(b.dataset.k))));
    el.querySelector<HTMLButtonElement>('[data-k]')?.focus();
  }

  function pick(k: number) {
    const r = rounds[i];
    const total = r.options.reduce((acc, o) => acc + o.p, 0);
    const choice = r.options[k].token;
    const youRight = choice === r.answer;
    const machineRight = r.machine === r.answer;
    if (youRight) you++;
    if (machineRight) machine++;
    score();
    api.sound(youRight ? 'ok' : 'bad');
    el.querySelectorAll<HTMLButtonElement>('[data-k]').forEach((b) => {
      const o = r.options[Number(b.dataset.k)];
      b.disabled = true;
      b.style.cursor = 'default';
      if (o.token === r.answer) b.style.borderColor = 'var(--g-cold)';
      if (o.token === choice && !youRight) b.style.borderColor = 'var(--g-warm)';
      const p = o.p / total;
      b.innerHTML = `${o.token}<br><small style="font-family:var(--g-mono);color:var(--g-dim)">${pct(p)}${o.token === r.machine ? ' · maskinen' : ''}</small>`;
    });
    const machineP = r.options.find((o) => o.token === r.machine)!.p / total;
    const after = el.querySelector('.after')!;
    const last = i + 1 >= ROUNDS;
    after.innerHTML = `
      <p style="margin:0 0 .8rem;line-height:1.5">
        ${youRight ? 'Rätt!' : `Det stod <b>${r.answer}</b>.`}
        Maskinen valde <b>${r.machine}</b> (${pct(machineP)} av sannolikheten bland alternativen)${machineRight ? ' och hade rätt.' : ' och hade fel.'}
      </p>
      <button type="button" class="nsg-primary">${last ? 'Se resultatet' : 'Nästa runda'}</button>`;
    const next = after.querySelector('button')!;
    next.focus();
    next.addEventListener('click', () => {
      i++;
      if (i < ROUNDS) return show();
      const stars = starsFor(you, machine);
      const verdict = you > machine ? 'Du slog maskinen!' : you === machine ? 'Oavgjort.' : 'Maskinen vann.';
      api.finish({
        score: you,
        stars,
        message: `${verdict} Du ${you}, maskinen ${machine}. Maskinen väljer alltid det ord som oftast följde i texten den läst. Du kan använda vad meningen betyder.`,
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
