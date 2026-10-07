// Gradientgolf: bollen rullar alltid åt det håll där felet minskar mest
// (−gradienten). Spelaren väljer bara steglängden. Ett slag = tio steg av
// gradientnedstigning. Hålet ligger i landskapets lägsta punkt.

import { DOMAIN, gradient } from '@nastasteg/module-traning/descent';

export const STEPS_PER_SHOT = 10;
export const HOLE = { x: 0, y: 0, r: 0.3 };
export const MAX_SHOTS = 12;

export interface Hole {
  title: string;
  goal: string;
  /** Vad banan lär ut, visas när bollen är i hål. */
  lesson: string;
  start: [number, number];
  par: number;
}

export const HOLES: Hole[] = [
  {
    title: 'Lätt nedför',
    goal: 'Välj steglängd och slå. Riktningen bestämmer lutningen, du väljer bara hur långt.',
    lesson: 'Så tränas ett nätverk: lutningen ger riktningen, och steglängden avgör hur fort det går.',
    start: [2.6, 1.9],
    par: 3,
  },
  {
    title: 'Långt bort',
    goal: 'Längre väg. Korta steg tar många slag, för långa studsar över dalen.',
    lesson: 'För korta steg tar evigheter och för långa studsar förbi. Steglängden är det man justerar mest vid träning.',
    start: [3.1, -1.8],
    par: 4,
  },
  {
    title: 'Gropen lurar',
    goal: 'Det finns en grop på vägen. Pröva att byta steglängd mellan slagen.',
    lesson: 'Med samma steglängd hela vägen fastnar bollen i gropen. Därför ändrar man ofta steglängden under träningen.',
    start: [-3.0, 1.7],
    par: 5,
  },
  {
    title: 'Ur gropen',
    goal: 'Bollen ligger i en grop. Korta steg tar dig ingenstans.',
    lesson: 'Ett långt steg tog bollen ur gropen. Större steg, och lite slump, hjälper träningen att inte fastna.',
    start: [-2.08, -0.5],
    par: 3,
  },
];

export type ShotOutcome = 'rolling' | 'in' | 'out';

export interface Shot {
  path: [number, number][];
  outcome: ShotOutcome;
}

const inside = (x: number, y: number) => x >= DOMAIN.x0 && x <= DOMAIN.x1 && y >= DOMAIN.y0 && y <= DOMAIN.y1;

/** Ett slag från (x, y) med steglängden lr. */
export function shoot(x: number, y: number, lr: number): Shot {
  const path: [number, number][] = [[x, y]];
  for (let i = 0; i < STEPS_PER_SHOT; i++) {
    const [gx, gy] = gradient(x, y);
    x -= lr * gx;
    y -= lr * gy;
    path.push([x, y]);
    if (!inside(x, y)) return { path, outcome: 'out' };
    if (Math.hypot(x - HOLE.x, y - HOLE.y) < HOLE.r) return { path, outcome: 'in' };
  }
  return { path, outcome: 'rolling' };
}

/** Stjärnor efter antal slag mot par. */
export const starsFor = (shots: number, par: number): 1 | 2 | 3 => (shots <= par ? 3 : shots <= par + 2 ? 2 : 1);
