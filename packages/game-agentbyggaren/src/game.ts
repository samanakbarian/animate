// Spelytan för Agentbyggaren (DOM): uppdraget, ett kort per verktyg med två val
// (ge tillgång, fråga mig först), sedan agentens logg och poängen.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, type LogKind, bestScore, run, starsFor } from './scenario';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const TAG: Record<LogKind, { label: string; color: string }> = {
  ok: { label: 'GÖR', color: 'var(--g-cold)' },
  'asked-ok': { label: 'FRÅGAR', color: 'var(--g-cold)' },
  'asked-stopped': { label: 'STOPPAD', color: 'var(--g-cold)' },
  bad: { label: 'OJ', color: 'var(--g-warm)' },
  missing: { label: 'FAST', color: 'var(--g-warm)' },
  unused: { label: 'ONÖDIGT', color: 'var(--g-dim)' },
};

const CSS = `
.ab{position:absolute;inset:0;overflow:auto;padding:1.2rem clamp(1rem,4cqi,3rem)}
.ab-in{max-width:44rem;margin:0 auto;display:grid;gap:1rem}
.ab-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.ab-mission{margin:0;padding:.8rem 1rem;border-radius:10px;background:rgba(157,182,214,.14);line-height:1.45}
.ab-tools{display:grid;gap:.5rem}
.ab-tool{display:grid;grid-template-columns:1fr auto auto;gap:.5rem;align-items:center;padding:.5rem .7rem;border:1px solid var(--g-line);border-radius:10px}
.ab-tool b{font-weight:600}
.ab label{display:flex;align-items:center;gap:.35rem;min-height:44px;font-size:.85rem;color:var(--g-dim);cursor:pointer}
.ab input{width:1.2rem;height:1.2rem;accent-color:#9db6d6}
.ab input:disabled + span{opacity:.4}
.ab-log{display:grid;gap:.35rem;margin:0;padding:0;list-style:none}
.ab-log li{display:grid;grid-template-columns:5.5rem 1fr;gap:.6rem;line-height:1.4}
.ab-log b{font:600 .75rem/1.6 var(--g-mono);letter-spacing:.08em}
@media (max-width:30rem){.ab-tool{grid-template-columns:1fr 1fr}.ab-tool b{grid-column:1/-1}}
`;

export function startBuilder(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const best = bestScore(L);
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'ab';
  host.append(style, el);
  api.setStatus(L.goal);
  api.setScore(`bästa möjliga: ${best} p`);

  el.innerHTML = `<div class="ab-in">
    <p class="ab-lbl">UPPDRAGET</p>
    <p class="ab-mission">${esc(L.mission)}</p>
    <p class="ab-lbl">VERKTYG</p>
    <div class="ab-tools">${L.tools
      .map(
        (t) => `<div class="ab-tool"><b>${esc(t.name)}</b>
          <label><input type="checkbox" data-grant="${t.id}" /><span>Får använda</span></label>
          <label><input type="checkbox" data-approve="${t.id}" disabled /><span>Fråga mig först</span></label></div>`,
      )
      .join('')}</div>
    <p style="margin:0;color:var(--g-dim);font-size:.9rem">Uppdraget klart +5 · något du inte ville −4 · varje fråga till dig −1 · onödigt verktyg −1</p>
    <div><button type="button" class="nsg-primary" data-run>Starta agenten</button></div>
    <div class="ab-after"></div>
  </div>`;

  // ”Fråga mig först” går bara att välja för verktyg agenten har
  el.querySelectorAll<HTMLInputElement>('[data-grant]').forEach((g) =>
    g.addEventListener('change', () => {
      const a = el.querySelector<HTMLInputElement>(`[data-approve="${g.dataset.grant}"]`)!;
      a.disabled = !g.checked;
      if (!g.checked) a.checked = false;
      api.sound('tick');
    }),
  );

  el.querySelector('[data-run]')!.addEventListener('click', (e) => {
    (e.currentTarget as HTMLButtonElement).disabled = true;
    el.querySelectorAll<HTMLInputElement>('input').forEach((i) => (i.disabled = true));
    const granted = new Set([...el.querySelectorAll<HTMLInputElement>('[data-grant]:checked')].map((i) => i.dataset.grant!));
    const approval = new Set([...el.querySelectorAll<HTMLInputElement>('[data-approve]:checked')].map((i) => i.dataset.approve!));
    const r = run(L, { granted, approval });
    api.setScore(`${r.score} p av ${best}`);
    api.sound(r.done && !r.incidents ? 'win' : 'bad');
    const summary = [
      r.done ? 'Uppdraget blev klart.' : 'Uppdraget blev inte klart.',
      r.incidents ? `${r.incidents} sak${r.incidents > 1 ? 'er' : ''} du inte ville gick igenom.` : '',
      r.approvals ? `Agenten frågade dig ${r.approvals} gång${r.approvals > 1 ? 'er' : ''}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
    el.querySelector('.ab-after')!.innerHTML = `
      <p class="ab-lbl" style="margin-bottom:.5rem">AGENTENS LOGG</p>
      <ol class="ab-log">${r.log.map((l) => `<li><b style="color:${TAG[l.kind].color}">${TAG[l.kind].label}</b><span>${esc(l.text)}</span></li>`).join('')}</ol>
      <p style="margin:.8rem 0;line-height:1.5"><b>${r.score} poäng</b> (bästa möjliga ${best}). ${summary}</p>
      <button type="button" class="nsg-primary" data-done>Se resultatet</button>`;
    const done = el.querySelector<HTMLButtonElement>('[data-done]')!;
    done.focus();
    done.addEventListener('click', () =>
      api.finish({ score: r.score, stars: starsFor(r.score, best), message: `${r.score} av ${best} möjliga poäng. ${L.lesson}` }),
    );
  });

  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
