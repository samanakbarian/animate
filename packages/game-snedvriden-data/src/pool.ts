// Snedvriden data: spelaren väljer träningsbilder ur en hög där vargarna oftast
// står i snö. Modellen (samma som i modulen Data och bias) tränas på valet och
// testas på ett rättvist test där snön inte säger något.

import { type Photo, accuracy, fairTest, snowShare, train } from '@nastasteg/module-data-och-bias/learn';

export interface Card extends Photo {
  label: string;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  /** Hur många bilder spelaren får välja. */
  picks: number;
  /** [vargar i snö, vargar på gräs, hundar på gräs, hundar i snö] */
  counts: [number, number, number, number];
}

export const LEVELS: Level[] = [
  {
    title: 'Sex bilder',
    goal: 'Välj sex träningsbilder så att modellen lär sig skilja varg från hund, inte snö från gräs.',
    lesson: 'Blanda bilderna så att snön inte säger något. Då måste modellen lära sig det du menade.',
    picks: 6,
    counts: [4, 2, 4, 2],
  },
  {
    title: 'Ovanliga bilder',
    goal: 'Nu finns bara en varg på gräs och en hund i snö. Välj fyra bilder.',
    lesson: 'De ovanliga exemplen är de viktigaste. Utan dem hittar modellen en genväg.',
    picks: 4,
    counts: [5, 1, 5, 1],
  },
  {
    title: 'Fler är inte alltid bättre',
    goal: 'Välj upp till tio bilder. Hur många behövs, och vilka?',
    lesson: 'Fler bilder av samma sort gör snedvridningen starkare. Det är sammansättningen som räknas, inte bara mängden.',
    picks: 10,
    counts: [7, 2, 7, 2],
  },
];

const KINDS = [
  { wolf: true, snowy: true, label: 'Varg i snö' },
  { wolf: true, snowy: false, label: 'Varg på gräs' },
  { wolf: false, snowy: false, label: 'Hund på gräs' },
  { wolf: false, snowy: true, label: 'Hund i snö' },
];

/** Högen för en bana. Formen syns svagt (±0,25–0,55), snön tydligt. */
export function pool(level: number): Card[] {
  const out: Card[] = [];
  LEVELS[level].counts.forEach((n, k) => {
    const kind = KINDS[k];
    for (let i = 0; i < n; i++) {
      const strength = 0.25 + ((i * 37) % 31) / 100;
      out.push({
        label: kind.label,
        wolf: kind.wolf,
        shape: kind.wolf ? strength : -strength,
        snow: kind.snowy ? 0.85 + (i % 3) * 0.05 : 0.05 + (i % 3) * 0.05,
      });
    }
  });
  return out;
}

const TEST = fairTest(200);

export function evaluate(cards: Card[]) {
  const m = train(cards, 600, 0.8);
  return { accuracy: accuracy(m, TEST), snow: snowShare(m) };
}

export const starsFor = (acc: number): 1 | 2 | 3 => (acc >= 0.85 ? 3 : acc >= 0.7 ? 2 : 1);
