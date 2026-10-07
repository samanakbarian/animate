// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://learnai.se',
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: {
    // Filmen och motorn konsumeras som TypeScript-källkod från workspace-paketen.
    ssr: { noExternal: ['@nastasteg/film', '@nastasteg/engine'] },
    // Filmens chunk (~700 kB, ~200 kB gzip) laddas först när sidan är ledig.
    build: { chunkSizeWarningLimit: 1000 },
  },
});
