// HUD i HTML/CSS: årtal, rubrik och underrad nere till vänster, kapitelräknare
// uppe till höger, pratbubblor ovanför huvudet och titelkortet på slutet.
// Allt härleds från t (skrivmaskin + flimmer är deterministiska).

import { CHAPTERS, bubbleAt, stepAt, stepIndexAt, subText, yearText } from '../timeline';
import { hash2, smoothstep } from '../core/math';

const GLYPHS = '█▓▒░<>/\\|#%&@$*+=-_01';

/** Skriver fram text tecken för tecken med ett flimrande "huvud". */
function typed(text: string, since: number, t: number, cps = 38): string {
  const dt = t - since;
  if (dt <= 0) return '';
  const n = Math.floor(dt * cps);
  if (n >= text.length + 3) return text;
  const chars = [...text];
  let out = chars.slice(0, Math.min(n, chars.length)).join('');
  // 1–2 flimrande tecken efter markören
  const q = Math.floor(t * 30);
  for (let i = 0; i < 2 && n + i < chars.length; i++) {
    if (chars[n + i] === ' ') {
      out += ' ';
      continue;
    }
    out += GLYPHS[Math.floor(hash2(q, n + i) * GLYPHS.length)];
  }
  return out;
}

/** Kort flimmer på opaciteten när ett element dyker upp. */
function flick(since: number, t: number, len = 0.28): number {
  const dt = t - since;
  if (dt < 0) return 0;
  if (dt > len) return 1;
  return hash2(Math.floor(t * 40), Math.floor(since * 10)) > 0.45 ? 1 : 0.15;
}

export interface BubbleAnchor {
  /** Huvudets position i scenens pixelkoordinater (inom bildytan), eller null. */
  x: number;
  y: number;
  visible: boolean;
}

export class Hud {
  readonly root: HTMLDivElement;
  private year: HTMLDivElement;
  private title: HTMLDivElement;
  private sub: HTMLDivElement;
  private chapter: HTMLDivElement;
  private bubble: HTMLDivElement;
  private bubbleText: HTMLSpanElement;
  private card: HTMLDivElement;
  private cardTitle: HTMLDivElement;
  private cardSub: HTMLDivElement;
  private bl: HTMLDivElement;
  private cache = new Map<HTMLElement, string>();

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.root.innerHTML = `
      <div class="hud-bl">
        <div class="hud-year"></div>
        <div class="hud-title"></div>
        <div class="hud-sub"></div>
      </div>
      <div class="hud-tr"><span class="hud-chapter"></span></div>
      <div class="bubble"><span class="bubble-text"></span></div>
      <div class="titlecard"><div class="tc-title"></div><div class="tc-sub"></div></div>
    `;
    parent.appendChild(this.root);
    const q = <T extends HTMLElement>(s: string) => this.root.querySelector(s) as T;
    this.bl = q('.hud-bl');
    this.year = q('.hud-year');
    this.title = q('.hud-title');
    this.sub = q('.hud-sub');
    this.chapter = q('.hud-chapter');
    this.bubble = q('.bubble');
    this.bubbleText = q('.bubble-text');
    this.card = q('.titlecard');
    this.cardTitle = q('.tc-title');
    this.cardSub = q('.tc-sub');
  }

  private set(el: HTMLElement, text: string) {
    if (this.cache.get(el) === text) return;
    this.cache.set(el, text);
    el.textContent = text;
  }

  update(t: number, anchor: BubbleAnchor, stageW: number, stageH: number) {
    const s = stepAt(t);
    const idx = stepIndexAt(t);
    const ending = s.id === 'end';
    const since = s.start;

    // Årtal
    const yr = yearText(t);
    this.set(this.year, ending ? '' : yr);
    this.year.style.opacity = String(flick(since, t) * (s.id === 'asi' ? 0.95 : 0.92));

    // Rubrik och underrad skrivs fram
    this.set(this.title, typed(s.title.toUpperCase(), since + 0.15, t, 30));
    const sb = subText(t);
    this.set(this.sub, typed(sb.text, sb.since + (ending ? 0.4 : 0.55), t, 34));
    const hudFade = ending ? 1 - smoothstep(145.6, 146.6, t) : 1;
    this.bl.style.opacity = String(hudFade * (t < 0.3 ? 0 : 1));

    // Kapitelräknare
    if (!ending) {
      const n = String(idx + 1).padStart(2, '0');
      this.set(this.chapter, `${n} / ${String(CHAPTERS).padStart(2, '0')}`);
      this.chapter.style.opacity = String(flick(since, t) * 0.95);
    } else this.chapter.style.opacity = '0';

    // Pratbubbla – hålls alltid inom bild.
    const b = bubbleAt(t);
    if (b && anchor.visible) {
      const txt = typed(b.text, b.since, t, 26);
      this.set(this.bubbleText, txt || ' ');
      const fadeOut = 1 - smoothstep(b.until - 0.2, b.until, t);
      this.bubble.style.opacity = String(flick(b.since, t, 0.2) * fadeOut);
      // Mät mot fulla texten så att bubblan inte hoppar under skrivningen.
      this.bubble.style.display = 'block';
      const full = this.bubble.dataset.full;
      if (full !== b.text) {
        this.bubble.dataset.full = b.text;
        this.bubble.style.minWidth = '';
        this.bubbleText.textContent = b.text;
        this.bubble.style.minWidth = `${this.bubble.offsetWidth}px`;
        this.bubbleText.textContent = txt || ' ';
        this.cache.set(this.bubbleText, txt || ' ');
      }
      const bw = this.bubble.offsetWidth;
      const bh = this.bubble.offsetHeight;
      const m = Math.max(8, stageW * 0.012);
      let x = anchor.x - bw * 0.35;
      let y = anchor.y - bh - Math.max(10, stageH * 0.03);
      x = Math.min(Math.max(x, m), stageW - bw - m);
      y = Math.min(Math.max(y, m + stageH * 0.06), stageH - bh - m);
      this.bubble.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      this.bubble.style.setProperty('--tail', `${Math.min(Math.max(anchor.x - x, 12), bw - 12).toFixed(1)}px`);
      this.bubble.style.display = 'block';
    } else {
      this.bubble.style.display = 'none';
      this.bubble.dataset.full = '';
    }

    // Titelkort på slutet.
    if (t >= 147.5) {
      this.card.style.display = 'flex';
      this.card.style.opacity = String(smoothstep(147.5, 147.9, t));
      this.set(this.cardTitle, typed('NÄSTA STEG', 147.6, t, 16));
      this.set(this.cardSub, typed('Evolutionen väntar inte på någon.', 148.2, t, 36));
    } else this.card.style.display = 'none';

  }
}
