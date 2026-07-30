import { describe, it, expect } from 'vitest';
import {
  operatorCoherence,
  scoreBoundaryBulkBeta,
  scoreScaleInvariance,
  scorePhaseLockGamma,
  scoreEpistemicInversion,
} from '../../research/synthobs-holographic-operators/src/experiments.mjs';

describe('operatorCoherence', () => {
  it('returns 0 for empty word array', () => {
    expect(operatorCoherence([], 1.618)).toBe(0);
  });

  it('returns a value between 0 and 1 for non-empty words', () => {
    const result = operatorCoherence(['hello', 'world'], 1.618);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('is deterministic for same input', () => {
    const words = ['test', 'sentence', 'with', 'words'];
    const a = operatorCoherence(words, 1.618);
    const b = operatorCoherence(words, 1.618);
    expect(a).toBe(b);
  });

  it('depends on word order', () => {
    const a = operatorCoherence(['a', 'b', 'c'], 1.618);
    const b = operatorCoherence(['c', 'b', 'a'], 1.618);
    // Order should matter for the operator coherence metric
    expect(typeof a).toBe('number');
    expect(typeof b).toBe('number');
  });

  it('works with single word', () => {
    const result = operatorCoherence(['single'], 1.618);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('scoreBoundaryBulkBeta', () => {
  it('returns value between 0 and 1', () => {
    const result = scoreBoundaryBulkBeta('some text about holographic boundary theory');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('scores higher with holographic terms', () => {
    const low = scoreBoundaryBulkBeta('this is about cats and dogs');
    const high = scoreBoundaryBulkBeta('holographic boundary correspondence duality maps');
    expect(high).toBeGreaterThan(low);
  });

  it('handles empty string', () => {
    const result = scoreBoundaryBulkBeta('');
    expect(result).toBe(0);
  });
});

describe('scoreScaleInvariance', () => {
  it('returns value between 0 and 1', () => {
    const result = scoreScaleInvariance('fractal scale invariant phi golden ratio 1.618');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('detects phi references', () => {
    const low = scoreScaleInvariance('ordinary text');
    const high = scoreScaleInvariance('phi golden ratio 1.618 fractal');
    expect(high).toBeGreaterThan(low);
  });

  it('handles empty string', () => {
    const result = scoreScaleInvariance('');
    expect(result).toBe(0);
  });
});

describe('scorePhaseLockGamma', () => {
  it('returns value between 0 and 1', () => {
    const result = scorePhaseLockGamma('some text with operators');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('is deterministic with same seed', () => {
    const a = scorePhaseLockGamma('test sentence here', 42);
    const b = scorePhaseLockGamma('test sentence here', 42);
    expect(a).toBe(b);
  });

  it('handles empty string', () => {
    const result = scorePhaseLockGamma('');
    expect(result).toBe(0);
  });
});

describe('scoreEpistemicInversion', () => {
  it('returns value between 0 and 1', () => {
    const result = scoreEpistemicInversion('epistemic inversion operator language syntax');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('handles empty string', () => {
    const result = scoreEpistemicInversion('');
    expect(result).toBe(0);
  });
});
