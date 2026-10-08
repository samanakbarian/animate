import { describe, expect, it } from 'vitest';
import { canonicalPath } from './site';

describe('canonicalPath', () => {
  it('tar bort .html och index.html', () => {
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('/moduler/agenten.html')).toBe('/moduler/agenten');
    expect(canonicalPath('/moduler.html')).toBe('/moduler');
    expect(canonicalPath('/spel/')).toBe('/spel');
  });
});
