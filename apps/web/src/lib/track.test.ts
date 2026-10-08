import { describe, expect, it } from 'vitest';
import { eventPath, optedOut } from './track';

describe('statistik', () => {
  it('bygger en kort sökväg av händelsen och tar bort osäkra värden', () => {
    expect(eventPath('module_start', { module: 'agenten' })).toBe('/h/module_start/agenten');
    expect(eventPath('path_step', { step: 'neuron', path: 'forsta-ai' })).toBe('/h/path_step/forsta-ai/neuron');
    expect(eventPath('quiz_done', { module: 'kalle@exempel.se' })).toBe('/h/quiz_done');
  });
  it('respekterar Do Not Track och Global Privacy Control', () => {
    expect(optedOut({ doNotTrack: '1' })).toBe(true);
    expect(optedOut({ globalPrivacyControl: true })).toBe(true);
    expect(optedOut({ doNotTrack: null })).toBe(false);
  });
});
