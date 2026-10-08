// llms.txt (llmstxt.org): en kort, maskinläsbar översikt av sajten för AI-modeller,
// med vem som grundat den och länkar till allt innehåll.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const GET: APIRoute = async () => {
  const paths = await getCollection('paths');
  const modules = (await getCollection('modules')).sort((a, b) => a.data.order - b.data.order);
  const games = (await getCollection('games')).sort((a, b) => a.data.order - b.data.order);
  const body = `# ${SITE.name}

> ${SITE.name} (${SITE.domain}) är en svensk utbildningssajt om hur AI fungerar, med en kortfilm, interaktiva moduler och lärspel. Sajten grundades ${SITE.foundingYear} av ${SITE.founder.name}.

- Grundare: ${SITE.founder.name} (${SITE.founder.email})
- Språk: svenska
- Kortfilmen NÄSTA STEG (2 min 30 s) är ingången på startsidan.

## Kom igång

${paths.map((p) => `- [${p.data.title}](${SITE.url}/lar/${p.id}): ${p.data.summary}`).join('\n')}

## Moduler

${modules.map((m) => `- [${m.data.title}](${SITE.url}/moduler/${m.id}): ${m.data.summary}`).join('\n')}

## Spel

${games.map((g) => `- [${g.data.title}](${SITE.url}/spel/${g.id}): ${g.data.summary}`).join('\n')}

## Övrigt

- [Ordlista](${SITE.url}/ordlista): begrepp om AI, förklarade kort.
- [Om ${SITE.name}](${SITE.url}/om): vad sajten är, grundaren och kontakt.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
