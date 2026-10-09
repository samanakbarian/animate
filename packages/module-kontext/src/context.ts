// Ett samtal och ett kontextfönster. Modellen ser bara de meddelanden som får
// plats i fönstret, räknat bakifrån. Det som inte får plats finns inte för den.
// En minnesanteckning läggs först i fönstret och tar plats som allt annat.

export interface Message {
  who: 'du' | 'ai';
  text: string;
}

export const CHAT: Message[] = [
  { who: 'du', text: 'Hej! Min hund heter Ture och han är rädd för åska.' },
  { who: 'ai', text: 'Hej! Stackars Ture. Många hundar tycker att åska är läskigt.' },
  { who: 'du', text: 'Vad kan jag laga till middag i kväll?' },
  { who: 'ai', text: 'Vad sägs om pasta med tomatsås och lite basilika?' },
  { who: 'du', text: 'Bra idé. Hur länge ska pastan koka?' },
  { who: 'ai', text: 'Oftast 8 till 10 minuter. Det står på paketet.' },
  { who: 'du', text: 'Kan du rätta en mening på engelska?' },
  { who: 'ai', text: 'Absolut. Skriv meningen så tittar jag på den.' },
  { who: 'du', text: 'I has been to London two times.' },
  { who: 'ai', text: 'Skriv: I have been to London twice.' },
  { who: 'du', text: 'Tack! Vad är huvudstaden i Australien?' },
  { who: 'ai', text: 'Canberra, inte Sydney som många tror.' },
  { who: 'du', text: 'Hur långt är det till månen?' },
  { who: 'ai', text: 'Ungefär 384 000 kilometer i snitt.' },
];

export const QUESTION: Message = { who: 'du', text: 'Förresten, vad heter min hund?' };
export const MEMORY = 'Minne: Användarens hund heter Ture.';
export const ANSWER_KNOWN = 'Han heter Ture.';
export const ANSWER_UNKNOWN = 'Det vet jag inte. Vad heter han?';

/** Ungefär antal tokens: en token per tre tecken, som för svensk text. */
export const tokensOf = (text: string) => Math.ceil(text.length / 3);

export interface ContextResult {
  /** Per meddelande i samtalet (de `count` första): ryms det i fönstret? */
  inside: boolean[];
  /** Tokens i fönstret: minnet, meddelandena som ryms och frågan. */
  used: number;
  /** Tokens i meddelandena som inte fick plats. */
  dropped: number;
  remembers: boolean;
  answer: string;
}

/** Vad modellen ser när samtalet har `count` meddelanden före frågan (om frågan är ställd). */
export function contextFor(count: number, window: number, memory: boolean, asked = true): ContextResult {
  const msgs = CHAT.slice(0, count);
  let used = (asked ? tokensOf(QUESTION.text) : 0) + (memory ? tokensOf(MEMORY) : 0);
  const inside = msgs.map(() => false);
  // bakifrån: det senaste får plats först
  for (let i = msgs.length - 1; i >= 0; i--) {
    const t = tokensOf(msgs[i].text);
    if (used + t > window) break;
    used += t;
    inside[i] = true;
  }
  const dropped = msgs.reduce((a, m, i) => a + (inside[i] ? 0 : tokensOf(m.text)), 0);
  const remembers = memory || (count > 0 && inside[0]);
  return { inside, used, dropped, remembers, answer: remembers ? ANSWER_KNOWN : ANSWER_UNKNOWN };
}
