import { describe, expect, it } from 'vitest';
import { ModuleController } from './controller';
import { evaluateTrack, chapterIndexAt } from './params';
import type { ModuleDefinition } from './types';

const def: ModuleDefinition = {
  id: 'test',
  title: 'Test',
  duration: 10,
  params: [{ id: 'w', label: 'w', min: -2, max: 2, step: 0.05, default: 0 }],
  tracks: {
    w: [
      { t: 0, v: 0 },
      { t: 10, v: 1, ease: 'linear' },
    ],
  },
  chapters: [
    { id: 'a', start: 0, title: 'A', caption: '' },
    { id: 'b', start: 5, title: 'B', caption: '' },
  ],
  exploreCaption: '',
  createScene: () => ({ render() {}, resize() {}, dispose() {} }),
};

describe('evaluateTrack', () => {
  const keys = [
    { t: 0, v: 0 },
    { t: 2, v: 4, ease: 'linear' as const },
    { t: 4, v: 0, ease: 'hold' as const },
  ];
  it('interpolerar och håller', () => {
    expect(evaluateTrack(keys, -1, 9)).toBe(0);
    expect(evaluateTrack(keys, 1, 9)).toBe(2);
    expect(evaluateTrack(keys, 3, 9)).toBe(4);
    expect(evaluateTrack(keys, 5, 9)).toBe(0);
    expect(evaluateTrack(undefined, 5, 9)).toBe(9);
  });
  it('hittar kapitel', () => {
    expect(chapterIndexAt(def.chapters, 4.9)).toBe(0);
    expect(chapterIndexAt(def.chapters, 5)).toBe(1);
  });
});

describe('ModuleController', () => {
  const make = () => {
    let now = 100;
    const ctl = new ModuleController(def, () => now);
    return { ctl, advance: (s: number) => (now += s) };
  };

  it('spelar och pausar med injicerad klocka', () => {
    const { ctl, advance } = make();
    ctl.play();
    advance(4);
    expect(ctl.time).toBeCloseTo(4);
    expect(ctl.params().w).toBeCloseTo(0.4);
    ctl.pause();
    advance(3);
    expect(ctl.time).toBeCloseTo(4);
  });

  it('går över i utforskaläge när ett reglage rörs, med filmens värden som start', () => {
    const { ctl, advance } = make();
    ctl.play();
    advance(5);
    ctl.setParam('w', 1.234);
    expect(ctl.mode).toBe('explore');
    expect(ctl.isPlaying).toBe(false);
    expect(ctl.params().w).toBeCloseTo(1.25); // avrundat till steget 0,05
    ctl.setParam('w', 99);
    expect(ctl.params().w).toBe(2); // klampat
    ctl.resetParams();
    expect(ctl.params().w).toBeCloseTo(0.5);
  });

  it('växlar till utforska när filmen tar slut och börjar om vid play', () => {
    const { ctl, advance } = make();
    ctl.play();
    advance(11);
    ctl.tick();
    expect(ctl.mode).toBe('explore');
    expect(ctl.time).toBe(10);
    ctl.play();
    expect(ctl.mode).toBe('film');
    expect(ctl.time).toBe(0);
  });

  it('sökning lämnar utforskaläget', () => {
    const { ctl } = make();
    ctl.setParam('w', 1);
    ctl.seek(2);
    expect(ctl.mode).toBe('film');
    expect(ctl.time).toBe(2);
  });
});
