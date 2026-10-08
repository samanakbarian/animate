// Lärvägens framsteg, utan DOM. Sparas lokalt i webbläsaren (inget konto):
// vilka steg som är klara och vilket steg besökaren senast var på.

export interface PathProgress {
  done: string[];
  current: string | null;
}

export const EMPTY: PathProgress = { done: [], current: null };
export const storageKey = (pathId: string) => `ilearnai-path-${pathId}`;

/** Läser framsteg ur en sparad sträng. Okända steg och trasig data ignoreras. */
export function parseProgress(raw: string | null, stepIds: readonly string[]): PathProgress {
  if (!raw) return { ...EMPTY };
  try {
    const v = JSON.parse(raw) as Partial<PathProgress>;
    const done = Array.isArray(v.done) ? v.done.filter((id) => stepIds.includes(id)) : [];
    const current = typeof v.current === 'string' && stepIds.includes(v.current) ? v.current : null;
    return { done: [...new Set(done)], current };
  } catch {
    return { ...EMPTY };
  }
}

export const markDone = (p: PathProgress, id: string): PathProgress => ({
  ...p,
  done: p.done.includes(id) ? p.done : [...p.done, id],
});

/** Steget att fortsätta med: det senast öppnade om det inte är klart, annars första ej klara. */
export function resumeStep(p: PathProgress, stepIds: readonly string[]): string {
  if (p.current && !p.done.includes(p.current)) return p.current;
  return stepIds.find((id) => !p.done.includes(id)) ?? stepIds[stepIds.length - 1];
}

export const isComplete = (p: PathProgress, stepIds: readonly string[]) => stepIds.every((id) => p.done.includes(id));

/** Minuter kvar, räknat på stegen som inte är klara. */
export const minutesLeft = (p: PathProgress, steps: readonly { id: string; minutes: number }[]) =>
  steps.filter((s) => !p.done.includes(s.id)).reduce((a, s) => a + s.minutes, 0);
