// Agentens förlopp som ren data. Agenten är simulerad (inget riktigt AI-anrop)
// men följer exakt den loop som riktiga agenter använder: tänk → agera med ett
// verktyg → observera resultatet → tänk igen. Reglagen ändrar förloppet.

export type EventKind = 'goal' | 'think' | 'act' | 'observe' | 'ask' | 'human' | 'done';

export interface AgentEvent {
  kind: EventKind;
  text: string;
  /** Verktyget som anropas (bara för 'act'). */
  tool?: ToolId;
}

export type ToolId = 'kalender' | 'rum' | 'mejl';

export const TOOLS: { id: ToolId; label: string }[] = [
  { id: 'kalender', label: 'kalender' },
  { id: 'rum', label: 'rumsbokning' },
  { id: 'mejl', label: 'mejl' },
];

export interface ScenarioOptions {
  /** Rummet är upptaget första gången → agenten måste planera om. */
  failure: boolean;
  /** En människa måste godkänna innan något görs som inte går att ångra. */
  approval: boolean;
}

export function scenario({ failure, approval }: ScenarioOptions): AgentEvent[] {
  const ev: AgentEvent[] = [
    { kind: 'goal', text: 'Boka ett möte med Lisa och Omar nästa vecka och skicka en inbjudan.' },
    { kind: 'think', text: 'Jag behöver en tid då alla tre är lediga.' },
    { kind: 'act', tool: 'kalender', text: 'kalender.lediga_tider(["lisa", "omar", "jag"], vecka=42)' },
    { kind: 'observe', text: 'Lediga: tis 10–11, ons 14–15, tor 9–10.' },
    { kind: 'think', text: 'Tisdag 10 är först. Nu behövs ett rum för tre.' },
    { kind: 'act', tool: 'rum', text: 'rum.sök(personer=3, tid="tis 10:00")' },
  ];
  let when = 'tis 10:00';
  if (failure) {
    ev.push(
      { kind: 'observe', text: 'Inga lediga rum tisdag 10:00.' },
      { kind: 'think', text: 'Tisdag går inte. Jag provar nästa lediga tid.' },
      { kind: 'act', tool: 'rum', text: 'rum.sök(personer=3, tid="ons 14:00")' },
    );
    when = 'ons 14:00';
  }
  ev.push({ kind: 'observe', text: `Rummet Kajen är ledigt ${when}.` }, { kind: 'think', text: 'Jag bokar Kajen och skickar inbjudan.' });
  if (approval) {
    ev.push({ kind: 'ask', text: `Får jag boka Kajen ${when} och mejla Lisa och Omar?` }, { kind: 'human', text: 'Ja, kör.' });
  }
  ev.push(
    { kind: 'act', tool: 'rum', text: `rum.boka("Kajen", tid="${when}")` },
    { kind: 'observe', text: 'Bokat. Bokningsnummer 4711.' },
    { kind: 'act', tool: 'mejl', text: `mejl.skicka(till=["lisa", "omar"], ämne="Möte ${when}, Kajen")` },
    { kind: 'observe', text: 'Skickat till 2 mottagare.' },
    { kind: 'done', text: `Klart: mötet är bokat ${when} i Kajen och inbjudan är skickad.` },
  );
  return ev;
}

/** Hur många varv agenten har gått i loopen efter de första `n` händelserna. */
export function loopCount(events: readonly AgentEvent[], n: number): number {
  return events.slice(0, n).filter((e) => e.kind === 'act').length;
}

export const MAX_EVENTS = scenario({ failure: true, approval: true }).length;
