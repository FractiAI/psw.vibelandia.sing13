import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'interfaces', 'scripts');
const CORE_SRC = readFileSync(join(SCRIPTS, 'turner-rangeland-map-core.js'), 'utf8');
const MAP_SRC = readFileSync(join(SCRIPTS, 'turner-rangeland-map.js'), 'utf8');

// Browser scripts are classic (non-module) files sharing globals via load order.
vm.runInThisContext(CORE_SRC, { filename: 'turner-rangeland-map-core.js' });
const core = globalThis.TurnerRangelandMapCore;

describe('TurnerRangelandMapCore geometry', () => {
  const square = [[0, 0], [10, 0], [10, 10], [0, 10]];

  it('pointInPoly classifies inside/outside', () => {
    expect(core.pointInPoly(5, 5, square)).toBe(true);
    expect(core.pointInPoly(15, 5, square)).toBe(false);
    expect(core.pointInPoly(-1, -1, square)).toBe(false);
  });

  it('polygonBounds returns min/max corners', () => {
    expect(core.polygonBounds(square)).toEqual({ minX: 0, maxX: 10, minY: 0, maxY: 10 });
  });

  it('closestPointOnSegment clamps to endpoints outside the segment', () => {
    expect(core.closestPointOnSegment(0, 0, 10, 0, 5, 3)).toEqual({ lng: 5, lat: 0, t: 0.5 });
    expect(core.closestPointOnSegment(0, 0, 10, 0, -5, 0).t).toBe(0);
    expect(core.closestPointOnSegment(0, 0, 10, 0, 20, 0).t).toBe(1);
  });

  it('distSqLngLat shrinks with cos(latitude) scaling', () => {
    const equator = core.distSqLngLat(0, 0, 1, 0);
    const at60 = core.distSqLngLat(0, 60, 1, 60);
    expect(at60).toBeLessThan(equator);
    expect(at60).toBeCloseTo(equator * 0.25, 10);
  });
});

describe('TurnerRangelandMapCore sampling + herd math', () => {
  it('mulberry32 is deterministic per seed', () => {
    const a = core.mulberry32(42);
    const b = core.mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    expect(core.mulberry32(43)()).not.toBe(seqA[0]);
  });

  it('sampleBilinearField interpolates the weight grid', () => {
    const bounds = { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    const weights = [0, 1, 1, 0]; // gridSize 2: [0,1] top row, [1,0] bottom row
    expect(core.sampleBilinearField(0.25, 0.25, bounds, 2, weights)).toBe(0);
    expect(core.sampleBilinearField(0.75, 0.25, bounds, 2, weights)).toBe(1);
    expect(core.sampleBilinearField(0.5, 0.5, bounds, 2, weights)).toBe(0.5);
  });

  it('buildPastureTrampleIndex groups line features per pasture', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { properties: { pastureId: 'p1' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
        { properties: { pasture_id: 'p1' }, geometry: { type: 'MultiLineString', coordinates: [[[2, 2], [3, 3]], [[4, 4], [5, 5]]] } },
        { properties: {}, geometry: { type: 'LineString', coordinates: [[9, 9], [8, 8]] } },
        { properties: { pastureId: 'p2' }, geometry: null },
      ],
    };
    const idx = core.buildPastureTrampleIndex(fc);
    expect(Object.keys(idx).sort()).toEqual(['p1']);
    expect(idx.p1.length).toBe(3);
    expect(core.buildPastureTrampleIndex({ type: 'nope' })).toEqual({});
  });

  it('estimateBisonWeightLbs is deterministic and honors sex class + synth gating', () => {
    const opts = { placementSeed: 7, syntheticDataAllowed: true };
    const bison = { id: 'b-1', sex: core.SEX.male };
    expect(core.estimateBisonWeightLbs(bison, opts)).toBe(core.estimateBisonWeightLbs(bison, opts));
    // Non-synthetic fallbacks use fixed TESF multipliers (calf 0.41 × 1100 → 451).
    expect(core.estimateBisonWeightLbs({ id: 'c', sex: core.SEX.calf }, { syntheticDataAllowed: false })).toBe(451);
    expect(core.estimateBisonWeightLbs({ id: 'm', sex: core.SEX.male }, { syntheticDataAllowed: false })).toBe(1276);
    // Radar field scaling stays within the 0.93–1.07 band.
    const base = core.estimateBisonWeightLbs({ id: 'r', sex: core.SEX.female }, { syntheticDataAllowed: false });
    const boosted = core.estimateBisonWeightLbs({ id: 'r', sex: core.SEX.female }, { syntheticDataAllowed: false, radarField: 1 });
    expect(boosted).toBe(Math.max(200, Math.round(base * 1.07)));
  });

  it('hashSeed is a deterministic unsigned FNV-1a', () => {
    expect(core.hashSeed('abc')).toBe(core.hashSeed('abc'));
    expect(core.hashSeed('abc')).toBeLessThanOrEqual(0xffffffff);
    expect(core.hashSeed('abc')).not.toBe(core.hashSeed('abd'));
  });
});

describe('TurnerRangelandMapCore view tiers', () => {
  it('labelTier thresholds', () => {
    expect(core.labelTier(12)).toBe(3);
    expect(core.labelTier(11)).toBe(3);
    expect(core.labelTier(9)).toBe(2);
    expect(core.labelTier(7)).toBe(1);
    expect(core.labelTier(5)).toBe(0);
  });

  it('visualStride thins dots/trails at low zoom', () => {
    expect(core.visualStride(3)).toEqual({ dots: 4, trails: 10 });
    expect(core.visualStride(8)).toEqual({ dots: 1, trails: 2 });
    expect(core.visualStride(14)).toEqual({ dots: 1, trails: 1 });
  });
});

describe('browser load order contract', () => {
  it('map script binds against core global when loaded after it', () => {
    const ctx = vm.createContext({});
    vm.runInContext(CORE_SRC, ctx, { filename: 'core.js' });
    vm.runInContext(MAP_SRC, ctx, { filename: 'map.js' });
    expect(typeof ctx.TurnerRangelandMapCore).toBe('object');
    expect(typeof ctx.TurnerRangelandMap).toBe('function');
  });

  it('map script fails loudly if core did not load first', () => {
    const ctx = vm.createContext({});
    expect(() => vm.runInContext(MAP_SRC, ctx, { filename: 'map.js' })).toThrow(/TurnerRangelandMapCore/);
  });
});
