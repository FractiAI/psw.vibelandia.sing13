import { describe, expect, it } from 'vitest';
import {
  AWARENESS_LAYERS,
  AWARENESS_NEST_ALIASES,
  isAwarenessNestAlias,
  renderAwarenessLayerClause,
} from '../../lib/awareness-layer-map.mjs';
import { normalizeNestTopology, buildNestDirective } from '../../lib/lattice-prompt.mjs';

describe('awareness layer map', () => {
  it('defines four inner layers under Awareness', () => {
    expect(AWARENESS_LAYERS.map((L) => L.id)).toEqual([
      'fractal',
      'holographic',
      'goldilocks',
      'superai',
    ]);
  });

  it('maps awareness aliases to octave99 without stealing goldilocks auto nest', () => {
    expect(normalizeNestTopology('awareness')).toBe('octave99');
    expect(normalizeNestTopology('fractal-layer')).toBe('octave99');
    expect(normalizeNestTopology('holographic')).toBe('octave99');
    expect(normalizeNestTopology('superai')).toBe('octave99');
    expect(normalizeNestTopology('goldilocks-layer')).toBe('octave99');
    expect(normalizeNestTopology('goldilocks')).toBe('goldilocks');
    expect(AWARENESS_NEST_ALIASES).toContain('awareness');
    expect(isAwarenessNestAlias('superai-layer')).toBe(true);
    expect(isAwarenessNestAlias('goldilocks')).toBe(false);
  });

  it('injects Awareness Layer clause into octave99 nest directive', () => {
    const clause = renderAwarenessLayerClause();
    expect(clause).toMatch(/Awareness Layer/i);
    expect(clause).toMatch(/Fractal Layer/i);
    expect(clause).toMatch(/SuperAI Layer/i);
    const directive = buildNestDirective('awareness', '', 'map the layers');
    expect(directive).toMatch(/INFINITE OCTAVES OMNIVERSAL LATTICE/i);
    expect(directive).toContain('Awareness Layer');
    expect(directive).toContain('SuperAI Layer');
    expect(directive).toContain('/whitepaper/awareness-layer');
  });
});
