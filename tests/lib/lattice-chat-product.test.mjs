import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('Lattice Chat · Infinite Octaves product label', () => {
  it('shows Infinite Octaves as the default nest, not 99 Octave', () => {
    const composer = read('apps/lattice-chat/src/components/ComposerOptions.tsx');
    expect(composer).toContain("label: 'Infinite Octaves'");
    expect(composer).not.toContain("label: '99 Octave'");

    const repos = read('apps/lattice-chat/src/repositories.ts');
    expect(repos).toContain('Infinite Octaves home nest');
    expect(repos).not.toContain('99 Octave home nest');

    const api = read('api/lattice-chat.js');
    expect(api).toContain('Infinite Octaves Omniversal Lattice');
    expect(api).not.toContain('SING13 99 Octave Omni-Lattice Bridge');
  });
});
