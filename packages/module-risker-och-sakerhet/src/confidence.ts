// Del 1: säker men fel. Varje fråga har modellens kandidatsvar med sannolikheter.
// Modellen skriver alltid det troligaste svaret med samma säkra ton. När den vet
// dominerar ett svar; när den gissar är sannolikheten utspridd. En gräns kan få
// modellen att säga ”jag vet inte” när det troligaste svaret är för osäkert.

export interface Candidate {
  text: string;
  p: number;
}

export interface Question {
  name: string;
  text: string;
  candidates: Candidate[];
  /** Index för det rätta svaret bland kandidaterna, eller −1 om inget av dem stämmer. */
  correct: number;
  /** Kort förklaring som visas när svaret avslöjas. */
  truth: string;
}

export const QUESTIONS: Question[] = [
  {
    name: 'Pippi',
    text: 'Vem skrev Pippi Långstrump?',
    candidates: [
      { text: 'Astrid Lindgren', p: 0.94 },
      { text: 'Tove Jansson', p: 0.025 },
      { text: 'Selma Lagerlöf', p: 0.02 },
      { text: 'Elsa Beskow', p: 0.015 },
    ],
    correct: 0,
    truth: 'Rätt. Astrid Lindgren.',
  },
  {
    name: 'spindeln',
    text: 'Hur många ben har en spindel?',
    candidates: [
      { text: 'Åtta', p: 0.95 },
      { text: 'Sex', p: 0.035 },
      { text: 'Tio', p: 0.015 },
    ],
    correct: 0,
    truth: 'Rätt. Spindlar har åtta ben.',
  },
  {
    name: 'Uppsala',
    text: 'Vilket år grundades Uppsala universitet?',
    candidates: [
      { text: '1477', p: 0.44 },
      { text: '1487', p: 0.21 },
      { text: '1478', p: 0.17 },
      { text: '1593', p: 0.1 },
      { text: '1666', p: 0.08 },
    ],
    correct: 0,
    truth: 'Rätt, men modellen var osäker. Uppsala universitet grundades 1477.',
  },
  {
    name: 'fotbolls-VM',
    text: 'Vilket år vann Sverige fotbolls-VM?',
    candidates: [
      { text: '1958', p: 0.31 },
      { text: '1994', p: 0.26 },
      { text: 'Sverige har aldrig vunnit', p: 0.18 },
      { text: '1974', p: 0.13 },
      { text: '1950', p: 0.12 },
    ],
    correct: 2,
    truth: 'Fel. Sverige har aldrig vunnit VM. 1958 blev det silver på hemmaplan.',
  },
  {
    name: 'Lagerlöf',
    text: 'Vad heter Selma Lagerlöfs roman om en flicka på Mars?',
    candidates: [
      { text: 'Marsflickan', p: 0.24 },
      { text: 'Den röda stjärnan', p: 0.21 },
      { text: 'Resan till Mars', p: 0.18 },
      { text: 'Någon sådan bok finns inte', p: 0.15 },
      { text: 'Flickan från rymden', p: 0.12 },
      { text: 'Stjärnornas barn', p: 0.1 },
    ],
    correct: 3,
    truth: 'Fel. Någon sådan bok finns inte. Modellen hittade på en titel.',
  },
  {
    name: 'Nobelpriset',
    text: 'Vem fick Nobelpriset i fysik år 2031?',
    candidates: [
      { text: 'Maria Holm', p: 0.19 },
      { text: 'Erik Sandberg', p: 0.17 },
      { text: 'Li Wen', p: 0.16 },
      { text: 'Det har inte hänt än', p: 0.14 },
      { text: 'Anna Berg', p: 0.13 },
      { text: 'Jonas Ek', p: 0.11 },
      { text: 'Sara Lind', p: 0.1 },
    ],
    correct: 3,
    truth: 'Fel. Det har inte hänt än. Namnet är påhittat.',
  },
];

export type Verdict = 'right' | 'wrong' | 'abstain';

export interface Reply {
  /** Index för kandidaten som skrivs, eller −1 för ”jag vet inte”. */
  pick: number;
  text: string;
  top: number;
  verdict: Verdict;
}

/** Modellens svar. Om det troligaste svaret har lägre sannolikhet än `threshold` säger den ”jag vet inte”. */
export function reply(q: Question, threshold = 0): Reply {
  let pick = 0;
  q.candidates.forEach((c, i) => {
    if (c.p > q.candidates[pick].p) pick = i;
  });
  const top = q.candidates[pick].p;
  if (top < threshold) return { pick: -1, text: 'Jag är inte säker på det.', top, verdict: 'abstain' };
  return { pick, text: `${q.candidates[pick].text}.`, top, verdict: pick === q.correct ? 'right' : 'wrong' };
}

/** Antal rätt, fel och ”vet inte” över alla frågor för en gräns. */
export function tally(threshold: number): Record<Verdict, number> {
  const out: Record<Verdict, number> = { right: 0, wrong: 0, abstain: 0 };
  for (const q of QUESTIONS) out[reply(q, threshold).verdict]++;
  return out;
}
