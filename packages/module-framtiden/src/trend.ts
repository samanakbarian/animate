// Hur långa uppgifter AI-agenter klarar, mätt som hur lång tid uppgiften tar för
// en människa (med 50 % chans att agenten lyckas). Mätningarna är avrundade från
// METR, ”Measuring AI Ability to Complete Long Tasks” (2025) och senare
// uppdateringar. Uppgifterna är mest programmering. Framåt räknar vi med en vald
// fördubblingstid, och det är en gissning, inte en mätning.

/** Mätpunkter: år (med decimaler) och sekunder. */
export const POINTS: { year: number; s: number; label: string }[] = [
  { year: 2019.1, s: 2, label: '2 s' },
  { year: 2020.5, s: 9, label: '9 s' },
  { year: 2022.2, s: 36, label: '36 s' },
  { year: 2023.2, s: 5 * 60, label: '5 min' },
  { year: 2024.8, s: 30 * 60, label: '30 min' },
  { year: 2025.6, s: 2 * 3600, label: '2 h' },
];

export const LAST = POINTS[POINTS.length - 1];

export interface Pace {
  short: string;
  /** Månader per fördubbling, eller 0 om trenden stannar. */
  months: number;
}

export const PACES: Pace[] = [
  { short: 'var 4:e månad', months: 4 },
  { short: 'var 7:e månad', months: 7 },
  { short: 'var 14:e månad', months: 14 },
  { short: 'trenden stannar', months: 0 },
];

/** Den fördubblingstid mätpunkterna själva ger, i månader. */
export function measuredMonths(): number {
  const a = POINTS[0];
  const doublings = Math.log2(LAST.s / a.s);
  return ((LAST.year - a.year) * 12) / doublings;
}

/** Uppgiftens längd i sekunder år `year` med takten `pace`. Före sista mätningen: mätningarna. */
export function horizon(year: number, pace: Pace): number {
  if (year <= LAST.year || pace.months === 0) return LAST.s;
  return LAST.s * Math.pow(2, ((year - LAST.year) * 12) / pace.months);
}

/** Arbetstid: 8 timmar per dag, 40 per vecka, 167 per månad, 2 000 per år. */
const UNITS: [number, string, string][] = [
  [2000 * 3600, 'arbetsår', 'arbetsår'],
  [167 * 3600, 'arbetsmånad', 'arbetsmånader'],
  [40 * 3600, 'arbetsvecka', 'arbetsveckor'],
  [8 * 3600, 'arbetsdag', 'arbetsdagar'],
  [3600, 'timme', 'timmar'],
  [60, 'minut', 'minuter'],
  [1, 'sekund', 'sekunder'],
];

/** Sekunder som läsbar arbetstid, t.ex. ”ungefär 2 arbetsmånader”. */
export function workTime(s: number): string {
  if (s > 100 * 2000 * 3600) return 'mer än 100 arbetsår';
  const [size, one, many] = UNITS.find(([u]) => s >= u * 0.95) ?? UNITS[UNITS.length - 1];
  const v = s / size;
  const n = v >= 10 ? Math.round(v) : Math.round(v * 2) / 2;
  const num = String(n)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${num} ${n === 1 ? one : many}`;
}

/** Axelns märken: sekunder och etikett. */
export const TICKS: [number, string][] = [
  [1, '1 s'],
  [60, '1 min'],
  [3600, '1 h'],
  [8 * 3600, '1 dag'],
  [40 * 3600, '1 vecka'],
  [167 * 3600, '1 månad'],
  [2000 * 3600, '1 år'],
];
