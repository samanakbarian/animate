// AI-tidslinjen: händelser i AI:s historia som spelaren lägger i rätt ordning.
// Årtalen måste stämma – ändra bara med en källa till hands. Inom en bana får
// två händelser aldrig ha samma år.

import type { Rng } from '@nastasteg/engine/core/math';

export interface AiEvent {
  year: number;
  title: string;
  /** Varför det spelar roll, visas när kortet ligger på plats. */
  why: string;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  events: AiEvent[];
}

export const LEVELS: Level[] = [
  {
    title: 'Milstolpar',
    goal: 'Lägg varje händelse på rätt plats i tidslinjen.',
    lesson: 'Idén om artificiella neuroner är över 80 år gammal. Det tog lång tid innan datorerna var snabba nog.',
    events: [
      {
        year: 1943,
        title: 'McCulloch och Pitts beskriver en neuron med matematik',
        why: 'Den första modellen av en artificiell neuron, långt innan det fanns datorer att köra den på.',
      },
      {
        year: 1956,
        title: 'Ett sommarmöte i Dartmouth gör AI till ett eget forskningsområde',
        why: 'Uttrycket ”artificiell intelligens” blev namnet på ett nytt fält.',
      },
      {
        year: 1966,
        title: 'Chattprogrammet ELIZA låtsas vara terapeut',
        why: 'ELIZA följde enkla regler, men många användare kände ändå att den förstod dem.',
      },
      {
        year: 1997,
        title: 'Schackdatorn Deep Blue besegrar världsmästaren Garri Kasparov',
        why: 'Deep Blue räknade igenom enorma mängder drag. Den lärde sig inte själv som dagens nätverk.',
      },
      {
        year: 2012,
        title: 'Nätverket AlexNet vinner en stor tävling i bildigenkänning',
        why: 'Djupa nätverk på grafikkort slog alla andra metoder. Det startade dagens AI-våg.',
      },
      {
        year: 2016,
        title: 'AlphaGo besegrar Lee Sedol i brädspelet go',
        why: 'Go har för många möjliga drag för att räkna igenom. AlphaGo lärde sig spela, delvis mot sig själv.',
      },
      {
        year: 2022,
        title: 'ChatGPT släpps och får en miljon användare på fem dagar',
        why: 'Första gången väldigt många människor pratade med en stor språkmodell.',
      },
    ],
  },
  {
    title: 'Upp och ner',
    goal: 'Händelserna ligger närmare varandra. AI-forskningen har haft både medgång och motgång.',
    lesson:
      'AI har gått i vågor: stora förhoppningar, besvikelse och minskade anslag, och sedan nya genombrott. Perioderna kallas AI-vintrar.',
    events: [
      {
        year: 1950,
        title: 'Alan Turing föreslår ett test för om en maskin kan tänka',
        why: 'Turingtestet: kan en människa avgöra om hon chattar med en maskin eller en människa?',
      },
      {
        year: 1958,
        title: 'Frank Rosenblatt bygger perceptronen, en neuron som kan lära sig',
        why: 'Perceptronen justerade sina vikter själv utifrån exempel. Samma idé som i modul 1.',
      },
      {
        year: 1969,
        title: 'Boken ”Perceptrons” visar vad en ensam neuron inte klarar',
        why: 'En neuron kan bara dra en rak gräns. Intresset för neurala nätverk sjönk under lång tid.',
      },
      {
        year: 1973,
        title: 'En brittisk rapport sågar AI-forskningen och anslagen dras ner',
        why: 'Lighthill-rapporten bidrog till den första AI-vintern.',
      },
      {
        year: 1986,
        title: 'Backpropagation gör det möjligt att träna nätverk med flera lager',
        why: 'Metoden räknar ut hur varje vikt ska ändras. Den används fortfarande i nästan all träning.',
      },
      {
        year: 1989,
        title: 'Ett neuralt nätverk lär sig läsa handskrivna siffror i postnummer',
        why: 'Yann LeCuns nätverk var ett av de första som gjorde praktisk nytta.',
      },
      {
        year: 2011,
        title: 'IBM:s Watson vinner frågesporten Jeopardy! mot människor',
        why: 'Watson sökte i enorma textmängder efter svar på frågor i vanligt språk.',
      },
    ],
  },
  {
    title: 'Det senaste',
    goal: 'Händelserna ligger bara något år ifrån varandra. Svårast.',
    lesson: 'Utvecklingen har gått mycket snabbt sedan 2012. Mycket av det bygger på transformern från 2017.',
    events: [
      {
        year: 2009,
        title: 'Bildsamlingen ImageNet med miljontals märkta bilder presenteras',
        why: 'Utan stora mängder exempel går det inte att träna stora nätverk.',
      },
      {
        year: 2014,
        title: 'Två nätverk tävlar mot varandra och lär sig skapa bilder (GAN)',
        why: 'Det ena nätverket skapar bilder, det andra försöker avslöja dem. Båda blir bättre.',
      },
      {
        year: 2017,
        title: 'Artikeln ”Attention Is All You Need” beskriver transformern',
        why: 'Transformern är grunden i nästan alla stora språkmodeller i dag.',
      },
      {
        year: 2020,
        title: 'Språkmodellen GPT-3 visar att större modeller klarar mer',
        why: 'GPT-3 kunde lösa nya uppgifter efter bara några exempel i texten.',
      },
      {
        year: 2021,
        title: 'DALL·E skapar bilder från en textbeskrivning',
        why: 'Text och bild kopplades ihop i samma modell.',
      },
      {
        year: 2023,
        title: 'GPT-4 släpps och klarar många prov på mänsklig nivå',
        why: 'Modellen kunde också ta emot bilder, inte bara text.',
      },
      {
        year: 2024,
        title: 'Nobelpriset i fysik går till Hopfield och Hinton för neurala nätverk',
        why: 'Samma år fick forskarna bakom AlphaFold, som förutsäger proteiners form, Nobelpriset i kemi.',
      },
    ],
  },
];

/**
 * Är `slot` rätt plats för `year`? Slot i betyder före det i:te lagda kortet
 * (slot = antal betyder sist). `placed` är sorterad.
 */
export function isRightSlot(placed: readonly number[], year: number, slot: number): boolean {
  return (slot === 0 || placed[slot - 1] < year) && (slot === placed.length || year < placed[slot]);
}

export const rightSlot = (placed: readonly number[], year: number) => placed.filter((y) => y < year).length;

export function shuffled(level: number, rng: Rng): AiEvent[] {
  const ev = [...LEVELS[level].events];
  for (let i = ev.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [ev[i], ev[j]] = [ev[j], ev[i]];
  }
  return ev;
}

export const starsFor = (right: number, total: number): 1 | 2 | 3 => (right === total ? 3 : right >= total - 2 ? 2 : 1);
