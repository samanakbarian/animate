// Datadriven tidslinje för hela filmen. Allt annat (figur, miljö, HUD, ljud)
// läser härifrån – ändra en tid här så följer resten med.

import { Integral, clamp, hash2, smoothstep, lerp } from './core/math';

export const BPM = 96;
export const BEAT = 60 / BPM; // 0,625 s
export const BAR = BEAT * 4; // 2,5 s
export const DURATION = 150;
/** Längd på dissolve-övergången mellan steg (centrerad på taktgränsen). */
export const TRANSITION = 0.6;

export type StepId =
  | 'human'
  | 'transformer'
  | 'gpt1'
  | 'gpt2'
  | 'gpt3'
  | 'chatgpt'
  | 'gpt4'
  | 'claude'
  | 'claude3'
  | 'reasoning'
  | 'claude4'
  | 'today'
  | 'agi'
  | 'asi'
  | 'end';

export type Era = 'wild' | 'wires' | 'servers' | 'white' | 'void';

export interface Step {
  id: StepId;
  start: number;
  end: number;
  /** Visat årtal (null = dynamiskt, se yearText). */
  year: string | null;
  title: string;
  sub: string;
  bubbles: string[];
  era: Era;
  /** Gånghastighet i m/s. */
  speed: number;
  /** Värme i färggraderingen (0 = kallt, 1 = varmt). */
  warmth: number;
}

export const STEPS: Step[] = [
  { id: 'human', start: 0, end: 10, year: null, title: 'Homo sapiens', sub: '86 miljarder neuroner. 20 watt.', bubbles: [], era: 'wild', speed: 1.05, warmth: 1 },
  { id: 'transformer', start: 10, end: 15, year: '2017', title: 'Transformern', sub: 'Uppmärksamhet blir en arkitektur.', bubbles: [], era: 'wires', speed: 1.15, warmth: 0 },
  { id: 'gpt1', start: 15, end: 22.5, year: '2018', title: 'GPT-1', sub: '117 miljoner parametrar.', bubbles: ['the the the the'], era: 'wires', speed: 0.8, warmth: 0 },
  { id: 'gpt2', start: 22.5, end: 30, year: '2019', title: 'GPT-2', sub: '1,5 miljarder parametrar. Hölls först tillbaka.', bubbles: ['…enhörningar i Anderna…'], era: 'wires', speed: 1.0, warmth: 0 },
  { id: 'gpt3', start: 30, end: 37.5, year: '2020', title: 'GPT-3', sub: '175 miljarder parametrar.', bubbles: ['Jag vill inte skada er.'], era: 'wires', speed: 1.15, warmth: 0 },
  { id: 'chatgpt', start: 37.5, end: 45, year: '2022', title: 'ChatGPT', sub: '100 miljoner användare på två månader.', bubbles: ['Hur kan jag hjälpa dig?', 'Bra fråga!'], era: 'servers', speed: 1.1, warmth: 0.15 },
  { id: 'gpt4', start: 45, end: 52.5, year: '2023', title: 'GPT-4', sub: 'Antal parametrar: hemligt.', bubbles: ['Klarade advokatexamen.'], era: 'servers', speed: 1.3, warmth: 0 },
  { id: 'claude', start: 52.5, end: 60, year: '2023', title: 'Claude', sub: 'Anthropic. Samma dag som GPT-4.', bubbles: ['Hjälpsam, ärlig, ofarlig.', 'Jag är inte säker, men…'], era: 'servers', speed: 1.15, warmth: 0.85 },
  { id: 'claude3', start: 60, end: 67.5, year: '2024', title: 'Claude 3', sub: 'Opus, Sonnet och Haiku.', bubbles: [], era: 'servers', speed: 1.15, warmth: 0.85 },
  { id: 'reasoning', start: 67.5, end: 75, year: '2024', title: 'Resonerande modeller', sub: 'Tänker innan den svarar.', bubbles: ['tänker.', 'tänker..', 'tänker...'], era: 'servers', speed: 0.95, warmth: 0.2 },
  { id: 'claude4', start: 75, end: 82.5, year: '2025', title: 'Claude 4', sub: 'Skriver koden själv. I timmar.', bubbles: ['> git commit -m "klart"', '> 0 fel, 212 tester gröna'], era: 'servers', speed: 1.2, warmth: 0.75 },
  { id: 'today', start: 82.5, end: 90, year: '2026', title: 'Idag', sub: 'Agenter som arbetar dygnet runt. Utan oss.', bubbles: ['agent 4/12: klar', 'människa i loopen: nej'], era: 'servers', speed: 1.25, warmth: 0 },
  { id: 'agi', start: 90, end: 105, year: '20??', title: 'AGI · Artificiell generell intelligens', sub: 'Lika bra som vi. På allt.', bubbles: [], era: 'white', speed: 1.3, warmth: 0 },
  { id: 'asi', start: 105, end: 130, year: null, title: 'ASI · Artificiell superintelligens', sub: 'Bättre än oss. På allt.', bubbles: [], era: 'void', speed: 0, warmth: 0 },
  { id: 'end', start: 130, end: 150, year: null, title: 'Homo sapiens', sub: 'Fortfarande här.', bubbles: [], era: 'void', speed: 0, warmth: 0.3 },
];

/** Antal kapitel i räknaren uppe till höger (slutet räknas inte). */
export const CHAPTERS = STEPS.filter((s) => s.id !== 'end').length;

export function stepIndexAt(t: number): number {
  for (let i = STEPS.length - 1; i >= 0; i--) if (t >= STEPS[i].start) return i;
  return 0;
}
export const stepAt = (t: number) => STEPS[stepIndexAt(t)];
export const stepById = (id: StepId) => STEPS.find((s) => s.id === id)!;

