import { describe, expect, it } from 'vitest';
import type { ModuleDefinition } from '@nastasteg/engine/module/types';
import { INTERACTIVE_MODULES } from './interactive';
import { type QuizQuestion, orderedOptions, parseSee } from './quiz';

const files = import.meta.glob<string>('../content/modules/*.md', { query: '?raw', import: 'default', eager: true });
/** Plockar ut `see`-raderna ur frontmattern (räcker för att kontrollera länkarna). */
const seesIn = (md: string) => [...md.matchAll(/^\s+see: ["']([^"']+)["']$/gm)].map((m) => m[1]);

const q: QuizQuestion = {
  kind: 'förståelse',
  see: 'a#b',
  q: 'Vad?',
  right: 'rätt',
  why: 'för att',
  wrong: [
    { text: 'fel 1', why: 'x' },
    { text: 'fel 2', why: 'y' },
  ],
};

describe('quiz', () => {
  it('blandar alternativen i fast ordning och behåller alla', () => {
    const a = orderedOptions(q);
    expect(a).toEqual(orderedOptions(q));
    expect(a.map((o) => o.text).sort()).toEqual(['fel 1', 'fel 2', 'rätt']);
    expect(a.filter((o) => o.right)).toHaveLength(1);
  });

  it('rätt svar hamnar på alla platser någon gång', () => {
    const at = new Set<number>();
    for (let i = 0; i < 30; i++) at.add(orderedOptions({ ...q, q: `fråga ${i}` }).findIndex((o) => o.right));
    expect([...at].sort()).toEqual([0, 1, 2]);
  });

  it('varje modul har fyra frågor och alla länkar pekar på ett kapitel som finns', async () => {
    expect(Object.keys(files).length).toBeGreaterThanOrEqual(10);
    for (const [file, md] of Object.entries(files)) {
      const slug = file.replace(/^.*\/|\.md$/g, '');
      const sees = seesIn(md);
      expect(sees, slug).toHaveLength(4);
      const load = INTERACTIVE_MODULES[slug];
      expect(load, slug).toBeDefined();
      const { parts } = (await load!()) as { parts: ModuleDefinition[] };
      for (const see of sees) {
        const { part, chapter } = parseSee(see);
        const def = parts.find((p) => p.id === part);
        expect(def, `${slug}: ${see}`).toBeDefined();
        expect(
          def!.chapters.some((c) => c.id === chapter),
          `${slug}: ${see}`,
        ).toBe(true);
      }
    }
  });
});
