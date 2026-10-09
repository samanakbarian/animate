// Promptpusslet: varje uppgift har ett mål och bitar att bygga frågan av.
// need = något frågan behöver (+1), fluff = låter bra men gör ingen skillnad (0),
// trap = gör svaret sämre (−1). Förklaringen visas efter att frågan skickats.

import type { Rng } from '@nastasteg/engine/core/math';

export type PieceKind = 'need' | 'fluff' | 'trap';

export interface Piece {
  text: string;
  kind: PieceKind;
  why: string;
}

export interface Task {
  goal: string;
  pieces: Piece[];
}

export interface Level {
  title: string;
  goal: string;
  lesson: string;
  tasks: Task[];
}

const need = (text: string, why: string): Piece => ({ text, kind: 'need', why });
const fluff = (text: string, why: string): Piece => ({ text, kind: 'fluff', why });
const trap = (text: string, why: string): Piece => ({ text, kind: 'trap', why });

export const LEVELS: Level[] = [
  {
    title: 'Säg vad du vill',
    goal: 'Välj bitarna som gör frågan tydlig. Undvik bitar som låter bra men inte hjälper.',
    lesson: 'En bra fråga säger vad du vill ha, villkoren och formatet. Smicker och ”var kreativ” hjälper sällan.',
    tasks: [
      {
        goal: 'Du vill ha tre vegetariska middagsförslag som tar under 30 minuter, som en kort lista.',
        pieces: [
          need('Ge tre middagsförslag.', 'Säger vad du vill ha och hur många.'),
          need('Utan kött.', 'Ett villkor modellen annars inte kan veta.'),
          need('Under 30 minuter.', 'Ännu ett villkor. Utan det kan du få en söndagsstek.'),
          need('Som en kort lista.', 'Formatet. Annars blir det lätt långa stycken.'),
          fluff('Du är världens bästa kock.', 'Låter bra, men säger inget om vad du vill ha.'),
          trap('Svara så utförligt du kan.', 'Ger lång text i stället för en kort lista.'),
        ],
      },
      {
        goal: 'Du vill ha en förklaring av fotosyntesen för en tioåring, högst fem meningar.',
        pieces: [
          need('Förklara fotosyntesen.', 'Säger vad du vill ha.'),
          need('För en tioåring.', 'Vem svaret är till styr ordval och nivå.'),
          need('Högst fem meningar.', 'Formatet och längden.'),
          fluff('Var kreativ!', 'Säger inget om vad som är ett bra svar här.'),
          trap('Använd många facktermer.', 'Passar inte en tioåring, tvärtemot målet.'),
        ],
      },
      {
        goal: 'Du vill ha ett kort och varmt tack-sms till mormor för födelsedagspresenten, en stickad tröja.',
        pieces: [
          need('Skriv ett sms till mormor.', 'Vad och till vem.'),
          need('Tacka för födelsedagspresenten, en stickad tröja.', 'Detaljen gör tacket personligt. Annars blir det allmänt.'),
          need('Kort och varmt.', 'Ton och längd.'),
          fluff('Använd emojis om det passar.', 'Gör ingen större skillnad. Mormor får avgöra.'),
          trap('Skriv som ett formellt brev.', 'Fel ton för ett sms till mormor.'),
        ],
      },
    ],
  },
  {
    title: 'Ge sammanhang',
    goal: 'Nu behövs sammanhanget: det modellen inte kan veta om din situation.',
    lesson: 'Modellen vet bara det som står i frågan. Det du inte berättar fyller den i med gissningar.',
    tasks: [
      {
        goal: 'Du vill svara en granne som klagat på att din hund skäller när du är på jobbet. Vänligt, och med ett förslag.',
        pieces: [
          need('Hjälp mig svara min granne.', 'Vad du vill ha.'),
          need('Grannen klagar på att hunden skäller när jag är på jobbet.', 'Sammanhanget. Utan det får du ett allmänt svar.'),
          need('Jag vill vara vänlig och föreslå att en hundvakt kommer mitt på dagen.', 'Målet med svaret och lösningen du vill föreslå.'),
          fluff('Tänk steg för steg.', 'Kan hjälpa på uträkningar, men gör ingen skillnad här.'),
          trap('Grannen överdriver nog.', 'Får svaret att låta försvarande, tvärtemot det du vill.'),
        ],
      },
      {
        goal: 'Du vill ha ett träningsschema för att springa 5 km om åtta veckor. Du springer 2 km i dag och kan träna tre dagar i veckan.',
        pieces: [
          need('Gör ett träningsschema.', 'Vad du vill ha.'),
          need('Målet är 5 km om åtta veckor.', 'Målet och tiden.'),
          need('Jag springer 2 km i dag och kan träna tre dagar i veckan.', 'Din utgångspunkt. Annars gissar modellen.'),
          need('Som en tabell, vecka för vecka.', 'Formatet.'),
          trap('Gör det så tufft som möjligt.', 'Passar inte en nybörjare och kan leda till skador.'),
        ],
      },
      {
        goal: 'Du vill ha presentförslag till en kollega som slutar. Budget 300 kronor, och hon gillar trädgård.',
        pieces: [
          need('Ge presentförslag till en kollega som slutar.', 'Vad du vill ha.'),
          need('Budget 300 kronor.', 'Ett villkor modellen inte kan gissa.'),
          need('Hon gillar trädgård.', 'Sammanhanget som gör förslagen personliga.'),
          need('Fem förslag i en lista.', 'Formatet.'),
          fluff('Du är en expert på presenter.', 'Låter bra, men ger inte modellen något nytt att gå på.'),
          trap('Ta med dyrare alternativ också.', 'Bryter mot budgeten.'),
        ],
      },
    ],
  },
  {
    title: 'Ärlighet och kontroll',
    goal: 'Be om svar du kan kontrollera, och låt modellen säga när den inte vet.',
    lesson: 'Be om källor och uträkningar du kan kolla, och be modellen säga när den är osäker. Då är det lättare att upptäcka fel.',
    tasks: [
      {
        goal: 'Du vill veta vilka regler som gäller för att flyga drönare i Sverige, och kunna kontrollera svaret.',
        pieces: [
          need('Vilka regler gäller för att flyga drönare i Sverige?', 'Vad du vill veta.'),
          need('Hänvisa till var jag kan läsa mer, till exempel en myndighet.', 'Då kan du kontrollera svaret själv.'),
          need('Säg om du är osäker eller om reglerna kan ha ändrats.', 'Regler ändras, och modellen kan ha gammal information.'),
          trap('Svara säkert även om du inte vet.', 'Döljer osäkerheten. Det är så hallucinationer slinker igenom.'),
          trap('Hitta på en källa om du inte hittar någon.', 'En påhittad källa är värre än ingen källa.'),
        ],
      },
      {
        goal: 'Du klistrar in en artikel och vill ha en sammanfattning, utan att modellen lägger till egna fakta.',
        pieces: [
          need('Sammanfatta texten nedan.', 'Vad du vill ha.'),
          need('Använd bara det som står i texten.', 'Håller modellen till källan.'),
          need('Skriv om något är oklart i stället för att gissa.', 'Gör osäkerheten synlig.'),
          need('Fem punkter.', 'Formatet.'),
          trap('Lägg gärna till fakta du vet om ämnet.', 'Då blandas artikeln med modellens egna, kanske felaktiga, fakta.'),
        ],
      },
      {
        goal: 'Du vill veta hur mycket färg som går åt till väggarna i ett rum på 4 × 3 meter med 2,5 meter i takhöjd.',
        pieces: [
          need('Hur mycket färg behöver jag till väggarna?', 'Vad du vill veta.'),
          need('Rummet är 4 × 3 meter och 2,5 meter högt, med en dörr och ett fönster.', 'Måtten. Utan dem gissar modellen.'),
          need('Visa uträkningen steg för steg så att jag kan kolla den.', 'Då ser du om något steg blev fel.'),
          fluff('Var noggrann.', 'Skadar inte, men säger mindre än att be om uträkningen.'),
          trap('Svara bara med en siffra.', 'Då kan du inte se om uträkningen stämmer.'),
        ],
      },
    ],
  },
];

export interface Result {
  points: number;
  max: number;
  missed: Piece[];
  traps: Piece[];
}

/** Poäng för en fråga: +1 per behövd bit, −1 per fälla, aldrig under noll. */
export function scoreTask(task: Task, chosen: ReadonlySet<number>): Result {
  const needs = task.pieces.filter((p) => p.kind === 'need');
  const got = task.pieces.filter((p, i) => chosen.has(i) && p.kind === 'need').length;
  const traps = task.pieces.filter((p, i) => chosen.has(i) && p.kind === 'trap');
  return {
    points: Math.max(0, got - traps.length),
    max: needs.length,
    missed: task.pieces.filter((p, i) => p.kind === 'need' && !chosen.has(i)),
    traps,
  };
}

export const maxScore = (level: number) => LEVELS[level].tasks.reduce((a, t) => a + t.pieces.filter((p) => p.kind === 'need').length, 0);

export const starsFor = (points: number, max: number): 1 | 2 | 3 => (points >= max * 0.9 ? 3 : points >= max * 0.6 ? 2 : 1);

/** Bitarnas ordning blandas (fast per bana), så att de behövda inte alltid står först. */
export function shuffledOrder(n: number, rng: Rng): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