/** Alla stegbyten (tider där ett nytt steg börjar), exklusive t=0. */
export const BOUNDARIES = STEPS.slice(1).map((s) => s.start);

/**
 * Övergångsläge vid tid t: vilka två steg som syns och hur långt svepet kommit.
 * k = 0 → bara `from` syns, k = 1 → bara `to` syns.
 */
export function transitionAt(t: number): { from: number; to: number; k: number } {
  const i = stepIndexAt(t + TRANSITION / 2);
  const s = STEPS[i];
  if (i > 0 && t >= s.start - TRANSITION / 2 && t < s.start + TRANSITION / 2) {
    return { from: i - 1, to: i, k: (t - (s.start - TRANSITION / 2)) / TRANSITION };
  }
  const j = stepIndexAt(t);
  return { from: j, to: j, k: 1 };
}

// ---------------------------------------------------------------------------
// Årtal

const fmtThousands = (n: number) => {
  const neg = n < 0;
  const a = Math.abs(Math.round(n));
  // tusentalsavgränsare bara för stora tal (−300 000), inte för årtal som 2017
  const s = a >= 10000 ? a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') : a.toString();
  return (neg ? '−' : '') + s;
};

export function yearText(t: number): string {
  const s = stepAt(t);
  if (s.id === 'human') {
    // Från −300 000 till 2017, snabbare mot slutet.
    const k = clamp(t / 9.6);
    const e = Math.pow(k, 5.5);
    const y = lerp(-300000, 2017, e);
    return fmtThousands(Math.min(2017, Math.round(y)));
  }
  if (s.id === 'asi') {
    if (t >= 118) return '∞';
    // Slumpade siffror som flimrar (seedat på tidssteg, inte Math.random()).
    const q = Math.floor(t * 18);
    const len = 4 + Math.floor(hash2(q, 3) * Math.min(9, (t - 104) * 1.2));
    let out = '';
    for (let i = 0; i < len; i++) out += Math.floor(hash2(q, 100 + i) * 10).toString();
    return out;
  }
  if (s.id === 'end') return '';
  return s.year ?? '';
}

// ---------------------------------------------------------------------------
// Underrader för slutet

export const END_LINES: { at: number; text: string }[] = [
  { at: 130, text: 'Fortfarande här.' },
  { at: 135, text: 'Inte längre nödvändig.' },
  { at: 143, text: 'Utfasad.' },
];

export function subText(t: number): { text: string; since: number } {
  const s = stepAt(t);
  if (s.id === 'end') {
    let cur = END_LINES[0];
    for (const l of END_LINES) if (t >= l.at) cur = l;
    return { text: cur.text, since: cur.at };
  }
  return { text: s.sub, since: s.start };
}

// ---------------------------------------------------------------------------
// Pratbubblor – byts var tredje sekund (eller tätare om de inte får plats).

export const BUBBLE_INTERVAL = 3;
export const BUBBLE_DELAY = 0.7;

export function bubbleAt(t: number): { text: string; since: number; until: number; stepStart: number } | null {
  const s = stepAt(t);
  const n = s.bubbles.length;
  if (!n) return null;
  const avail = s.end - s.start - BUBBLE_DELAY - 0.45;
  const iv = Math.min(BUBBLE_INTERVAL, avail / n);
  const local = t - s.start - BUBBLE_DELAY;
  if (local < 0) return null;
  const i = Math.floor(local / iv);
  if (i >= n) return null;
  const since = s.start + BUBBLE_DELAY + i * iv;
  return { text: s.bubbles[i], since, until: since + iv - 0.15, stepStart: s.start };
}

// ---------------------------------------------------------------------------
// Gång: position längs vägen = ∫ hastighet dt. Hastigheten blandas mjukt kring
// varje stegbyte och bromsar in till stillastående 105–108 s (ASI).

export const ASI_STOP = { start: 105, end: 108 };

export function walkSpeed(t: number): number {
  if (t >= ASI_STOP.start) {
    const agi = stepById('agi').speed;
    return agi * (1 - smoothstep(ASI_STOP.start, ASI_STOP.end, t));
  }
  const i = stepIndexAt(t);
  const s = STEPS[i];
  let v = s.speed;
  if (s.id === 'human') v = lerp(0.75, 1.1, smoothstep(0, 10, t));
  if (i > 0) {
    const prev = STEPS[i - 1];
    const pv = prev.id === 'human' ? 1.1 : prev.speed;
    v = lerp(pv, v, smoothstep(s.start - 0.4, s.start + 0.8, t));
  }
  return v;
}

const walkIntegral = new Integral(walkSpeed, 0, DURATION);
/** Figurens x-position (meter) vid tid t. */
export const walkX = (t: number) => walkIntegral.at(t) - 3;
/** x-positionen där ett steg börjar – används för att placera epokens miljö. */
export const stepX = (id: StepId) => walkX(stepById(id).start);
/** Punkt där figuren stannar under ASI. */
export const ASI_X = walkX(ASI_STOP.end);

/** Epokernas utsträckning längs vägen (i meter). */
export function eraRanges(): Record<Era, [number, number]> {
  return {
    wild: [-80, stepX('transformer')],
    wires: [stepX('transformer'), stepX('chatgpt')],
    servers: [stepX('chatgpt'), stepX('agi')],
    white: [stepX('agi'), ASI_X - 6],
    void: [ASI_X - 6, ASI_X + 400],
  };
}

/** Taktposition (för ljuspulser i takt med musiken). */
export const beatPhase = (t: number) => (t / BEAT) % 1;
export const barIndex = (t: number) => Math.floor(t / BAR);
