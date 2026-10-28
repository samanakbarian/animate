// Ett diagram med logaritmisk skala: hur långa uppgifter AI-agenter klarar, år
// för år. Mätpunkterna till och med 2025, sedan en linje framåt med vald takt och
// svaga linjer för de andra takterna. Till höger (under på mobil): valt år i
// arbetstid. Filmens kapitel om ord, syner och säkerhet ritas som egna bilder.

import { PALETTE as C, SANS, createSurface, rgba } from '@nastasteg/engine/module/canvas';
import type { Mode, ModuleScene, Params } from '@nastasteg/engine/module/types';
import { AHEAD_FROM, POINTS_FROM, POINTS_TO, SAFETY_FROM, TURN_FROM, VIEWS_FROM, WORDS_TO, YEAR_MAX } from './timeline';
import { LAST, PACES, POINTS, TICKS, horizon, workTime } from './trend';

const INK: readonly number[] = [232, 235, 238];
const X_FROM = 2019;
const X_TO = YEAR_MAX;
/** Logaritmisk skala från 1 sekund till 10 arbetsår. */
const Y_MAX = Math.log10(10 * 2000 * 3600);

const SAFETY: [string, string][] = [
  ['Få AI att göra det vi menar', 'alignment'],
  ['Se in i modellerna och förstå hur de räknar', 'tolkningsbarhet'],
  ['Testa farliga förmågor innan en modell släpps', 'utvärdering'],
  ['Lagar och avtal, som EU:s AI-förordning', 'styrning'],
];

