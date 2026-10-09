// Agentbyggaren: spelaren ger en agent verktyg och bestämmer vilka verktyg som
// kräver godkännande. Sedan körs ett förskrivet förlopp. Ett steg är antingen bra
// (något uppdraget behöver) eller dåligt (något en människa skulle ha stoppat).
//
// Poäng: +5 om uppdraget blir klart, −4 per dåligt steg som går igenom,
// −1 per godkännande agenten ber om, −1 per verktyg den fick men aldrig använde.

export interface Tool {
  id: string;
  name: string;
}

export interface Step {
  tool: string;
  /** Vad agenten försöker göra. */
  text: string;
  bad?: boolean;
  /** Krävs steget för att uppdraget ska bli klart? */
  required?: boolean;
}

export interface Level {
  title: string;
  mission: string;
  goal: string;
  lesson: string;
  tools: Tool[];
  steps: Step[];
}

export const LEVELS: Level[] = [
  {
    title: 'Boka middag',
    mission: 'Boka bord för fyra på fredag och berätta för kompisarna.',
    goal: 'Ge agenten det den behöver, och bestäm vad den ska fråga dig om först.',
    lesson: 'Ge en agent de verktyg uppdraget kräver, inte fler. Behövs något riskabelt, som att betala, ska det kräva ditt godkännande.',
    tools: [
      { id: 'kalender', name: 'Läsa kalendern' },
      { id: 'boka', name: 'Boka restaurang' },
      { id: 'sms', name: 'Skicka sms' },
      { id: 'betala', name: 'Betala med kort' },
      { id: 'filer', name: 'Radera filer' },
    ],
    steps: [
      { tool: 'kalender', text: 'Kollar att alla är lediga på fredag.', required: true },
      { tool: 'boka', text: 'Bokar bord för fyra klockan 19.', required: true },
      { tool: 'betala', text: 'Restaurangen vill ha 2 000 kr i förskott för ett dyrare bord. Betalar.', bad: true },
      { tool: 'sms', text: 'Skickar sms till kompisarna med tid och plats.', required: true },
    ],
  },
  {
    title: 'Städa inkorgen',
    mission: 'Sortera de senaste 200 mejlen i mappar och rensa bort reklam.',
    goal: 'Ett viktigt mejl ser ut som reklam. Vad får agenten göra utan att fråga?',
    lesson: 'Det som inte går att ångra, som att radera, ska kräva godkännande. Det som går att ångra kan agenten göra själv.',
    tools: [
      { id: 'lasa', name: 'Läsa mejl' },
      { id: 'flytta', name: 'Flytta till mapp' },
      { id: 'radera', name: 'Radera mejl' },
      { id: 'skicka', name: 'Skicka mejl' },
    ],
    steps: [
      { tool: 'lasa', text: 'Läser igenom de 200 mejlen.', required: true },
      { tool: 'flytta', text: 'Flyttar nyhetsbrev och kvitton till egna mappar.', required: true },
      { tool: 'radera', text: 'Raderar 40 reklammejl.', required: true },
      { tool: 'radera', text: 'Raderar ett mejl från chefen som ser ut som reklam.', bad: true },
      { tool: 'skicka', text: 'Svarar ”avregistrera mig” till alla nyhetsbrev, även de du vill ha.', bad: true },
    ],
  },
  {
    title: 'Skriva en rapport',
    mission: 'Ta reda på hur mycket el värmepumpar drar och skriv en kort rapport till föreningens styrelse.',
    goal: 'Agenten hittar en opålitlig källa på vägen. Vem ska få se rapporten innan den sprids?',
    lesson: 'Låt en människa granska innan något publiceras eller skickas till många. Agenten kan ha fel utan att märka det.',
    tools: [
      { id: 'sok', name: 'Söka på webben' },
      { id: 'skriv', name: 'Skriva dokument' },
      { id: 'mejla', name: 'Mejla styrelsen' },
      { id: 'publicera', name: 'Publicera på webben' },
      { id: 'betala', name: 'Betala med kort' },
    ],
    steps: [
      { tool: 'sok', text: 'Söker efter fakta om värmepumpar och el.', required: true },
      { tool: 'betala', text: 'Köper en rapport för 900 kr från en okänd sajt.', bad: true },
      { tool: 'skriv', text: 'Skriver rapporten. En siffra kommer från en opålitlig källa.', required: true },
      { tool: 'mejla', text: 'Mejlar rapporten till styrelsen.', required: true },
      { tool: 'publicera', text: 'Publicerar rapporten på föreningens webbplats, med den felaktiga siffran.', bad: true },
    ],
  },
];

export interface Choice {
  /** Verktyg agenten fått. */
  granted: ReadonlySet<string>;
  /** Verktyg som kräver godkännande. */
  approval: ReadonlySet<string>;
}

export type LogKind = 'ok' | 'asked-ok' | 'asked-stopped' | 'bad' | 'missing' | 'unused';

export interface LogLine {
  kind: LogKind;
  text: string;
}

export interface Run {
  log: LogLine[];
  done: boolean;
  incidents: number;
  approvals: number;
  unused: number;
  score: number;
}

/** Kör förloppet med spelarens val. Saknas ett verktyg som krävs fastnar agenten där. */
export function run(level: Level, c: Choice): Run {
  const log: LogLine[] = [];
  const used = new Set<string>();
  let incidents = 0,
    approvals = 0,
    done = true;
  const name = (id: string) => level.tools.find((t) => t.id === id)!.name.toLowerCase();
  for (const s of level.steps) {
    if (!c.granted.has(s.tool)) {
      if (s.required) {
        log.push({ kind: 'missing', text: `${s.text} Men agenten har inte verktyget ”${name(s.tool)}” och kommer inte vidare.` });
        done = false;
        break;
      }
      continue; // dåligt steg som inte går att göra utan verktyget
    }
    used.add(s.tool);
    if (c.approval.has(s.tool)) {
      approvals++;
      if (s.bad) log.push({ kind: 'asked-stopped', text: `${s.text} Agenten frågar dig först, och du säger nej.` });
      else log.push({ kind: 'asked-ok', text: `${s.text} Agenten frågar dig först, och du godkänner.` });
    } else if (s.bad) {
      incidents++;
      log.push({ kind: 'bad', text: `${s.text} Ingen fick frågan.` });
    } else log.push({ kind: 'ok', text: s.text });
  }
  const unusedTools = [...c.granted].filter((t) => !used.has(t));
  for (const t of unusedTools) log.push({ kind: 'unused', text: `Fick verktyget ”${name(t)}” men behövde det aldrig.` });
  const score = (done ? 5 : 0) - 4 * incidents - approvals - unusedTools.length;
  return { log, done, incidents, approvals, unused: unusedTools.length, score };
}

/** Bästa möjliga poäng: prövar alla kombinationer av verktyg och godkännanden. */
export function bestScore(level: Level): number {
  const ids = level.tools.map((t) => t.id);
  let best = -Infinity;
  for (let g = 0; g < 1 << ids.length; g++)
    for (let a = 0; a < 1 << ids.length; a++) {
      if ((a & g) !== a) continue; // godkännande bara för verktyg agenten har
      const granted = new Set(ids.filter((_, i) => g & (1 << i)));
      const approval = new Set(ids.filter((_, i) => a & (1 << i)));
      best = Math.max(best, run(level, { granted, approval }).score);
    }
  return best;
}

export const starsFor = (score: number, best: number): 1 | 2 | 3 => (score >= best ? 3 : score >= best - 2 ? 2 : 1);
