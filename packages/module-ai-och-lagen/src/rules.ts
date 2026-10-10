// EU:s AI-förordning (förordning (EU) 2024/1689) delar in AI efter hur stor
// risken är för människor. Här: fyra nivåer, kraven på varje nivå och åtta
// exempel. Texterna är förenklade; modulsidan säger det.

export type Level = 'forbjuden' | 'hog' | 'begransad' | 'minimal';

export interface Tier {
  id: Level;
  name: string;
  rules: string[];
}

/** Från toppen av pyramiden och nedåt. */
export const TIERS: Tier[] = [
  {
    id: 'forbjuden',
    name: 'Förbjudet',
    rules: ['Får inte användas i EU.'],
  },
  {
    id: 'hog',
    name: 'Hög risk',
    rules: [
      'Risken ska bedömas innan den används.',
      'Träningsdatan ska vara bra och relevant.',
      'Den ska logga vad den gör.',
      'En människa ska ha tillsyn.',
    ],
  },
  {
    id: 'begransad',
    name: 'Krav på öppenhet',
    rules: ['Det ska framgå att det är AI.', 'Bilder och filmer som ser äkta ut ska märkas.'],
  },
  {
    id: 'minimal',
    name: 'Låg risk',
    rules: ['Inga särskilda krav i AI-förordningen.', 'Andra lagar gäller som vanligt.'],
  },
];

export interface Example {
  name: string;
  short: string;
  level: Level;
  /** Något särskilt om just det här exemplet. */
  note?: string;
  /** Handlar det om uppgifter om enskilda människor? Då gäller också GDPR. */
  personal: boolean;
}

export const EXAMPLES: Example[] = [
  { name: 'Skräppostfilter i mejlen', short: 'Skräppostfilter', level: 'minimal', personal: false },
  { name: 'Datorspel med AI-styrda figurer', short: 'AI i spel', level: 'minimal', personal: false },
  { name: 'Chattbot i en kundtjänst', short: 'Chattbot', level: 'begransad', personal: false },
  {
    name: 'AI-gjord film av en riktig person',
    short: 'Deepfake',
    level: 'begransad',
    note: 'Att göra en falsk film av någon kan också bryta mot andra lagar.',
    personal: true,
  },
  { name: 'AI som sorterar jobbansökningar', short: 'Jobbansökningar', level: 'hog', personal: true },
  { name: 'AI som bedömer elevers prov', short: 'Bedöma prov', level: 'hog', personal: true },
  { name: 'AI som avgör om du får ett lån', short: 'Lån', level: 'hog', personal: true },
  { name: 'Poäng på människor som avgör hur de behandlas', short: 'Social poäng', level: 'forbjuden', personal: true },
  {
    name: 'AI som läser av elevers känslor i skolan',
    short: 'Känslor i skolan',
    level: 'forbjuden',
    note: 'Undantag finns av medicinska skäl och för säkerheten.',
    personal: true,
  },
];

export const tierOf = (e: Example) => TIERS.find((t) => t.id === e.level)!;

/** Dina rättigheter enligt dataskyddsförordningen (GDPR), förenklat. */
export const GDPR_RIGHTS = [
  'Få veta vilka uppgifter om dig som används.',
  'Få fel uppgifter rättade.',
  'Få ett viktigt beslut prövat av en människa.',
];
