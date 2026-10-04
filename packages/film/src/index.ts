// Publikt API för @nastasteg/film – det hemsidan importerar.
export { mountPlayer, mountRenderTarget, detectQuality, supportsRealtime } from './player';
export type { PlayerOptions, PlayerHandle, Quality } from './player';
export { STEPS, CHAPTERS, DURATION } from './timeline';
export type { Step, StepId } from './timeline';
