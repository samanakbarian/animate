import { describe, expect, it } from 'vitest';
import { MODEL, generate, nextDistribution, tokenize } from './model';

describe('tokenisering', () => {
  it('delar i ord och skiljetecken', () => {
    expect(tokenize('Regnet faller, tyst.')).toEqual(['regnet', 'faller', ',', 'tyst', '.']);
  });
});

describe('nästa token', () => {
  it('ger en sannolikhetsfördelning som summerar till 1', () => {
    const d = nextDistribution(MODEL, ['regnet'], 1);
    expect(d.reduce((s, c) => s + c.p, 0)).toBeCloseTo(1, 9);
  });
  it('har lärt sig vanliga ordföljder', () => {
    // ”nästa steg” förekommer två gånger, ”nästa ord” en gång
    expect(nextDistribution(MODEL, ['nästa'], 1)[0].token).toBe('steg');
    expect(nextDistribution(MODEL, ['ett', 'ord'], 1)[0].token).toBe('i');
  });
  it('låg temperatur skärper, hög plattar ut', () => {
    const cold = nextDistribution(MODEL, ['maskinen'], 0.2)[0].p;
    const warm = nextDistribution(MODEL, ['maskinen'], 2)[0].p;
    expect(cold).toBeGreaterThan(warm * 1.5);
  });
});

describe('generering', () => {
  it('är deterministisk för samma frö', () => {
    const a = generate('regnet', 12, 0.8, 3, { ...MODEL });
    const b = generate('regnet', 12, 0.8, 3, { ...MODEL });
    expect(a.tokens).toEqual(b.tokens);
    expect(a.tokens).toHaveLength(13);
  });
  it('ger olika text för olika frön vid hög temperatur', () => {
    const a = generate('regnet', 12, 1.6, 1).tokens.join(' ');
    const b = generate('regnet', 12, 1.6, 2).tokens.join(' ');
    expect(a).not.toBe(b);
  });
});
