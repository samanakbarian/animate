// Uppmärksamhet (attention) på riktigt: för varje ord räknas poäng mot alla
// andra ord som skalärprodukten q·k / √d, och softmax gör poängen till vikter.
// Vektorerna är handgjorda och förenklade (en riktig modell lär sig dem), men
// matematiken är densamma som i en transformer.

export type Tag = 'noun' | 'verb' | 'pron' | 'adj' | 'other';
/** Egenskap som substantiv har – och som adjektiv och vissa verb kräver av det de syftar på. */
export type Trait = 'levande' | 'sak' | null;

export interface Token {
  text: string;
  tag: Tag;
  trait: Trait;
}

const T = (text: string, tag: Tag, trait: Trait = null): Token => ({ text, tag, trait });

export const SENTENCES: Token[][] = [
  [
    T('katten', 'noun', 'levande'),
    T('satt', 'verb'),
    T('på', 'other'),
    T('mattan', 'noun', 'sak'),
    T('eftersom', 'other'),
    T('den', 'pron'),
    T('var', 'verb'),
    T('trött', 'adj', 'levande'),
  ],
  [
    T('katten', 'noun', 'levande'),
    T('satt', 'verb'),
    T('på', 'other'),
    T('mattan', 'noun', 'sak'),
    T('eftersom', 'other'),
    T('den', 'pron'),
    T('var', 'verb'),
    T('mjuk', 'adj', 'sak'),
  ],
  [
    T('barnet', 'noun', 'levande'),
    T('läste', 'verb'),
    T('boken', 'noun', 'sak'),
    T('och', 'other'),
    T('det', 'pron'),
    T('skrattade', 'verb', 'levande'),
    T('högt', 'other'),
  ],
];

export const HEADS = ['syftning', 'närhet', 'vem gör vad'] as const;

// Nyckeldimensioner: [substantiv, verb, pronomen, adjektiv, övrigt, levande, sak]
const DIM = 7;
const TAGS: Tag[] = ['noun', 'verb', 'pron', 'adj', 'other'];

function key(tok: Token): number[] {
  const k = new Array(DIM).fill(0);
  k[TAGS.indexOf(tok.tag)] = 1;
  if (tok.trait === 'levande') k[5] = 1;
  if (tok.trait === 'sak') k[6] = 1;
  return k;
}

/**
 * Frågevektorn: vad ordet letar efter, beroende på huvud. Med `causal` får ordet
 * bara använda sig självt och orden före – som i en språkmodell som skriver ett ord i taget.
 */
function query(sentence: Token[], i: number, head: number, causal: boolean): number[] {
  const q = new Array(DIM).fill(0);
  const tok = sentence[i];
  if (head === 0) {
    // syftning: pronomen och adjektiv letar efter substantivet de syftar på.
    // Ett ord efter pronomenet med en egenskap (”trött”, ”mjuk”, ”skrattade”) avgör
    // om det ska vara något levande eller en sak.
    if (tok.tag === 'pron' || tok.tag === 'adj') {
      q[0] = 2.2;
      // Pronomenet hämtar ledtråden från orden efter sig. Det går bara när hela meningen syns.
      const ahead = tok.tag === 'pron' ? (causal ? [] : sentence.slice(i + 1)) : [tok];
      const hint = ahead.find((s) => s.tag !== 'noun' && s.trait !== null);
      const trait = hint?.trait ?? null;
      if (trait === 'levande') q[5] = 3.2;
      if (trait === 'sak') q[6] = 3.2;
    } else q[TAGS.indexOf(tok.tag)] = 2.5; // övriga tittar mest på sin egen sort
  } else if (head === 2) {
    // vem gör vad: verb letar efter substantiv (vem/vad), substantiv efter verb
    if (tok.tag === 'verb') q[0] = 3;
    else if (tok.tag === 'noun') q[1] = 3;
    else q[TAGS.indexOf(tok.tag)] = 1.5;
  }
  return q;
}

/**
 * Uppmärksamhetsvikter (rad = ord som tittar, kolumn = ord som tittas på). Varje rad summerar till 1.
 * `causal`: framtida ord är maskerade (vikt 0), som i GPT-liknande språkmodeller. Utan den ser
 * varje ord hela meningen, som i modeller som läser en färdig text (t.ex. BERT).
 */
export function attention(sentence: Token[], head: number, sharpness = 1, causal = false): number[][] {
  const n = sentence.length;
  const keys = sentence.map(key);
  return sentence.map((_, i) => {
    const q = query(sentence, i, head, causal);
    const scores = keys.map((k, j) => {
      if (causal && j > i) return -Infinity;
      if (head === 1) return 2.4 - 1.3 * Math.abs(i - j); // närhet: rent positionsberoende
      let s = 0;
      for (let d = 0; d < DIM; d++) s += q[d] * k[d];
      return (s / Math.sqrt(DIM)) * 2;
    });
    const m = Math.max(...scores);
    const e = scores.map((s) => (s === -Infinity ? 0 : Math.exp((s - m) * sharpness)));
    const sum = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / sum).slice(0, n);
  });
}
