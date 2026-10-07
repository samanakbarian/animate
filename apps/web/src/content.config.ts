// Innehållssamlingar: förklarmoduler (Markdown), ordlista och spel (JSON).
// Schemat är kontraktet – lägg till en modul genom att skapa en ny .md-fil.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const STAGES = ['mvp', 'v2', 'senare'] as const;
export const STATUSES = ['planerad', 'under-arbete', 'publicerad'] as const;

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

export const collections = { modules, glossary, games };
