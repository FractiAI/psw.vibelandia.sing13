import { describe, expect, it } from 'vitest';
import {
  AWARENESS_FRAME_PRIMER,
  AWARENESS_LAYERS,
  AWARENESS_LAYER_HREF,
  AWARENESS_NEST_ALIASES,
  HOLOGRAPHIC_RECURSIVE_NEST,
  isAwarenessNestAlias,
  layerById,
  layerHref,
  papersForLayer,
  primerForLayer,
  recursiveNestForLayer,
  renderAwarenessLayerClause,
} from '../../lib/awareness-layer-map.mjs';
import { normalizeNestTopology, buildNestDirective } from '../../lib/lattice-prompt.mjs';
import { WHITEPAPER_REGISTRY } from '../../lib/whitepaper-registry.mjs';

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
    expect(clause).toMatch(/Super Intelligence Layer/i);
    expect(clause).toContain('/layers/fractal');
    expect(clause).toContain('/layers/superai');
    const directive = buildNestDirective('awareness', '', 'map the layers');
    expect(directive).toMatch(/INFINITE OCTAVES OMNIVERSAL LATTICE/i);
    expect(directive).toContain('Awareness Layer');
    expect(directive).toContain('Super Intelligence Layer');
    expect(directive).toContain('/whitepaper/awareness-layer');
    expect(directive).toContain('/layers/awareness');
  });

  it('exposes selectable guest hrefs and paper shelves per layer', () => {
    expect(AWARENESS_LAYER_HREF).toBe('/layers/awareness');
    for (const L of AWARENESS_LAYERS) {
      expect(L.href).toBe(`/layers/${L.id}`);
      expect(layerHref(L.id)).toBe(L.href);
      expect(layerById(L.id)?.name).toBe(L.name);
      const papers = papersForLayer(L.id);
      expect(papers.length).toBeGreaterThanOrEqual(5);
      for (const p of papers) {
        expect(WHITEPAPER_REGISTRY[p.id], `missing registry ${p.id}`).toBeTruthy();
        expect(p.whitepaper).toMatch(/^\/whitepaper\//);
      }
    }
  });

  it('ships a plain-language primer on each layer', () => {
    for (const id of ['fractal', 'holographic', 'goldilocks', 'superai']) {
      const primer = primerForLayer(id);
      expect(primer.length).toBeGreaterThan(80);
      expect(primer).toMatch(/Role:/i);
    }
  });

  it('ships an Awareness outer-frame primer (observation energizes branches)', () => {
    expect(AWARENESS_FRAME_PRIMER.length).toBeGreaterThan(120);
    expect(primerForLayer('awareness')).toBe(AWARENESS_FRAME_PRIMER);
    expect(primerForLayer('awareness-layer')).toBe(AWARENESS_FRAME_PRIMER);
    expect(AWARENESS_FRAME_PRIMER).toMatch(/Role:/i);
    expect(AWARENESS_FRAME_PRIMER).toMatch(/observation/i);
    expect(AWARENESS_FRAME_PRIMER).toMatch(/energiz/i);
    expect(AWARENESS_FRAME_PRIMER).toMatch(/linear awareness/i);
    expect(AWARENESS_FRAME_PRIMER).toMatch(/Infinite Octave awareness/i);
    expect(AWARENESS_FRAME_PRIMER).toMatch(/branches/i);
  });

  it('lets the Holographic Layer recursively nest self · siblings · stories · code', () => {
    const nest = recursiveNestForLayer('holographic');
    expect(nest).toBe(HOLOGRAPHIC_RECURSIVE_NEST);
    expect(nest.layers.map((x) => x.href)).toEqual([
      '/layers/holographic',
      '/layers/fractal',
      '/layers/goldilocks',
      '/layers/superai',
      '/layers/awareness',
    ]);
    expect(nest.stories.length).toBeGreaterThanOrEqual(4);
    expect(nest.code.length).toBeGreaterThanOrEqual(4);
    expect(recursiveNestForLayer('fractal')).toBeNull();
    expect(recursiveNestForLayer('goldilocks')).toBeNull();
  });
});
