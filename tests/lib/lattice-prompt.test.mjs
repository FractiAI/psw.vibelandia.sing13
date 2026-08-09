import { describe, expect, it } from 'vitest';
import { normalizeNestTopology, buildNestDirective, assembleLatticePrompt } from '../../lib/lattice-prompt.mjs';

describe('lattice-prompt plain/direct mode', () => {
  it('normalizes direct-mode aliases to none', () => {
    expect(normalizeNestTopology('none')).toBe('none');
    expect(normalizeNestTopology('plain')).toBe('none');
    expect(normalizeNestTopology('direct')).toBe('none');
    expect(normalizeNestTopology(undefined)).toBe('goldilocks');
    expect(normalizeNestTopology('goldilocks')).toBe('goldilocks');
    expect(normalizeNestTopology('single')).toBe('single');
    expect(normalizeNestTopology('multi')).toBe('multi');
  });

  it('builds a direct nest directive with the nest off', () => {
    const directive = buildNestDirective('none', '', 'hello');
    expect(directive).toMatch(/Nest: OFF/i);
    expect(directive).toContain('No nesting');
  });

  it('assembleLatticePrompt with none omits the nested-agent preamble', () => {
    const system = assembleLatticePrompt({
      message: 'hello',
      nestTopology: 'none',
      mode: 'full',
    });
    expect(system).toMatch(/Nest: OFF/i);
    expect(system).not.toContain('Lattice Chat Agent V1.618 by FractiAI');
    expect(system).not.toContain('Lattice Chat V1.618 by FractiAI');
    expect(system).not.toContain('Context discipline');
    expect(system).toContain('hello');
  });
});
