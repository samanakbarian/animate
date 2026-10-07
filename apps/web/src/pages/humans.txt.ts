// humans.txt: vem som står bakom sajten (humanstxt.org).
import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(
    `/* TEAM */
${SITE.founder.role}: ${SITE.founder.name}
Kontakt: ${SITE.founder.email}

/* SAJTEN */
Namn: ${SITE.name}
Webbplats: ${SITE.url}
Grundad: ${SITE.foundingYear}
Språk: svenska
Byggd med: Astro, TypeScript, Three.js, Web Audio
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
