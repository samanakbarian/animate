export const SITE = {
  name: 'LearnAI',
  domain: 'learnai.se',
  description: 'Så fungerar AI, förklarat med korta filmer som du kan pausa och prova själv.',
  nav: [
    { href: '/', label: 'Filmen' },
    { href: '/moduler', label: 'Moduler' },
    { href: '/ordlista', label: 'Ordlista' },
    { href: '/om', label: 'Om' },
  ],
} as const;

export const STATUS_LABEL = { planerad: 'Kommer senare', 'under-arbete': 'Under arbete', publicerad: 'Klar' } as const;
export const STAGE_LABEL = { mvp: 'Grunderna', v2: 'Fördjupning', senare: 'På gång' } as const;
