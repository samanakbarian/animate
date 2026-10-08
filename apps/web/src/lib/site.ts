export const SITE = {
  name: 'iLearnAI',
  domain: 'ilearnai.se',
  url: 'https://ilearnai.se',
  /** Grundaren – visas på om-sidan och i strukturerad data, llms.txt och humans.txt. */
  founder: { name: 'Saman Akbarian', role: 'Grundare', email: 'saman.akbarian@gmail.com' },
  foundingYear: '2026',
  description: 'Så fungerar AI, förklarat med korta filmer som du kan pausa och prova själv.',
  nav: [
    { href: '/', label: 'Filmen' },
    { href: '/moduler', label: 'Moduler' },
    { href: '/spel', label: 'Spel' },
    { href: '/ordlista', label: 'Ordlista' },
    { href: '/om', label: 'Om' },
  ],
} as const;

export const STATUS_LABEL = { planerad: 'Kommer senare', 'under-arbete': 'Under arbete', publicerad: 'Klar' } as const;
export const STAGE_LABEL = { mvp: 'Grunderna', v2: 'Fördjupning', senare: 'På gång' } as const;

/** En egen färg per modul (efter ordning), så att korten inte ser likadana ut. Fungerar i alla teman. */
export const MODULE_COLORS = [
  '#e07a52',
  '#4f8fbf',
  '#6fa35a',
  '#c99a2e',
  '#9a6bc0',
  '#d0607a',
  '#3c9d97',
  '#b87a4b',
  '#6a7fd6',
  '#8c9a3c',
] as const;
export const moduleColor = (order: number) => MODULE_COLORS[(order - 1 + MODULE_COLORS.length) % MODULE_COLORS.length];

/**
 * Kanonisk sökväg utan filändelse. Bygget skriver filer (`build.format: 'file'`), så
 * `Astro.url.pathname` blir t.ex. `/moduler/agenten.html` eller `/index.html`.
 * Netlify serverar samma sidor utan `.html`, och det är de adresserna som ska synas utåt.
 */
export function canonicalPath(pathname: string): string {
  const p = pathname
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
  return p || '/';
}
