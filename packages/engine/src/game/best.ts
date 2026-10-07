// Bästa resultat per spel och bana, sparat i webbläsaren. Lagringen kan saknas
// (privat läge) – då gäller resultatet bara så länge sidan är öppen.

const key = (game: string, level: number) => `ns-game-${game}-${level}`;
const memory = new Map<string, number>();

export function readBest(game: string, level: number): number | null {
  const k = key(game, level);
  try {
    const v = localStorage.getItem(k);
    if (v !== null) return Number(v);
  } catch {
    // ingen lagring
  }
  return memory.get(k) ?? null;
}

/** Sparar om resultatet är bättre. Returnerar true om det blev nytt rekord. */
export function saveBest(game: string, level: number, score: number, lowerIsBetter = false): boolean {
  const prev = readBest(game, level);
  const better = prev === null || (lowerIsBetter ? score < prev : score > prev);
  if (!better) return false;
  const k = key(game, level);
  memory.set(k, score);
  try {
    localStorage.setItem(k, String(score));
  } catch {
    // ingen lagring
  }
  return true;
}