export function createScene(host: HTMLElement): ModuleScene {
  const S = createSurface(host);
  const { ctx } = S;

  function wrap(text: string, x: number, y: number, maxW: number, size: number, color: string, lh = 1.4) {
    ctx.font = `${size}px ${SANS}`;
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxW && line) {
        S.text(line, x, y, size, color, 'left', SANS);
        y += size * lh;
        line = word;
      } else line = next;
    }
    if (line) S.text(line, x, y, size, color, 'left', SANS);
    return y + size * lh;
  }

  function drawWords(s: number) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const cards: [string, string, string][] = [
      ['AGI', 'Artificiell generell intelligens', 'Minst lika bra som människor på i stort sett allt.'],
      ['ASI', 'Artificiell superintelligens', 'Bättre än alla människor på i stort sett allt.'],
    ];
    const cw = T ? W * 0.88 : W * 0.4;
    cards.forEach(([abbr, name, def], i) => {
      const x = T ? W * 0.06 : W * (0.06 + i * 0.47);
      const y = T ? H * (0.06 + i * 0.3) : H * 0.12;
      S.text(abbr, x, y + 3 * s, 5 * s, i === 0 ? rgba(C.cold, 1) : rgba(C.warm, 1), 'left', SANS);
      S.text(name.toUpperCase(), x, y + 7.5 * s, 1.3 * s, C.dim);
      wrap(def, x, y + 10.5 * s, cw, 1.8 * s, C.ink);
    });
  }

  function drawViews(s: number) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const x0 = W * 0.08,
      x1 = W * 0.92;
    S.text('NÄR KLARAR MASKINER ALLT BÄTTRE ÄN MÄNNISKOR?', x0, H * (T ? 0.06 : 0.1), 1.3 * s, C.dim);
    const ly = H * (T ? 0.2 : 0.3);
    ctx.strokeStyle = rgba(INK, 0.4);
    ctx.lineWidth = Math.max(1, 0.15 * s);
    ctx.beginPath();
    ctx.moveTo(x0, ly);
    ctx.lineTo(x1, ly);
    ctx.stroke();
    // i dag, om några år, 2047, kanske aldrig
    const marks: [number, string, string, readonly number[]][] = [
      [0.0, 'i dag', '', INK],
      [0.14, 'om några år', 'tror en del forskare och chefer på AI-företag', C.cold],
      [0.5, '2047', '50 % chans enligt en enkät med 2\u00a0778 AI-forskare (2023)', C.warm],
      [1, 'kanske aldrig', 'med dagens metoder, tror andra forskare', INK],
    ];
    marks.forEach(([k, label, note, color], i) => {
      const x = x0 + k * (x1 - x0);
      ctx.fillStyle = rgba(color, 1);
      ctx.beginPath();
      ctx.arc(x, ly, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();
      const align: CanvasTextAlign = k < 0.3 ? 'left' : k === 1 ? 'right' : 'center';
      const up = T ? i % 2 === 1 : false;
      S.text(label, x, ly + (up ? -2.4 : 2.6) * s, 1.5 * s, rgba(color, 1), align, SANS);
      if (note) {
        const ny = T ? ly + (6 + i * 5) * s : ly + 5.4 * s;
        if (T) {
          S.text(`${label}: `, x0, ny, 1.25 * s, rgba(color, 1), 'left', SANS);
          wrap(note, x0 + 12 * s, ny, x1 - x0 - 12 * s, 1.25 * s, C.dim);
        } else {
          const w = (x1 - x0) * (align === 'left' ? 0.2 : 0.27);
          const nx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
          wrap(note, nx, ny, w, 1.25 * s, C.dim);
        }
      }
    });
  }

  function drawSafety(s: number) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const x0 = W * 0.08;
    let y = H * (T ? 0.06 : 0.1);
    S.text('VAD FORSKARE ARBETAR MED', x0, y, 1.3 * s, C.dim);
    y += (T ? 3.6 : 4.2) * s;
    for (const [text, term] of SAFETY) {
      ctx.fillStyle = rgba(C.cold, 1);
      ctx.fillRect(x0, y - 0.35 * s, 0.7 * s, 0.7 * s);
      S.text(text, x0 + 2 * s, y, (T ? 1.45 : 1.7) * s, C.ink, 'left', SANS);
      S.text(term, x0 + 2 * s, y + (T ? 2 : 2.3) * s, 1.15 * s, C.dim);
      y += (T ? 5.4 : 5.6) * s;
    }
  }

  function render(t: number, params: Params, mode: Mode) {
    const W = S.width,
      H = S.height,
      T = S.tall;
    const s = T ? W / 54 : Math.min(W, H * 1.78) / 100;
    const film = mode === 'film';
    S.clear();
    if (film && t < WORDS_TO) return drawWords(s);
    if (film && t >= VIEWS_FROM && t < SAFETY_FROM) return drawViews(s);
    if (film && t >= SAFETY_FROM && t < TURN_FROM) return drawSafety(s);

    const pace = PACES[Math.round(params.pace)];
    const year = Math.round(params.year);
    const ahead = !film || t >= AHEAD_FROM;
    const shown =
      film && t < POINTS_TO ? Math.max(1, Math.ceil(((t - POINTS_FROM) / (POINTS_TO - POINTS_FROM)) * POINTS.length)) : POINTS.length;

    // diagrammets yta
    const gx0 = T ? W * 0.17 : W * 0.1;
    const gx1 = T ? W * 0.94 : W * 0.64;
    const gy0 = T ? H * 0.05 : H * 0.07;
    const gy1 = T ? H * 0.41 : H * 0.6;
    const X = (yr: number) => gx0 + ((yr - X_FROM) / (X_TO - X_FROM)) * (gx1 - gx0);
    const Y = (sec: number) => gy1 - (Math.log10(Math.max(1, sec)) / Y_MAX) * (gy1 - gy0);

    ctx.lineWidth = 1;
    for (const [sec, label] of TICKS) {
      const y = Y(sec);
      ctx.strokeStyle = rgba(INK, 0.08);
      ctx.beginPath();
      ctx.moveTo(gx0, y);
      ctx.lineTo(gx1, y);
      ctx.stroke();
      S.text(label, gx0 - 1 * s, y, 1.1 * s, C.dim, 'right');
    }
    for (let yr = X_FROM + 1; yr <= X_TO; yr += T ? 5 : 2) {
      S.text(String(yr), X(yr), gy1 + 1.8 * s, 1.1 * s, C.dim, 'center');
    }
    S.text('hur länge uppgiften tar för en människa', gx0, gy0 - 0.2 * s, 1.1 * s, C.dim, 'left', SANS);

    // linjer framåt: svaga för de andra takterna, stark för den valda
    const clipTop = gy0;
    const drawAhead = (p: (typeof PACES)[number], color: string, width: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const yr = LAST.year + ((X_TO - LAST.year) * i) / 60;
        const y = Math.max(clipTop, Y(horizon(yr, p)));
        if (i === 0) ctx.moveTo(X(yr), y);
        else ctx.lineTo(X(yr), y);
      }
      ctx.stroke();
    };
    if (ahead) {
      ctx.save();
      ctx.setLineDash([0.6 * s, 0.6 * s]);
      for (const p of PACES) if (p !== pace) drawAhead(p, rgba(INK, 0.2), Math.max(1, 0.15 * s));
      ctx.restore();
      drawAhead(pace, rgba(C.warm, 0.95), Math.max(1.5, 0.3 * s));
    }

    // trendlinjen genom mätningarna
    if (!film || t >= 24) {
      const a = POINTS[0];
      ctx.strokeStyle = rgba(C.cold, 0.35);
      ctx.lineWidth = Math.max(1, 0.2 * s);
      ctx.beginPath();
      ctx.moveTo(X(a.year), Y(a.s));
      ctx.lineTo(X(LAST.year), Y(LAST.s));
      ctx.stroke();
    }
    POINTS.slice(0, shown).forEach((p, i) => {
      ctx.fillStyle = rgba(C.cold, 1);
      ctx.beginPath();
      ctx.arc(X(p.year), Y(p.s), 0.6 * s, 0, Math.PI * 2);
      ctx.fill();
      if (!T || i % 2 === 1 || i === POINTS.length - 1)
        S.text(p.label, X(p.year) - 0.9 * s, Y(p.s) - 1.6 * s, 1.1 * s, C.ink, 'right', SANS);
    });

    // valt år
    const value = horizon(year, pace);
    if (ahead) {
      const x = X(year);
      ctx.save();
      ctx.setLineDash([0.4 * s, 0.5 * s]);
      ctx.strokeStyle = rgba(INK, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, gy0);
      ctx.lineTo(x, gy1);
      ctx.stroke();
      ctx.restore();
      if (Y(value) >= clipTop) {
        ctx.fillStyle = rgba(C.warm, 1);
        ctx.beginPath();
        ctx.arc(x, Y(value), 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      } else S.text('↑ utanför skalan', x + 0.8 * s, gy0 + 1.2 * s, 1.1 * s, rgba(C.warm, 1), 'left', SANS);
    }

    // avläsning
    const px = T ? W * 0.06 : W * 0.7;
    const pw = T ? W * 0.88 : W * 0.26;
    let py = T ? H * 0.48 : H * 0.1;
    if (ahead) {
      S.text(`ÅR ${year}`, px, py, 1.4 * s, C.ink);
      py += 2.6 * s;
      S.text(`fördubbling ${pace.short}`, px, py, 1.2 * s, C.dim, 'left', SANS);
      py += (T ? 3.6 : 4.4) * s;
      S.text(workTime(value), px, py, (T ? 2.6 : 2.4) * s, rgba(C.warm, 1), 'left', SANS);
      py += (T ? 3 : 3.4) * s;
      py = wrap('Så långa uppgifter klarar AI-agenter då, om takten håller.', px, py, pw, 1.25 * s, C.dim);
      py += 1 * s;
    } else {
      S.text('MÄTNINGAR', px, py, 1.4 * s, C.ink);
      py += 3 * s;
    }
    wrap('Mätningar från METR till och med 2025. Mest programmeringsuppgifter, med 50 % chans att lyckas.', px, py, pw, 1.1 * s, C.dim);
  }

  return { resize: S.resize, render, dispose: S.dispose };
}
