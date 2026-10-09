// Innehållssamlingar: förklarmoduler (Markdown), ordlista och spel (JSON).
// Schemat är kontraktet – lägg till en modul genom att skapa en ny .md-fil.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const STAGES = ['mvp', 'v2', 'senare'] as const;
export const STATUSES = ['planerad', 'under-arbete', 'publicerad'] as const;
export const QUIZ_KINDS = ['förståelse', 'tillämpning', 'förutsägelse'] as const;

const modules = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/modules' }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    summary: z.string().max(160),
    /** Vad besökaren ska kunna förklara efteråt. */
    goal: z.string(),
    /** Den interaktiva delen. */
    interactive: z.string(),
    stage: z.enum(STAGES),
    status: z.enum(STATUSES),
    /** Kapitel i filmen som modulen fördjupar (StepId i @nastasteg/film). */
    filmChapter: z.string().optional(),
    /**
     * Quiz i slutet av modulen: två frågor om förståelse, en tillämpning och en där
     * man förutsäger vad simuleringen gör. Varje fel svar förklarar missförståndet.
     * `see` pekar på ett kapitel i modulens film: ”<del-id>#<kapitel-id>”.
     */
    quiz: z
      .array(
        z.object({
          kind: z.enum(QUIZ_KINDS),
          see: z.string().regex(/^[a-z0-9-]+#[a-z0-9-]+$/),
          q: z.string(),
          right: z.string(),
          why: z.string().max(160),
          wrong: z.array(z.object({ text: z.string(), why: z.string().max(160) })).min(2),
        }),
      )
      .optional(),
  }),
});

const glossary = defineCollection({
  loader: file('./src/content/glossary.json'),
  schema: z.object({
    term: z.string(),
    definition: z.string(),
    /** Slug för modulen som förklarar begreppet närmare. */
    module: z.string().optional(),
  }),
});

const games = defineCollection({
  loader: file('./src/content/games.json'),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    summary: z.string().max(160),
    /** Vad spelet lär ut, i en mening. */
    teaches: z.string(),
    /** Slug för modulen som förklarar samma sak. */
    module: z.string(),
  }),
});

const paths = defineCollection({
  loader: file('./src/content/paths.json'),
  schema: z.object({
    title: z.string(),
    minutes: z.number().int(),
    summary: z.string().max(200),
    /** Det besökaren ska kunna förklara efteråt. */
    insights: z.array(z.string()).min(1),
    /** Rubriken när lärvägen är klar. */
    doneTitle: z.string(),
    /** Vart besökaren kan gå sedan. */
    next: z.array(z.object({ href: z.string(), label: z.string(), why: z.string() })),
    steps: z
      .array(
        z.object({
          id: z.string(),
          kind: z.enum(['module', 'game', 'test']),
          /** Modulens slug och vilken del (ModuleDefinition.id) som visas. */
          module: z.string().optional(),
          part: z.string().optional(),
          game: z.string().optional(),
          minutes: z.number().int(),
          title: z.string(),
          why: z.string(),
          takeaway: z.string(),
          /** För test: frågor ur modulernas quiz, ”<modul>:<index>”. */
          questions: z.array(z.string()).optional(),
        }),
      )
      .min(2),
  }),
});

const badges = defineCollection({
  loader: file('./src/content/badges.json'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Se BadgeRule i lib/progress.ts. */
    rule: z.discriminatedUnion('type', [
      z.object({ type: z.literal('quizzes'), count: z.number().int() }),
      z.object({ type: z.literal('perfect'), count: z.number().int() }),
      z.object({ type: z.literal('explored'), count: z.number().int() }),
      z.object({ type: z.literal('games'), count: z.number().int() }),
      z.object({ type: z.literal('path'), path: z.string() }),
      z.object({ type: z.literal('streak'), count: z.number().int() }),
    ]),
  }),
});

export const collections = { modules, glossary, games, paths, badges };
