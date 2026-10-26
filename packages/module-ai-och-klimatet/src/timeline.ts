// Manus för modul 19 – AI och klimatet. AI kräver el i datacenter, olika saker
// kräver olika mycket, lite gånger många blir mycket, användningen tar över
// träningen, elen avgör utsläppen, och AI kan också hjälpa.

import type { Chapter, Keyframe, ParamSpec } from '@nastasteg/engine/module/types';
import { GRIDS, USES } from './energy';

const k = (t: number, v: number, ease?: Keyframe['ease']): Keyframe => ({ t, v, ease });

export const DURATION = 90;

/** Från när jämförelsen mellan träning och användning syns. I utforskaläget syns den alltid. */
export const TRAIN_FROM = 52;
/** Kapitlet om hur AI kan hjälpa, bara i filmen. */
export const HELP_FROM = 74;
export const HELP_TO = 82;

export const PARAMS: ParamSpec[] = [
  { id: 'use', label: 'Vad du gör', min: 0, max: USES.length - 1, step: 1, default: 0, format: (v) => USES[Math.round(v)].short },
  { id: 'perDay', label: 'Gånger per dag', min: 1, max: 100, step: 1, default: 20, format: (v) => String(Math.round(v)) },
  { id: 'grid', label: 'Elen kommer från', min: 0, max: GRIDS.length - 1, step: 1, default: 0, format: (v) => GRIDS[Math.round(v)].title },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'datacenter',
    start: 0,
    title: 'AI kräver el',
    caption:
      'AI körs i datacenter, stora hallar fulla av datorer. Varje svar räknas fram, och det kräver el. Värmen kyls bort, ofta med vatten.',
  },
  {
    id: 'ett-svar',
    start: 12,
    title: 'Ett svar',
    caption: 'Ett kort textsvar kräver ungefär 0,3 wattimmar. Det är som att ha en LED-lampa tänd i två minuter.',
  },
  {
    id: 'olika',
    start: 22,
    title: 'Olika mycket',
    caption: 'Ett långt svar med resonemang eller en bild kräver ungefär tio gånger mer. En kort film kan kräva tusentals gånger mer.',
  },
  {
    id: 'manga',
    start: 40,
    title: 'Lite gånger många',
    caption: 'Tjugo korta svar om dagen i ett år är som att ladda mobilen 150 gånger. Det är lite jämfört med hushållselen.',
  },
  {
    id: 'traning',
    start: TRAIN_FROM,
    title: 'Träning och användning',
    caption:
      'Att träna GPT-3 krävde ungefär 1 300 megawattimmar, en gång. En miljard korta svar om dagen kräver lika mycket på drygt fyra dagar.',
  },
  {
    id: 'elen',
    start: 64,
    title: 'Elen avgör',
    caption: 'Hur mycket koldioxid det blir beror på elen. Med kolkraft blir utsläppen ungefär tjugo gånger större än med svensk el.',
  },
  {
    id: 'hjalpa',
    start: HELP_FROM,
    title: 'AI kan också hjälpa',
    caption: 'AI används också för väderprognoser, elnät och nya material till batterier. Men den används även för att hitta mer olja.',
  },
  {
    id: 'din-tur',
    start: HELP_TO,
    title: 'Din tur',
    caption: 'Välj vad du gör, hur ofta och var elen kommer från. När blir det mycket?',
  },
];

export const EXPLORE = 'Välj vad du gör, hur ofta och var elen kommer från. När blir det mycket, och vad gör elen för skillnad?';

export const TRACKS: Partial<Record<string, Keyframe[]>> = {
  use: [
    k(0, 0),
    k(24, 0),
    k(24.01, 1, 'hold'),
    k(28, 1),
    k(28.01, 2, 'hold'),
    k(32, 2),
    k(32.01, 3, 'hold'),
    k(40, 3),
    k(40.01, 0, 'hold'),
    k(DURATION, 0),
  ],
  perDay: [k(0, 1), k(42, 1), k(49, 20, 'smooth'), k(DURATION, 20)],
  grid: [
    k(0, 0),
    k(66, 0),
    k(66.01, 1, 'hold'),
    k(69, 1),
    k(69.01, 2, 'hold'),
    k(HELP_TO, 2),
    k(HELP_TO + 0.01, 0, 'hold'),
    k(DURATION, 0),
  ],
};
