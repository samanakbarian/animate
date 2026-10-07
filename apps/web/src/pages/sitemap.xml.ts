// Sitemap för sökmotorer: alla sidor på sajten, genererad vid bygget.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const GET: APIRoute = async () => {
  const modules = (await getCollection('modules')).sort((a, b) => a.data.order - b.data.order);
  const games = (await getCollection('games')).sort((a, b) => a.data.order - b.data.order);
  const paths = [
    '/',
    '/moduler',
    ...modules.map((m) => `/moduler/${m.id}`),
    '/spel',
    ...games.map((g) => `/spel/${g.id}`),
    '/ordlista',
    '/om',
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE.url}${p === '/' ? '/' : p}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
