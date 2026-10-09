// En simulerad assistent som skriver ett mejl. Frågan (prompten) byggs av fyra
// delar som kan vara med eller inte. Svaret är förskrivet per kombination av
// delar – ingen riktig AI – men visar hur det brukar gå: saknas uppgifter fyller
// modellen i med allmänna fraser eller hittar på detaljer.

export type PieceId = 'task' | 'context' | 'format' | 'example';

export interface Piece {
  id: PieceId;
  /** Kort namn, t.ex. på reglaget. */
  name: string;
  /** Texten som läggs till i frågan. */
  text: string;
  /** Hur mycket delen betyder för hur nära svaret kommer det man ville ha. */
  weight: number;
}

/** Grunden i frågan, alltid med. */
export const BASE = 'Skriv ett mejl.';

export const PIECES: Piece[] = [
  { id: 'task', name: 'Vad och till vem', text: 'Till min mentor Anna. Jag är sjuk i dag och kommer inte till skolan.', weight: 0.4 },
  { id: 'context', name: 'Sammanhang', text: 'Jag missar mattaprovet i eftermiddag och vill veta när jag kan skriva det.', weight: 0.3 },
  { id: 'format', name: 'Format och ton', text: 'Högst fyra meningar, vänlig ton.', weight: 0.15 },
  { id: 'example', name: 'Exempel på stil', text: 'Skriv som jag brukar: ”Hej Anna! … Tack på förhand! /Kim”', weight: 0.15 },
];

/**
 * ok = det du ville ha, vague = allmänt och intetsägande, invented = påhittat,
 * extra = onödig fyllnad, placeholder = en lucka du själv måste fylla i.
 */
export type SegmentKind = 'ok' | 'vague' | 'invented' | 'extra' | 'placeholder';

export interface Segment {
  text: string;
  kind: SegmentKind;
}

export type Flags = Record<PieceId, boolean>;

export function answer(f: Flags): Segment[] {
  const out: Segment[] = [];
  const add = (text: string, kind: SegmentKind) => out.push({ text, kind });
  add(f.task ? 'Hej Anna!' : 'Hej!', f.task ? 'ok' : 'vague');
  if (f.task) add('Jag är tyvärr sjuk i dag och kommer inte till skolan.', 'ok');
  else if (!f.context) add('Jag skriver för att höra av mig angående det vi pratade om.', 'vague');
  if (f.context)
    add(
      f.task
        ? 'Därför missar jag mattaprovet i eftermiddag. När kan jag skriva det i stället?'
        : 'Jag undrar när jag kan skriva mattaprovet som är i eftermiddag.',
      'ok',
    );
  else if (f.task) add('Jag har haft feber sedan i tisdags, och läkaren säger att jag ska vila resten av veckan.', 'invented');
  else add('Hör gärna av dig om du har några frågor.', 'vague');
  if (!f.format)
    add(
      'Jag hoppas att lektionerna går bra och att resten av klassen har det bra. Jag vill också passa på att tacka för en bra termin hittills.',
      'extra',
    );
  if (f.example) add('Tack på förhand! /Kim', 'ok');
  else add('Med vänliga hälsningar, [ditt namn]', 'placeholder');
  return out;
}

/** Hur nära det du ville ha, 0–1. Påhittade detaljer drar ner. */
export function closeness(f: Flags): number {
  const base = PIECES.reduce((a, p) => a + (f[p.id] ? p.weight : 0), 0);
  const invented = answer(f).some((s) => s.kind === 'invented');
  return Math.max(0, Math.min(1, base - (invented ? 0.15 : 0)));
}

export const flagsFrom = (params: Record<string, number>): Flags => ({
  task: (params.task ?? 0) >= 0.5,
  context: (params.context ?? 0) >= 0.5,
  format: (params.format ?? 0) >= 0.5,
  example: (params.example ?? 0) >= 0.5,
});
