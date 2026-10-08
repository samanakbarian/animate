// Quizets logik, utan DOM: ordningen på svarsalternativen och länken tillbaka
// till rätt kapitel i modulen.

export interface QuizOption {
  text: string;
  why: string;
  right: boolean;
}

export interface QuizQuestion {
  kind: 'förståelse' | 'tillämpning' | 'förutsägelse';
  see: string;
  q: string;
  right: string;
  why: string;
  wrong: { text: string; why: string }[];
}

export const KIND_LABEL: Record<QuizQuestion['kind'], string> = {
  förståelse: 'Förstå',
  tillämpning: 'Använd',
  förutsägelse: 'Förutsäg',
};

/** Stabil hash av en text (FNV-1a), så att ordningen blir densamma vid varje bygge. */
export function hashText(s: string): number {
  let h = 0x811c9dc5;
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 0x01000193);
  return h >>> 0;
}

/** Alternativen i en fast men blandad ordning (Fisher–Yates med frågan som frö). */
export function orderedOptions(x: QuizQuestion): QuizOption[] {
  const opts: QuizOption[] = [{ text: x.right, why: x.why, right: true }, ...x.wrong.map((w) => ({ ...w, right: false }))];
  let h = hashText(x.q);
  for (let i = opts.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    const j = h % (i + 1);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

/** ”agenten#hinder” → { part: 'agenten', chapter: 'hinder' }. */
export function parseSee(see: string): { part: string; chapter: string } {
  const [part, chapter] = see.split('#');
  return { part, chapter };
}
