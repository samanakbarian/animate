// Spelytan för AI-tidslinjen (DOM): kortet att placera överst, tidslinjen under
// med ”lägg här”-platser mellan korten som redan ligger. Fel placering läggs
// ändå på rätt plats så att tidslinjen alltid stämmer.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { type AiEvent, LEVELS, isRightSlot, rightSlot, shuffled, starsFor } from './events';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const CSS = `
.at{position:absolute;inset:0;overflow:auto;padding:1.2rem clamp(1rem,4cqi,3rem)}
.at-in{max-width:40rem;margin:0 auto;display:grid;gap:1rem}
.at-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.at-card{padding:.8rem 1rem;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid var(--g-line);line-height:1.4}
.at-card.cur{background:rgba(157,182,214,.16);border-color:var(--g-cold);font-size:1.05rem}
.at-line{display:grid;gap:.35rem;position:relative}
.at-row{display:grid;grid-template-columns:4.2rem 1fr;gap:.8rem;align-items:center}
.at-year{font:600 1rem var(--g-mono);color:var(--g-cold);text-align:right}
.at-row.new .at-card{border-color:var(--g-cold)}
.at-row.miss .at-card{border-color:var(--g-warm);border-style:dashed}
.at-row.miss .at-year{color:var(--g-warm)}
.at-why{display:block;margin-top:.3rem;font-size:.88rem;color:var(--g-dim)}
.at .at-slot{all:unset;box-sizing:border-box;cursor:pointer;margin-left:5rem;padding:.35rem .8rem;border-radius:8px;border:1px dashed var(--g-line);font:400 .8rem var(--g-mono);color:var(--g-dim);text-align:center}
.at .at-slot:hover,.at .at-slot:focus-visible{border-color:var(--g-cold);color:var(--g-ink);background:rgba(157,182,214,.1)}
.at-row-btn{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
`;

export function startTimeline(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const deck = shuffled(level, api.rng);
  // första kortet ligger redan på plats
  const placed: AiEvent[] = [deck[0]];
  let next = 1,
    right = 0;
  const total = deck.length - 1;
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'at';
  host.append(style, el);
  const score = () => api.setScore(`${right} rätt av ${next - 1}`);

  const row = (e: AiEvent, cls = '', why = false) =>
    `<div class="at-row ${cls}"><span class="at-year">${e.year}</span><div class="at-card">${esc(e.title)}${
      why ? `<span class="at-why">${esc(e.why)}</span>` : ''
    }</div></div>`;

  function ask() {
    const cur = deck[next];
    score();
    api.setStatus(`Kort ${next} av ${total}. ${L.goal}`);
    const slots = placed.length + 1;
    let line = '';
    for (let i = 0; i < slots; i++) {
      line += `<button type="button" class="at-slot" data-slot="${i}">${
        i === 0 ? 'Lägg här (tidigast)' : i === slots - 1 ? 'Lägg här (senast)' : 'Lägg här'
      }</button>`;
      if (i < placed.length) line += row(placed[i]);
    }
    el.innerHTML = `<div class="at-in">
      <p class="at-lbl">KORT ${next} / ${total} · NÄR HÄNDE DET?</p>
      <div class="at-card cur">${esc(cur.title)}</div>
      <p class="at-lbl">TIDSLINJEN</p>
      <div class="at-line">${line}</div>
    </div>`;
    el.scrollTop = 0;
    el.querySelectorAll<HTMLButtonElement>('.at-slot').forEach((b) =>
      b.addEventListener('click', () => place(cur, Number(b.dataset.slot))),
    );
  }

  function place(cur: AiEvent, slot: number) {
    const years = placed.map((e) => e.year);
    const ok = isRightSlot(years, cur.year, slot);
    if (ok) right++;
    placed.splice(rightSlot(years, cur.year), 0, cur);
    next++;
    score();
    api.sound(ok ? 'ok' : 'bad');
    const last = next >= deck.length;
    el.innerHTML = `<div class="at-in">
      <p style="margin:0;line-height:1.5"><b style="color:${ok ? 'var(--g-cold)' : 'var(--g-warm)'}">${
        ok ? 'Rätt.' : 'Inte riktigt.'
      }</b> Det hände ${cur.year}.</p>
      <div class="at-row-btn"><button type="button" class="nsg-primary">${last ? 'Se resultatet' : 'Nästa kort'}</button></div>
      <p class="at-lbl">TIDSLINJEN</p>
      <div class="at-line">${placed.map((e) => (e === cur ? row(e, ok ? 'new' : 'miss', true) : row(e))).join('')}</div>
    </div>`;
    el.scrollTop = 0;
    const btn = el.querySelector<HTMLButtonElement>('.nsg-primary')!;
    btn.focus();
    btn.addEventListener('click', () => {
      if (!last) return ask();
      api.finish({ score: right, stars: starsFor(right, total), message: `${right} av ${total} rätt. ${L.lesson}` });
    });
  }

  ask();
  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
