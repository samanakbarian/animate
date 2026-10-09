// Dagens AI-fråga: en fråga per dag ur modulernas quiz, samma för alla den dagen.
// Datumet styr bara vilken fråga som visas (sajten, inte en film eller modul, så
// determinismregeln gäller inte här). Svitlängden sparas lokalt.

import { hashText } from './quiz';

/** Dagar sedan 1 januari 2026, räknat på besökarens kalenderdag. */
export function dayNumber(d: Date): number {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86_400_000);
}

/** Frågornas ordning blandas en gång (efter en hash av frågan), sedan går dagarna igenom den. */
export function questionForDay(day: number, keys: string[]): number {
  const order = keys.map((k, i) => ({ i, h: hashText(k) })).sort((a, b) => a.h - b.h || a.i - b.i);
  const n = order.length;
  return order[((day % n) + n) % n].i;
}

export interface Streak {
  last: number;
  count: number;
}

/** Svit av dagar i rad med svar. Samma dag igen ändrar inget; en missad dag börjar om. */
export function updateStreak(prev: Streak | null, today: number): Streak {
  if (!prev) return { last: today, count: 1 };
  if (prev.last === today) return prev;
  return { last: today, count: prev.last === today - 1 ? prev.count + 1 : 1 };
}

export const STREAK_KEY = 'ilearnai-daily';

export function parseStreak(raw: string | null): Streak | null {
  try {
    const v = JSON.parse(raw ?? 'null') as Streak | null;
    return v && Number.isInteger(v.last) && Number.isInteger(v.count) ? v : null;
  } catch {
    return null;
  }
}
