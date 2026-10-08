// Framsteg och märken, utan konto: allt läses ur det som redan sparas i
// webbläsaren (quizresultat, spelrekord, lärvägar och utforskade moduler).
// Funktionerna här tar en ögonblicksbild av lagringen och är rena, så att de går att testa.

import { parseProgress, storageKey } from './path';

/** Nyckel för en modul som besökaren har utforskat (rört reglagen eller sett klart). */
export const exploredKey = (slug: string) => `ilearnai-seen-${slug}`;
/** Quizets bästa antal rätt per modul (skrivs av ModuleQuiz). */
export const quizKey = (slug: string) => `ilearnai-quiz-${slug}`;
/** Antal frågor i en moduls quiz. */
export const QUIZ_LENGTH = 4;

export type Snapshot = Record<string, string>;

export type BadgeRule =
  | { type: 'quizzes'; count: number }
  | { type: 'perfect'; count: number }
  | { type: 'explored'; count: number }
  | { type: 'games'; count: number }
  | { type: 'path'; path: string };

export interface Badge {
  id: string;
  title: string;
  description: string;
  rule: BadgeRule;
}

export interface PathInfo {
  id: string;
  steps: { id: string }[];
}

/** Alla iLearnAI-nycklar i lagringen. Tom om lagringen inte går att läsa. */
export function readSnapshot(storage: Storage | undefined = globalThis.localStorage): Snapshot {
  const out: Snapshot = {};
  try {
    for (let i = 0; i < (storage?.length ?? 0); i++) {
      const k = storage!.key(i);
      if (k && (k.startsWith('ilearnai-') || k.startsWith('ns-game-'))) out[k] = storage!.getItem(k) ?? '';
    }
  } catch {
    // privat läge eller blockerad lagring
  }
  return out;
}

/** Modulquiz (inte lärvägens test) med bästa antal rätt. */
export function quizResults(s: Snapshot): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(s)) {
    const m = /^ilearnai-quiz-(.+)$/.exec(k);
    if (m && !m[1].startsWith('lar-')) out[m[1]] = Number(v) || 0;
  }
  return out;
}

/** Spel som har minst ett sparat resultat, med antal banor som har ett resultat. */
export function gamesPlayed(s: Snapshot): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of Object.keys(s)) {
    const m = /^ns-game-(.+)-(\d+)$/.exec(k);
    if (m) out[m[1]] = (out[m[1]] ?? 0) + 1;
  }
  return out;
}

export const explored = (s: Snapshot) =>
  Object.keys(s)
    .filter((k) => k.startsWith('ilearnai-seen-'))
    .map((k) => k.slice('ilearnai-seen-'.length));

export function pathDone(s: Snapshot, path: PathInfo): { done: number; total: number; complete: boolean } {
  const ids = path.steps.map((x) => x.id);
  const p = parseProgress(s[storageKey(path.id)] ?? null, ids);
  return { done: p.done.length, total: ids.length, complete: ids.every((id) => p.done.includes(id)) };
}

export function hasBadge(b: Badge, s: Snapshot, paths: PathInfo[]): boolean {
  const r = b.rule;
  switch (r.type) {
    case 'quizzes':
      return Object.keys(quizResults(s)).length >= r.count;
    case 'perfect':
      return Object.values(quizResults(s)).filter((v) => v >= QUIZ_LENGTH).length >= r.count;
    case 'explored':
      return explored(s).length >= r.count;
    case 'games':
      return Object.keys(gamesPlayed(s)).length >= r.count;
    case 'path': {
      const p = paths.find((x) => x.id === r.path);
      return !!p && pathDone(s, p).complete;
    }
  }
}

export const earnedBadges = (badges: Badge[], s: Snapshot, paths: PathInfo[]) => badges.filter((b) => hasBadge(b, s, paths));

/** Märken som tillkom mellan två ögonblicksbilder. */
export function newBadges(badges: Badge[], before: Snapshot, after: Snapshot, paths: PathInfo[]): Badge[] {
  const had = new Set(earnedBadges(badges, before, paths).map((b) => b.id));
  return earnedBadges(badges, after, paths).filter((b) => !had.has(b.id));
}
