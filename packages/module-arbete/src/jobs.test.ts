import { describe, expect, it } from 'vitest';
import { evaluateParams } from '@nastasteg/engine/module/params';
import { JOBS, week } from './jobs';
import { CHAPTERS, PARAMS, TRACKS } from './timeline';

const at = (t: number) => {
  const p = evaluateParams({ params: PARAMS, tracks: TRACKS }, t);
  const job = JOBS[Math.round(p.job)];
  return { job, w: week(job, p.ability) };
};

describe('AI och arbete', () => {
  it('varje jobb är en hel vecka', () => {
    for (const j of JOBS) expect(j.tasks.reduce((a, t) => a + t.share, 0)).toBeCloseTo(1, 6);
  });

  it('ingen AI tar inget, och AI tar aldrig ett helt jobb', () => {
    for (const j of JOBS) {
      expect(week(j, 0).aiTotal).toBe(0);
      expect(week(j, 1).aiTotal).toBeLessThan(0.75);
    }
  });

  it('textuppgifter påverkas först, händer och möten minst', () => {
    const w = week(JOBS[0], 0.5);
    expect(w.ai[0]).toBeGreaterThan(w.ai[2]); // vanliga frågor före arga kunder
    const nurse = week(JOBS[2], 0.9);
    expect(nurse.ai[0] / JOBS[2].tasks[0].share).toBeLessThan(0.1); // vård vid sängen
  });

  it('manuset: kundtjänst påverkas mer än snickaren, och mer med bättre AI', () => {
    const cs = at(30).w.aiTotal;
    expect(at(30).job.title).toBe('Kundtjänst');
    expect(at(53).job.title).toBe('Snickare');
    expect(at(53).w.aiTotal).toBeLessThan(cs);
    expect(at(66).w.aiTotal).toBeGreaterThan(cs);
    expect(at(30).w.check).toBeGreaterThan(0);
  });

  it('texterna är korta nog', () => {
    for (const c of CHAPTERS) expect(c.caption.length, c.id).toBeLessThanOrEqual(145);
  });
});
