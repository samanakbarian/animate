// Spelytan för Tokenjakten (DOM): ordförrådet som brickor överst, ordet i
// mitten med klickbara springor mellan tecknen, och en knapp för att lämna in.
// Efter svaret visas tokeniserarens uppdelning och de tal modellen faktiskt ser.

import type { GameApi, GameSession } from '@nastasteg/engine/game/types';
import { LEVELS, bestSplit, isToken, judge, pieces, shuffled, starsFor, tokenId } from './tokens';

/** Mellanslag syns som ␣ så att spelaren ser var de hamnar. */
const show = (s: string) => s.replace(/ /g, '␣');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const CSS = `
.tj{position:absolute;inset:0;display:grid;align-content:safe center;gap:1.1rem;padding:1.2rem clamp(1rem,4cqi,3rem);overflow:auto}
.tj-lbl{margin:0;font:400 .72rem/1.4 var(--g-mono);letter-spacing:.14em;color:var(--g-dim)}
.tj-vocab{display:flex;flex-wrap:wrap;gap:.35rem}
.tj-chip{font:500 .9rem/1 var(--g-mono);padding:.35rem .5rem;border-radius:6px;background:rgba(255,255,255,.07);border:1px solid var(--g-line)}
.tj-word{display:flex;flex-wrap:nowrap;justify-content:center;align-items:stretch;font:600 var(--tj-size,2.4rem)/1 var(--g-mono)}
.tj-ch{padding:.5rem .04em}
.tj .a{background:rgba(157,182,214,.22)}
.tj .b{background:rgba(200,100,63,.22)}
.tj-ch.bad{text-decoration:underline wavy var(--g-warm);text-underline-offset:.25em}
.tj-ch.first{border-top-left-radius:8px;border-bottom-left-radius:8px}
.tj-ch.last{border-top-right-radius:8px;border-bottom-right-radius:8px}
.tj .tj-gap{all:unset;box-sizing:border-box;cursor:pointer;width:.32em;display:grid;place-items:center}
.tj .tj-gap::after{content:'';width:2px;height:55%;border-radius:2px;background:transparent}
.tj .tj-gap:hover::after,.tj .tj-gap:focus-visible::after{background:var(--g-dim)}
.tj .tj-gap.a{background:rgba(157,182,214,.22)}
.tj .tj-gap.b{background:rgba(200,100,63,.22)}
.tj .tj-gap.cut{width:.5em;background:none}
.tj .tj-gap.cut::after{background:var(--g-ink);height:90%}
.tj .tj-gap:disabled{cursor:default}
.tj .tj-gap:disabled::after{background:transparent}
.tj .tj-gap.cut:disabled::after{background:var(--g-ink)}
.tj-row{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
.tj-count{flex:1 1 10rem;font:400 .95rem var(--g-mono)}
.tj-ids{font:400 .95rem/1.6 var(--g-mono);color:var(--g-cold)}
`;

