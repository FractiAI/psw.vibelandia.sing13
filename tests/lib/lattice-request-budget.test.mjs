import { describe, expect, it } from 'vitest';
import {
  estimateJsonBytes,
  formatWireSize,
  LATTICE_ATTACH_MAX_BYTES,
  LATTICE_WIRE_BUDGET_BYTES,
  trimHistoryForWireBudget,
} from '../../lib/lattice-request-budget.mjs';

describe('lattice-request-budget', () => {
  it('keeps per-file attach cap under Vercel wire budget', () => {
    expect(LATTICE_ATTACH_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(LATTICE_WIRE_BUDGET_BYTES).toBeLessThan(4.5 * 1024 * 1024);
  });

  it('trims oldest history turns when body is oversized', () => {
    const history = [
      { role: 'user', content: 'old turn' },
      { role: 'assistant', content: 'middle turn' },
      { role: 'user', content: 'latest' },
    ];
    const full = trimHistoryForWireBudget(history, { message: 'hi', provider: 'claude' });
    expect(full).toHaveLength(3);
    const tight = trimHistoryForWireBudget(
      history,
      { message: 'x'.repeat(3_500_000), provider: 'claude' },
      LATTICE_WIRE_BUDGET_BYTES,
    );
    expect(tight.length).toBeLessThanOrEqual(full.length);
  });

  it('formats wire sizes for guest copy', () => {
    expect(formatWireSize(512)).toBe('512 B');
    expect(formatWireSize(2048)).toContain('KB');
    expect(formatWireSize(3 * 1024 * 1024)).toContain('MB');
  });

  it('estimates JSON byte length', () => {
    expect(estimateJsonBytes({ a: 1 })).toBeGreaterThan(4);
  });
});
