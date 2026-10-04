// Spelarens tillstånd utan DOM: tid, film/utforska och parametrar.
// Klockan injiceras så att logiken går att testa deterministiskt.

import { clamp } from '../core/math';
import { clampParam, evaluateParams } from './params';
import type { Mode, ModuleDefinition, Params } from './types';

export class ModuleController {
  private playing = false;
  private startClock = 0;
  private pausedAt = 0;
  private overrides: Params = {};
  private currentMode: Mode = 'film';

  constructor(
    readonly def: ModuleDefinition,
    private readonly clock: () => number,
  ) {}

  get mode(): Mode {
    return this.currentMode;
  }
  get isPlaying(): boolean {
    return this.playing;
  }
  /** Filmtid i sekunder, 0…duration. */
  get time(): number {
    const t = this.playing ? this.clock() - this.startClock : this.pausedAt;
    return clamp(t, 0, this.def.duration);
  }

  /** Spela filmen (från början om den är slut). Utforskaläget lämnas. */
  play() {
    let t = this.time;
    if (t >= this.def.duration) t = 0;
    this.currentMode = 'film';
    this.startClock = this.clock() - t;
    this.playing = true;
  }

  pause() {
    this.pausedAt = this.time;
    this.playing = false;
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  seek(t: number) {
    const tt = clamp(t, 0, this.def.duration);
    this.pausedAt = tt;
    this.startClock = this.clock() - tt;
    if (this.currentMode === 'explore') this.currentMode = 'film';
  }

  /** Pausa och låt besökaren ta över – reglagen startar där filmen var. */
  explore() {
    if (this.currentMode === 'explore') return;
    this.overrides = this.filmParams();
    this.pause();
    this.currentMode = 'explore';
  }

  setParam(id: string, value: number) {
    const spec = this.def.params.find((p) => p.id === id);
    if (!spec) throw new Error(`Okänd parameter: ${id}`);
    this.explore();
    this.overrides = { ...this.overrides, [id]: clampParam(spec, value) };
  }

  /** Återställ reglagen till filmens värden vid aktuell tid. */
  resetParams() {
    this.overrides = this.filmParams();
  }

  filmParams(): Params {
    return evaluateParams(this.def, this.time);
  }

  params(): Params {
    return this.currentMode === 'film' ? this.filmParams() : { ...this.overrides };
  }

  /** Anropas varje bildruta. När filmen tar slut går spelaren över i utforskaläge. */
  tick() {
    if (this.playing && this.clock() - this.startClock >= this.def.duration) {
      this.pausedAt = this.def.duration;
      this.playing = false;
      this.explore();
    }
  }
}
