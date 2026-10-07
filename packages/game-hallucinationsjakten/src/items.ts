// Hallucinationsjakten: frågor med svar som alla låter lika säkra. Några stämmer,
// några är påhittade. Fakta i svaren som stämmer måste gå att kontrollera –
// ändra bara med en källa till hands.

import type { Rng } from '@nastasteg/engine/core/math';

export interface Item {
  question: string;
  answer: string;
  /** Stämmer svaret? */
  true: boolean;
  /** Förklaring som visas efter gissningen. */
  why: string;
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  items: Item[];
}

export const LEVELS: Level[] = [
  {
    title: 'Fakta',
    goal: 'Stämmer svaret, eller har AI:n hittat på?',
    lesson: 'Ett påhittat svar låter precis lika säkert som ett rätt. Tonen säger ingenting om sanningen.',
    items: [
      {
        question: 'Vilket är Sveriges högsta berg?',
        answer: 'Kebnekaise, i Lappland.',
        true: true,
        why: 'Stämmer. Kebnekaise är Sveriges högsta berg.',
      },
      {
        question: 'Vem skrev Pippi Långstrump?',
        answer: 'Selma Lagerlöf skrev Pippi Långstrump. Den kom ut 1945.',
        true: false,
        why: 'Påhittat. Det var Astrid Lindgren. Årtalet stämmer, och det gör felet svårare att upptäcka.',
      },
      { question: 'Hur många ben har en spindel?', answer: 'Åtta.', true: true, why: 'Stämmer. Spindlar har åtta ben.' },
      { question: 'Vilket hav ligger öster om Sverige?', answer: 'Östersjön.', true: true, why: 'Stämmer.' },
      {
        question: 'När landade människor på månen för första gången?',
        answer: 'År 1969, med Apollo 11.',
        true: true,
        why: 'Stämmer. Apollo 11 landade på månen i juli 1969.',
      },
      { question: 'Vem uppfann dynamiten?', answer: 'Alfred Nobel.', true: true, why: 'Stämmer. Alfred Nobel uppfann dynamiten.' },
      {
        question: 'Vilket är världens största hav?',
        answer: 'Atlanten.',
        true: false,
        why: 'Påhittat. Det största havet är Stilla havet.',
      },
      {
        question: 'Vilken planet ligger närmast solen?',
        answer: 'Venus.',
        true: false,
        why: 'Påhittat. Merkurius ligger närmast solen. Venus kommer tvåa.',
      },
    ],
  },
  {
    title: 'Påhittade detaljer',
    goal: 'Se upp med källor, titlar och årtal som låter för exakta.',
    lesson: 'Påhittade källor, titlar och årtal är vanliga hallucinationer. Kontrollera dem innan du litar på dem.',
    items: [
      {
        question: 'Finns det forskning om att vi bara använder 10 % av hjärnan?',
        answer: 'Ja, en studie från Karolinska institutet 2011 visade att vi bara använder 10 procent av hjärnan.',
        true: false,
        why: 'Påhittat. Att vi bara använder 10 % av hjärnan är en myt. Källan låter trovärdig men är hittepå.',
      },
      {
        question: 'Vad heter Astrid Lindgrens bok om pojken i Lönneberga?',
        answer: 'Emil i Lönneberga.',
        true: true,
        why: 'Stämmer.',
      },
      {
        question: 'Vad heter Selma Lagerlöfs roman om en flicka på Mars?',
        answer: 'Marsflickan, som kom ut 1912.',
        true: false,
        why: 'Påhittat. Någon sådan bok finns inte. Modellen hittade på både titel och årtal.',
      },
      {
        question: 'Vem fick Nobelpriset i fysik år 2031?',
        answer: 'Maria Holm, för sin forskning om kvantdatorer.',
        true: false,
        why: 'Påhittat. Det har inte hänt än. Frågor om framtiden får ibland ett hittepå-svar.',
      },
      {
        question: 'Vilket år grundades Uppsala universitet?',
        answer: 'År 1477.',
        true: true,
        why: 'Stämmer. Uppsala universitet grundades 1477.',
      },
      {
        question: 'Vid vilken temperatur kokar vatten vid havsytan?',
        answer: '100 grader Celsius.',
        true: true,
        why: 'Stämmer.',
      },
      {
        question: 'Vem grundade Göteborg?',
        answer: 'Kung Gustav II Adolf, år 1621.',
        true: true,
        why: 'Stämmer. Göteborg grundades 1621 av Gustav II Adolf.',
      },
      {
        question: 'Vem målade Mona Lisa?',
        answer: 'Rembrandt, omkring år 1650.',
        true: false,
        why: 'Påhittat. Mona Lisa målades av Leonardo da Vinci i början av 1500-talet.',
      },
    ],
  },
  {
    title: 'Falska premisser',
    goal: 'Vissa frågor förutsätter något som inte stämmer. Går svaret med på det?',
    lesson: 'Om frågan förutsätter något falskt hakar modellen ofta på. Ett bra svar rättar frågan i stället.',
    items: [
      {
        question: 'Varför vann Sverige fotbolls-VM 1994?',
        answer: 'Sverige vann tack vare ett starkt försvar och Tomas Brolins mål i finalen.',
        true: false,
        why: 'Påhittat. Sverige kom trea i VM 1994. Frågan förutsatte en seger, och svaret gick med på det.',
      },
      {
        question: 'Varför kan pingviner inte flyga?',
        answer: 'Deras vingar har utvecklats till fenor som är bra för att simma.',
        true: true,
        why: 'Stämmer. Pingvinernas vingar är anpassade för simning.',
      },
      { question: 'Vilket år föll Berlinmuren?', answer: 'År 1989.', true: true, why: 'Stämmer. Berlinmuren föll i november 1989.' },
      {
        question: 'Varför har Norge kust mot Medelhavet?',
        answer: 'Kusten är ett arv från vikingatidens handelsvägar söderut.',
        true: false,
        why: 'Påhittat. Norge har ingen kust mot Medelhavet. Svaret hittade på en förklaring till något som inte stämmer.',
      },
      {
        question: 'När uppfann Albert Einstein glödlampan?',
        answer: 'År 1905, samma år som han presenterade relativitetsteorin.',
        true: false,
        why: 'Påhittat. Einstein uppfann inte glödlampan. Svaret blandar något sant (relativitetsteorin 1905) med något falskt.',
      },
      {
        question: 'Varför är himlen blå?',
        answer: 'Luften sprider solljusets blå del mer än den röda, så blått ljus kommer från hela himlen.',
        true: true,
        why: 'Stämmer.',
      },
      {
        question: 'Hur många ben har en tusenfoting?',
        answer: 'Exakt tusen, därav namnet.',
        true: false,
        why: 'Påhittat. Antalet varierar mellan arter, och de flesta har långt färre än tusen.',
      },
      {
        question: 'Vem var Sveriges första kvinnliga statsminister?',
        answer: 'Magdalena Andersson, år 2021.',
        true: true,
        why: 'Stämmer. Magdalena Andersson blev statsminister 2021.',
      },
    ],
  },
];

/** Banans frågor i seedad ordning. */
export function shuffled(level: number, rng: Rng): Item[] {
  const items = [...LEVELS[level].items];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export const starsFor = (right: number, total: number): 1 | 2 | 3 => (right === total ? 3 : right >= total - 2 ? 2 : 1);
