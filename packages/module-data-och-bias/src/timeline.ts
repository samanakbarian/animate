// Manus för modul 12 – Data och bias. Del 1: varg eller hund (genvägen i datan).
// Del 2: taligenkänning och dialekter (snittet döljer vem det fungerar sämre för).

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';

const pct = (v: number) => `${Math.round(v * 100)} %`;
const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION_1 = 76;

export const PARAMS_1: ParamSpec[] = [
  { id: 'snowy', label: 'Vargar som står i snö', min: 0.5, max: 1, step: 0.05, default: 0.5, format: pct },
  {
    id: 'test',
    label: 'Visa',
    min: 0,
    max: 1,
    step: 1,
    default: 0,
    format: (v) => (v >= 0.5 ? 'svåra testbilder' : 'träningsbilder'),
  },
];

export const CHAPTERS_1: Chapter[] = [
  {
    id: 'data',
    start: 0,
    title: 'Varg eller hund?',
    caption: 'Vi tränar en modell att skilja vargar från hundar. Varje bild har en form och mer eller mindre snö i bakgrunden.',
  },
  {
    id: 'genvag',
    start: 12,
    title: 'En genväg i datan',
    caption: 'Men i våra bilder står nästan alla vargar i snö. Snön blir en genväg, för den är lättare att se än formen.',
  },
  {
    id: 'traning',
    start: 26,
    title: 'Ser bra ut',
    caption: 'På träningsbilderna går det utmärkt, nästan allt blir rätt. Modellen verkar fungera.',
  },
  {
    id: 'test',
    start: 38,
    title: 'Hund i snö',
    caption: 'Testa på hundar i snö och vargar på gräs. Nu blir de flesta fel. Modellen lärde sig snö, inte varg.',
  },
  {
    id: 'balans',
    start: 52,
    title: 'Bättre data',
    caption: 'Står vargar och hundar lika ofta i snö försvinner genvägen. Då måste modellen lära sig formen, och testet går bra.',
  },
  {
    id: 'din-tur',
    start: 64,
    title: 'Din tur',
    caption: 'Ändra hur ofta vargarna står i snö och växla mellan träningsbilder och svåra testbilder.',
  },
];

export const EXPLORE_1 = 'Ändra hur ofta vargarna står i snö. Växla till de svåra testbilderna och se om modellen klarar dem.';

export const TRACKS_1: Partial<Record<string, Keyframe[]>> = {
  snowy: [k(0, 0.5), k(12, 0.5), k(16, 0.95), k(52, 0.95), k(56, 0.5), k(76, 0.5)],
  test: [k(0, 0), k(38, 0), k(38.01, 1, 'hold'), k(64, 1), k(64.01, 0, 'hold'), k(76, 0)],
};

export const DURATION_2 = 46;

export const PARAMS_2: ParamSpec[] = [
  { id: 'share', label: 'Skånska i träningen', min: 0.01, max: 0.5, step: 0.01, default: 0.05, format: pct },
];

export const CHAPTERS_2: Chapter[] = [
  {
    id: 'snitt',
    start: 0,
    title: 'Ett bra snitt',
    caption: 'En taligenkänning har tränats på 1 000 timmar tal, nästan bara stockholmska. I snitt blir 96 % av orden rätt.',
  },
  {
    id: 'grupper',
    start: 12,
    title: 'Dela upp',
    caption: 'Delar man upp per dialekt syns skillnaden. Stockholmska förstås nästan alltid, skånska betydligt sämre.',
  },
  {
    id: 'mer',
    start: 24,
    title: 'Mer data',
    caption: 'Med fler inspelningar på skånska krymper skillnaden. Datan avgör vem modellen fungerar bra för.',
  },
  { id: 'din-tur', start: 36, title: 'Din tur', caption: 'Ändra hur stor del av träningen som är skånska.' },
];

export const EXPLORE_2 = 'Ändra hur stor del av träningen som är skånska och se hur snittet döljer skillnaden.';

export const TRACKS_2: Partial<Record<string, Keyframe[]>> = {
  share: [k(0, 0.05), k(24, 0.05), k(30, 0.3), k(46, 0.3)],
};
