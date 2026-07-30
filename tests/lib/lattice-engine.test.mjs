import { describe, it, expect } from 'vitest';
import { estimateTokens, buildLatticeExecution } from '../../lib/lattice-engine.mjs';

describe('estimateTokens', () => {
  it('returns 1 for empty string', () => {
    expect(estimateTokens('')).toBe(1);
  });

  it('returns 1 for whitespace-only', () => {
    expect(estimateTokens('   ')).toBe(1);
  });

  it('estimates chars/4 for text', () => {
    expect(estimateTokens('hello world')).toBe(3); // 11 chars / 4 = 2.75 → ceil 3
  });

  it('returns 1 for very short text', () => {
    expect(estimateTokens('hi')).toBe(1); // 2 chars / 4 = 0.5 → ceil to 1, max(1,1) = 1
  });

  it('handles null/undefined gracefully', () => {
    expect(estimateTokens(null)).toBe(1);
    expect(estimateTokens(undefined)).toBe(1);
  });

  it('scales with longer text', () => {
    const long = 'a'.repeat(4000);
    expect(estimateTokens(long)).toBe(1000);
  });
});

describe('buildLatticeExecution', () => {
  it('returns engine metadata', () => {
    const result = buildLatticeExecution({ message: 'hello', mode: 'cloud' });
    expect(result.engine).toContain('Lattice Chat V1.618');
    expect(result.mode).toBe('cloud');
    expect(result.cycle).toBe('Metabolize → Crystallize → Animate → Squeeze (MCA)');
  });

  it('accepts edge mode', () => {
    const result = buildLatticeExecution({ message: 'test', mode: 'edge' });
    expect(result.mode).toBe('edge');
  });

  it('includes selfTalk phases', () => {
    const result = buildLatticeExecution({ message: 'test architecture doc protocol', mode: 'cloud' });
    expect(Array.isArray(result.selfTalk)).toBe(true);
    expect(result.selfTalk.length).toBeGreaterThanOrEqual(5);
    // Check that each phase has expected fields
    for (const entry of result.selfTalk) {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('phase');
      expect(entry).toHaveProperty('voice');
      expect(entry).toHaveProperty('detail');
    }
    const phases = result.selfTalk.map((s) => s.id);
    expect(phases).toContain('metabolize');
    expect(phases).toContain('crystallize');
    expect(phases).toContain('rag');
    expect(phases).toContain('animate');
    expect(phases).toContain('tokens');
    expect(phases).toContain('squeeze');
  });

  it('includes agents array', () => {
    const result = buildLatticeExecution({ message: 'test', mode: 'cloud' });
    expect(Array.isArray(result.agents)).toBe(true);
    expect(result.agents.length).toBeGreaterThanOrEqual(1);
    // Φ-Parent always present
    const parent = result.agents.find((a) => a.id === 'phi-parent');
    expect(parent).toBeDefined();
    expect(parent.role).toContain('Meta-optimizer');
  });

  it('includes token savings', () => {
    const result = buildLatticeExecution({ message: 'test architecture', mode: 'cloud' });
    expect(result.tokens).toHaveProperty('naiveTokens');
    expect(result.tokens).toHaveProperty('latticeTokens');
    expect(result.tokens.naiveTokens).toBeGreaterThan(0);
  });

  it('includes organization rules', () => {
    const result = buildLatticeExecution({ message: 'test', mode: 'cloud' });
    expect(Array.isArray(result.organization)).toBe(true);
    expect(result.organization.length).toBeGreaterThanOrEqual(5);
  });

  it('has closedAt timestamp', () => {
    const before = new Date().toISOString();
    const result = buildLatticeExecution({ message: 'test', mode: 'cloud' });
    expect(result.closedAt).toBeDefined();
    expect(result.closedAt >= before).toBe(true);
  });

  it('trivial messages get fewer agents', () => {
    const substantial = buildLatticeExecution({ message: 'test architecture doc protocol research', mode: 'cloud' });
    const trivial = buildLatticeExecution({ message: 'hi', mode: 'cloud' });
    // Substantial messages should have more agents due to intent classification
    expect(substantial.agents.length).toBeGreaterThanOrEqual(trivial.agents.length);
  });

  it('handles empty message', () => {
    const result = buildLatticeExecution({ message: '', mode: 'cloud' });
    expect(result.engine).toBeDefined();
    expect(result.agents.length).toBeGreaterThanOrEqual(1);
  });

  it('handles null/undefined message gracefully', () => {
    const result = buildLatticeExecution({ message: null, mode: 'cloud' });
    expect(result.engine).toBeDefined();
    expect(result.agents.length).toBeGreaterThanOrEqual(1);
    expect(result.selfTalk.length).toBeGreaterThanOrEqual(5);
  });
});
