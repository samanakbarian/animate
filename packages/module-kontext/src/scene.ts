// Samtalet som rader. Raderna i kontextfönstret står i en ram, de som fallit
// ur är svaga. Till höger (överst på mobil): hur stort fönstret är och hur fullt.

import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { CHAT, MEMORY, QUESTION, contextFor, tokensOf } from './context';
import { ASK_FROM } from './timeline';

type Row =
  | { kind: 'msg'; who: 'du' | 'ai' | 'minne'; text: string; tokens: number; inside: boolean }
  | { kind: 'more'; n: number; inside: boolean }
  | { kind: 'answer'; text: string; ok: boolean };

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  /** Kortar texten med … så att den ryms på `maxW` pixlar. */
  function fit(text: string, maxW: number, size: number) {
    ctx.font = `${size}px ${SANS}`;
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const count = Math.round(params.count),
      win = Math.round(params.window),
      memory = params.memory >= 0.5;
    const asked = mode === 'explore' || t >= ASK_FROM;
    const r = contextFor(count, win, memory, asked);
    S.clear();

    // raderna i ordning: det som fallit ur, minnet, det som ryms, frågan och svaret
    const rows: Row[] = [];
    const firstInside = r.inside.indexOf(true);
    CHAT.slice(0, count).forEach((m, i) => {
      if (memory && i === firstInside) rows.push({ kind: 'msg', who: 'minne', text: MEMORY, tokens: tokensOf(MEMORY), inside: true });
      rows.push({ kind: 'msg', who: m.who, text: m.text, tokens: tokensOf(m.text), inside: r.inside[i] });
    });
    if (memory && firstInside < 0) rows.push({ kind: 'msg', who: 'minne', text: MEMORY, tokens: tokensOf(MEMORY), inside: true });
    if (asked) {
      rows.push({ kind: 'msg', who: 'du', text: QUESTION.text, tokens: tokensOf(QUESTION.text), inside: true });
      rows.push({ kind: 'answer', text: r.answer, ok: r.remembers });
    }

    // för många rader: slå ihop meddelandena efter det första
    const top = T ? H * 0.12 : H * 0.07;
    const bottom = T ? H * 0.7 : H * 0.76;
    const rowH = (T ? 2.9 : 2.5) * s;
    const maxRows = Math.floor((bottom - top) / rowH);
    if (rows.length > maxRows) {
      const k = rows.length - maxRows + 1;
      const cut = rows.splice(1, k);
      rows.splice(1, 0, { kind: 'more', n: cut.length, inside: cut.every((x) => x.kind === 'msg' && x.inside) });
    }

    const x0 = W * (T ? 0.06 : 0.05);
    const x1 = T ? W * 0.94 : W * 0.6;
    const fs = (T ? 1.45 : 1.35) * s;
    let frameTop = -1,
      frameBottom = -1;
    rows.forEach((row, i) => {
      const y = top + (i + 0.5) * rowH;
      if (row.kind === 'more') {
        S.text(`… ${row.n} meddelanden till`, x0 + 5 * s, y, fs, rgba([154, 165, 176], row.inside ? 1 : 0.4), 'left', SANS);
        if (row.inside && frameTop < 0) frameTop = y - rowH / 2;
        return;
      }
      if (row.kind === 'answer') {
        S.text('AI', x0, y, 1.2 * s, C.dim);
        S.text(row.text, x0 + 5 * s, y, fs, row.ok ? rgba(C.cold, 1) : rgba(C.warm, 1), 'left', SANS);
        return;
      }
      const a = row.inside ? 1 : 0.35;
      const tagColor = row.who === 'minne' ? rgba(C.warm, a) : rgba([154, 165, 176], a);
      S.text(row.who === 'minne' ? 'MINNE' : row.who.toUpperCase(), x0, y, 1.2 * s, tagColor);
      const tokW = 6 * s;
      const text = fit(row.who === 'minne' ? row.text.replace('Minne: ', '') : row.text, x1 - x0 - 6 * s - tokW, fs);
      S.text(text, x0 + 5 * s, y, fs, rgba([232, 235, 238], a), 'left', SANS);
      S.text(String(row.tokens), x1 - 0.8 * s, y, 1.2 * s, rgba([154, 165, 176], a), 'right');
      if (row.inside) {
        if (frameTop < 0) frameTop = y - rowH / 2;
        frameBottom = y + rowH / 2;
      }
    });

    // ramen runt det som ryms i fönstret
    if (frameTop >= 0) {
      ctx.strokeStyle = rgba(C.cold, 0.9);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x0 - 1.2 * s, frameTop, x1 - x0 + 2 * s, frameBottom - frameTop);
      ctx.lineWidth = 1;
    }

    // mätaren, med samma ram som symbol så att man ser vad ramen betyder
    const legend = (x: number, y: number) => {
      ctx.strokeStyle = rgba(C.cold, 0.9);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y - 0.6 * s, 2 * s, 1.2 * s);
      ctx.lineWidth = 1;
      return x + 2.8 * s;
    };
    const full = Math.min(1, r.used / win);
    if (T) {
      const y = H * 0.045;
      S.text(`FÖNSTER ${win} TOKENS`, legend(x0, y), y, 1.3 * s, C.dim);
      S.text(`använt ${r.used} · utanför ${r.dropped}`, x1, y, 1.3 * s, C.ink, 'right');
      ctx.fillStyle = C.line;
      ctx.fillRect(x0, y + 1.6 * s, x1 - x0, 1 * s);
      ctx.fillStyle = rgba(C.cold, 0.85);
      ctx.fillRect(x0, y + 1.6 * s, (x1 - x0) * full, 1 * s);
      return;
    }
    const px = W * 0.67,
      pw = W * 0.28;
    let y = H * 0.12;
    S.text('KONTEXTFÖNSTER', legend(px, y), y, 1.3 * s, C.dim);
    S.text(`${win} tokens`, px, y + 3.4 * s, 2.6 * s, C.ink, 'left', SANS);
    y += 7.5 * s;
    ctx.fillStyle = C.line;
    ctx.fillRect(px, y, pw, 1.6 * s);
    ctx.fillStyle = rgba(C.cold, 0.85);
    ctx.fillRect(px, y, pw * full, 1.6 * s);
    y += 4.2 * s;
    S.text(`Använt: ${r.used} tokens`, px, y, 1.45 * s, C.ink, 'left', SANS);
    const out = r.inside.filter((v) => !v).length;
    S.text(
      out ? `Utanför: ${out} meddelanden, ${r.dropped} tokens` : 'Allt ryms i fönstret',
      px,
      y + 2.8 * s,
      1.45 * s,
      out ? rgba(C.warm, 1) : C.dim,
      'left',
      SANS,
    );
    S.text(`Minne: ${memory ? 'på' : 'av'}`, px, y + 5.6 * s, 1.45 * s, C.dim, 'left', SANS);
    S.text('Talen till höger om raderna är tokens.', px, y + 9.4 * s, 1.25 * s, C.dim, 'left', SANS);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
