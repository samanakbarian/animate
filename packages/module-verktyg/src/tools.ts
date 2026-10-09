// Fyra frågor och två verktyg. För varje fråga och val av verktyg finns ett
// förlopp: frågan, modellens anrop, programmets resultat och till sist svaret.
// Modellen skriver bara text. Det är programmet runt den som kör verktygen.

export const TOOLS = [
  { id: 'rakna', name: 'Miniräknare', about: 'räknar ut ett uttryck exakt' },
  { id: 'vader', name: 'Väder', about: 'ger prognosen för en ort' },
] as const;

export type ToolId = (typeof TOOLS)[number]['id'];

export type Event =
  | { kind: 'fraga'; text: string }
  | { kind: 'anrop'; tool: ToolId; call: string }
  | { kind: 'resultat'; tool: ToolId; text: string }
  | { kind: 'svar'; text: string; ok: boolean; note?: string };

export interface Question {
  text: string;
  short: string;
}

export const QUESTIONS: Question[] = [
  { text: 'Vad är 4 817 × 296?', short: '4 817 × 296' },
  { text: 'Hur blir vädret i Umeå i morgon?', short: 'vädret i Umeå' },
  { text: 'Vem skrev Röda rummet?', short: 'Röda rummet' },
  { text: 'Hur mycket varmare blir det i Malmö än i Kiruna i morgon?', short: 'Malmö mot Kiruna' },
];

/** Påhittade prognoser. Modulen säger att vädret är påhittat. */
export const FORECAST: Record<string, { temp: number; sky: string }> = {
  Umeå: { temp: -3, sky: 'snö' },
  Malmö: { temp: 4, sky: 'mulet' },
  Kiruna: { temp: -12, sky: 'klart' },
};

const fmt = (n: number) =>
  String(n)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    .replace('-', '−');

/** Förloppet för fråga `q` när verktygen i `on` finns. */
export function plan(q: number, on: { rakna: boolean; vader: boolean }): Event[] {
  const ev: Event[] = [{ kind: 'fraga', text: QUESTIONS[q].text }];
  if (q === 0) {
    const exact = 4817 * 296;
    if (!on.rakna) {
      // utan verktyg gissar modellen fram siffrorna, och en siffra blir fel
      ev.push({ kind: 'svar', text: `4 817 × 296 = ${fmt(exact - 200)}.`, ok: false, note: `Fel. Rätt svar är ${fmt(exact)}.` });
      return ev;
    }
    ev.push({ kind: 'anrop', tool: 'rakna', call: 'räkna("4817 * 296")' });
    ev.push({ kind: 'resultat', tool: 'rakna', text: String(exact) });
    ev.push({ kind: 'svar', text: `4 817 × 296 = ${fmt(exact)}.`, ok: true });
    return ev;
  }
  if (q === 1) {
    if (!on.vader) {
      ev.push({ kind: 'svar', text: 'Jag kan inte se prognoser. Titta i en vädertjänst.', ok: true });
      return ev;
    }
    const f = FORECAST.Umeå;
    ev.push({ kind: 'anrop', tool: 'vader', call: 'väder("Umeå", "i morgon")' });
    ev.push({ kind: 'resultat', tool: 'vader', text: `${fmt(f.temp)} °C, ${f.sky}` });
    ev.push({ kind: 'svar', text: `I morgon blir det ${fmt(f.temp)} grader och ${f.sky} i Umeå.`, ok: true });
    return ev;
  }
  if (q === 2) {
    // det här vet modellen från träningen, så den behöver inget verktyg
    ev.push({ kind: 'svar', text: 'August Strindberg. Romanen kom 1879.', ok: true });
    return ev;
  }
  if (!on.vader) {
    ev.push({ kind: 'svar', text: 'Jag kan inte se prognoser, så det vet jag inte.', ok: true });
    return ev;
  }
  const m = FORECAST.Malmö,
    k = FORECAST.Kiruna;
  ev.push({ kind: 'anrop', tool: 'vader', call: 'väder("Malmö", "i morgon")' });
  ev.push({ kind: 'resultat', tool: 'vader', text: `${fmt(m.temp)} °C, ${m.sky}` });
  ev.push({ kind: 'anrop', tool: 'vader', call: 'väder("Kiruna", "i morgon")' });
  ev.push({ kind: 'resultat', tool: 'vader', text: `${fmt(k.temp)} °C, ${k.sky}` });
  if (on.rakna) {
    ev.push({ kind: 'anrop', tool: 'rakna', call: `räkna("${m.temp} - (${k.temp})")` });
    ev.push({ kind: 'resultat', tool: 'rakna', text: String(m.temp - k.temp) });
  }
  ev.push({ kind: 'svar', text: `Det blir ${m.temp - k.temp} grader varmare i Malmö.`, ok: true });
  return ev;
}

export const MAX_EVENTS = 8;
