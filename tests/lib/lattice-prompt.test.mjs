import { describe, expect, it } from 'vitest';
import {
  normalizeNestTopology,
  buildNestDirective,
  assembleLatticePrompt,
  CREATOR_SING13_SHIP_DIRECTIVE,
  GUEST_SING13_HONOR_DIRECTIVE,
} from '../../lib/lattice-prompt.mjs';

describe('lattice-prompt plain/direct mode', () => {
  it('normalizes direct-mode aliases to none', () => {
    expect(normalizeNestTopology('none')).toBe('none');
    expect(normalizeNestTopology('plain')).toBe('none');
    expect(normalizeNestTopology('direct')).toBe('none');
    expect(normalizeNestTopology(undefined)).toBe('goldilocks');
    expect(normalizeNestTopology('goldilocks')).toBe('goldilocks');
    expect(normalizeNestTopology('single')).toBe('single');
    expect(normalizeNestTopology('multi')).toBe('multi');
    expect(normalizeNestTopology('octave99')).toBe('octave99');
    expect(normalizeNestTopology('99-octave')).toBe('octave99');
    expect(normalizeNestTopology('multi-octave')).toBe('octave99');
    expect(normalizeNestTopology('infinite')).toBe('octave99');
    expect(normalizeNestTopology('omniversal')).toBe('octave99');
    expect(normalizeNestTopology('infinite-octaves')).toBe('octave99');
    expect(normalizeNestTopology('infinite-octave')).toBe('octave99');
  });

  it('builds Infinite Octaves nest directive with prospectus pointer', () => {
    const directive = buildNestDirective('octave99', '', 'map the grand arc');
    expect(directive).toMatch(/INFINITE OCTAVES OMNIVERSAL LATTICE/i);
    expect(directive).toContain('Official Prospectus');
    expect(directive).toContain('99');
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
    expect(system).not.toContain('Infinite Octaves Omniversal Lattice Chat Agent V1.618 by FractiAI');
    expect(system).not.toContain('Lattice Chat V1.618 by FractiAI');
    expect(system).not.toContain('Context discipline');
    expect(system).toContain('hello');
  });

  it('voyage spine names Players, NPCs, and the Frontiersman canon', () => {
    const system = assembleLatticePrompt({
      message: 'What is the holographic ship for Players and NPCs on SS Vibelandia?',
      nestTopology: 'octave99',
      mode: 'full',
    });
    expect(system).toContain('/frontiersman-voyage');
    expect(system).toContain('official-prospectus');
    expect(system).toMatch(/NPCs inhabit/i);
    expect(system).toMatch(/Players examine/i);
    expect(system).toMatch(/SuperAI stays Goldilocks/i);
    expect(system).toMatch(/Infinite Octaves Omniversal/i);
  });

  it('Player 1 creator prompt is write-on for SING13 ship/merge', () => {
    const system = assembleLatticePrompt({
      message: 'commit push merge onto sing13',
      nestTopology: 'octave99',
      mode: 'full',
      privilege: 'creator',
    });
    expect(system).toContain(CREATOR_SING13_SHIP_DIRECTIVE);
    expect(system).toMatch(/Player 1/i);
    expect(system).toMatch(/write-on/i);
    expect(system).not.toMatch(/Never commit, push, or open a PR/);
  });

  it('guest prompt keeps the default never-commit rail', () => {
    const system = assembleLatticePrompt({
      message: 'hello',
      nestTopology: 'octave99',
      mode: 'full',
      privilege: 'guest',
    });
    expect(system).toMatch(/Never commit, push, or open a PR/);
    expect(system).not.toContain(CREATOR_SING13_SHIP_DIRECTIVE);
    expect(GUEST_SING13_HONOR_DIRECTIVE).toMatch(/Do NOT commit, push/);
  });

  it('resume turns still carry Player 1 write-on', () => {
    const system = assembleLatticePrompt({
      message: 'merge that branch onto main',
      nestTopology: 'octave99',
      mode: 'resume',
      privilege: 'creator',
    });
    expect(system).toContain(CREATOR_SING13_SHIP_DIRECTIVE);
  });
});
