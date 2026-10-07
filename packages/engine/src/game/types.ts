// Kontraktet för ett lärspel. Spelet styrs av spelaren, inte av en tidslinje,
// men allt slumpmässigt kommer från en seedad Rng per bana: samma bana och samma
// drag ger samma utfall (ADR 0007).

import type { Rng } from '../core/math';

export interface GameLevel {
  title: string;
  /** En mening om vad banan går ut på. */
  goal: string;
}

export interface GameResult {
  score: number;
  /** 1–3 stjärnor. */
  stars: 1 | 2 | 3;
  /** Kort förklaring av utfallet, visas på resultatskärmen. */
  message: string;
}

export type Sound = 'ok' | 'bad' | 'tick' | 'win';

/** Det skalet ger spelet. */
export interface GameApi {
  /** Seedad slump för banan. Samma bana ger samma följd av tal. */
  readonly rng: Rng;
  setScore(text: string): void;
  setStatus(text: string): void;
  sound(kind: Sound): void;
  finish(result: GameResult): void;
}

export interface GameSession {
  resize?(width: number, height: number, dpr: number): void;
  dispose(): void;
}

export interface GameDefinition {
  id: string;
  title: string;
  /** Kort introduktion på startskärmen. */
  intro: string;
  levels: GameLevel[];
  /** Lägre poäng är bättre (t.ex. antal slag i golf). */
  lowerIsBetter?: boolean;
  /** Etikett för poängen, t.ex. ”slag” eller ”poäng”. */
  scoreLabel: string;
  start(host: HTMLElement, level: number, api: GameApi): GameSession;
}
