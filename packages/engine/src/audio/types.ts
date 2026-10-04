// Gemensamma ljudtyper: ett partitur är en sorterad lista av NoteEvent.

export type Inst =
  | 'heart'
  | 'kick'
  | 'snare'
  | 'hat'
  | 'ohat'
  | 'bass'
  | 'pad'
  | 'lead'
  | 'crash'
  | 'glitch'
  | 'roll'
  | 'drone'
  | 'riser'
  | 'piano'
  | 'click'
  | 'fall'
  | 'hit'
  | 'boom'
  | 'sub'
  | 'clap'
  | 'stab'
  | 'shaker'
  | 'tom';

export interface NoteEvent {
  time: number;
  dur: number;
  inst: Inst;
  midi: number;
  vel: number;
  /** Fri parameter (t.ex. distorsion 0..1, filteröppning eller seed). */
  p?: number;
  /** Ackordtoner (MIDI) för 'pad' och 'stab'. */
  notes?: number[];
}

/** Allt motorn behöver veta om ett verk. */
export interface Score {
  events: NoteEvent[];
  duration: number;
  /** Nivå (0..1) för det kontinuerliga regnbruset vid tid t. Utelämnad = inget regn. */
  ambience?: (t: number) => number;
}
