// Kontraktet för en förklarmodul: en film (tidslinje med nyckelrutor för
// parametrar) som kan pausas och styras med reglage. Scenen ritas alltid som
// en ren funktion av (t, params) – se ADR 0003 och 0004.

/** Parametervärden, t.ex. { w1: 0.8, bias: -0.2 }. */
export type Params = Record<string, number>;

/** film = tidslinjen styr parametrarna, explore = besökaren styr dem. */
export type Mode = 'film' | 'explore';

export interface ParamSpec {
  id: string;
  /** Kort etikett vid reglaget, t.ex. ”Vikt w₁”. */
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Visat värde; standard är två decimaler med decimalkomma. */
  format?: (v: number) => string;
}

/** Hur värdet tar sig fram TILL den här nyckelrutan från föregående. */
export type Ease = 'linear' | 'smooth' | 'hold';

export interface Keyframe {
  t: number;
  v: number;
  ease?: Ease;
}

export interface Chapter {
  id: string;
  start: number;
  title: string;
  /** Berättartext som skrivs fram i bild. */
  caption: string;
}

export interface ModuleScene {
  render(t: number, params: Params, mode: Mode): void;
  /** Bildytans storlek i CSS-pixlar och enhetens pixeltäthet. */
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}

export interface ModuleDefinition {
  id: string;
  title: string;
  /** Filmens längd i sekunder. */
  duration: number;
  params: ParamSpec[];
  /** Nyckelrutor per parameter. Parametrar utan spår ligger kvar på `default`. */
  tracks: Partial<Record<string, Keyframe[]>>;
  chapters: Chapter[];
  /** Text som visas i utforskaläget. */
  exploreCaption: string;
  createScene(host: HTMLElement): ModuleScene;
}
