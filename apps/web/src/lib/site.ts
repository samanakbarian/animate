export const SITE = {
  name: 'Nästa steg',
  domain: 'nastasteg.se',
  description: 'AI förklarat från grunden – från neuroner till agenter, med filmer du kan pausa och styra själv.',
  nav: [
    { href: '/', label: 'Filmen' },
    { href: '/moduler', label: 'Moduler' },
    { href: '/ordlista', label: 'Ordlista' },
    { href: '/om', label: 'Om' },
  ],
} as const;

export const STATUS_LABEL = { planerad: 'Planerad', 'under-arbete': 'Under arbete', publicerad: 'Publicerad' } as const;
export const STAGE_LABEL = { mvp: 'Lansering', v2: 'Version 2', senare: 'Senare' } as const;