export function startTokens(host: HTMLElement, level: number, api: GameApi): GameSession {
  const L = LEVELS[level];
  const words = shuffled(level, api.rng);
  let i = 0,
    right = 0;
  const style = document.createElement('style');
  style.textContent = CSS;
  const el = document.createElement('div');
  el.className = 'tj';
  host.append(style, el);
  const score = () => api.setScore(`${right} rätt av ${i}`);

  function round() {
    const word = words[i];
    const cuts = new Array<boolean>(Math.max(0, word.length - 1)).fill(false);
    let done = false;
    score();
    api.setStatus(`Ord ${i + 1} av ${words.length}. ${L.goal}`);
    el.innerHTML = `
      <div style="display:grid;gap:.45rem">
        <p class="tj-lbl">TOKENISERARENS ORDFÖRRÅD (+ ALLA ENSKILDA TECKEN)</p>
        <div class="tj-vocab">${L.vocab.map((v) => `<span class="tj-chip">${esc(show(v))}</span>`).join('')}</div>
      </div>
      <p class="tj-lbl">ORD ${i + 1} / ${words.length} · KLICKA MELLAN TECKNEN FÖR ATT KLIPPA</p>
      <div class="tj-word" role="group" aria-label="Ordet att klippa"></div>
      <div class="tj-row">
        <span class="tj-count"></span>
        <button type="button" data-act="reset">Börja om</button>
        <button type="button" class="nsg-primary" data-act="done">Klar</button>
      </div>
      <div class="after"></div>`;
    const wordEl = el.querySelector<HTMLDivElement>('.tj-word')!;
    const countEl = el.querySelector<HTMLSpanElement>('.tj-count')!;
    const chars = [...word];
    // ordet ska rymmas på en rad: mindre tecken för långa ord
    wordEl.style.setProperty('--tj-size', `min(2.6rem, calc((100cqi - 2.5rem) / ${(chars.length * 0.95).toFixed(2)}))`);

    function paint() {
      const p = pieces(word, cuts);
      wordEl.innerHTML = '';
      let k = 0;
      p.forEach((piece, pi) => {
        const bad = !isToken(piece, L.vocab);
        const pc = [...piece];
        pc.forEach((ch, ci) => {
          const span = document.createElement('span');
          span.className = `tj-ch ${pi % 2 ? 'b' : 'a'}${bad ? ' bad' : ''}${ci === 0 ? ' first' : ''}${ci === pc.length - 1 ? ' last' : ''}`;
          span.textContent = show(ch);
          wordEl.appendChild(span);
          if (k < chars.length - 1) {
            const gap = document.createElement('button');
            gap.type = 'button';
            gap.className = `tj-gap ${cuts[k] ? 'cut' : pi % 2 ? 'b' : 'a'}`;
            gap.disabled = done;
            gap.setAttribute('aria-label', `${cuts[k] ? 'Ta bort klippet' : 'Klipp'} efter ”${show(ch)}”`);
            const at = k;
            gap.addEventListener('click', () => {
              cuts[at] = !cuts[at];
              api.sound('tick');
              paint();
              (wordEl.querySelectorAll<HTMLButtonElement>('.tj-gap')[at] ?? null)?.focus();
            });
            wordEl.appendChild(gap);
          }
          k++;
        });
      });
      const badN = p.filter((x) => !isToken(x, L.vocab)).length;
      countEl.textContent = `${p.length} ${p.length === 1 ? 'bit' : 'bitar'}${badN ? ` · ${badN} finns inte` : ''}`;
    }

    el.querySelector('[data-act=reset]')!.addEventListener('click', () => {
      if (done) return;
      cuts.fill(false);
      paint();
    });
    el.querySelector('[data-act=done]')!.addEventListener('click', () => {
      if (done) return;
      done = true;
      const v = judge(word, cuts, L.vocab);
      const ok = v === 'right';
      if (ok) right++;
      i++;
      score();
      api.sound(ok ? 'ok' : 'bad');
      paint();
      el.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((b) => (b.disabled = true));
      const best = bestSplit(word, L.vocab);
      const head = ok
        ? '<b style="color:var(--g-cold)">Rätt.</b> Färre bitar går inte.'
        : v === 'invalid'
          ? '<b style="color:var(--g-warm)">Inte riktigt.</b> Någon bit finns inte i ordförrådet.'
          : `<b style="color:var(--g-warm)">Det gick, men med för många bitar.</b> Det räcker med ${best.length}.`;
      const last = i >= words.length;
      const after = el.querySelector('.after')!;
      after.innerHTML = `
        <p style="margin:0 0 .4rem;line-height:1.5">${head} Tokeniseraren delar så här:
          <span style="font-family:var(--g-mono)">${best.map((b) => esc(show(b))).join(' | ')}</span></p>
        <p style="margin:0 0 .8rem;line-height:1.5">Modellen ser bara talen: <span class="tj-ids">${best.map(tokenId).join(' · ')}</span></p>
        <button type="button" class="nsg-primary">${last ? 'Se resultatet' : 'Nästa ord'}</button>`;
      const next = after.querySelector('button')!;
      next.focus();
      next.addEventListener('click', () => {
        if (!last) return round();
        api.finish({
          score: right,
          stars: starsFor(right, words.length),
          message: `${right} av ${words.length} rätt. ${L.lesson}`,
        });
      });
    });
    paint();
  }

  round();
  return {
    dispose() {
      el.remove();
      style.remove();
    },
  };
}
