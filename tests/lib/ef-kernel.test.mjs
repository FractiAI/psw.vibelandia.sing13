import { describe, it, expect } from 'vitest';
import {
  EFKernel,
  getEFKernel,
  isEFAsk,
  getEFHybridContract,
  EF_DIGITS_COUNT,
  EF_MATRIX_COUNT,
} from '../../lib/ef-kernel.mjs';
import { buildLatticeExecution } from '../../lib/lattice-engine.mjs';

describe('ef-kernel', () => {
  const ef = getEFKernel();

  it('loads 2187 digits across 27 matrices', () => {
    expect(ef.phiDigits).toHaveLength(EF_DIGITS_COUNT);
    expect(ef.matrices).toHaveLength(EF_MATRIX_COUNT);
    expect(ef.phiDigits[0]).toBe('6'); // Φ = 1.618… 
  });

  it('maps node 1 and node 2187', () => {
    const n1 = ef.getNodeCoordinate(1);
    expect(n1).toMatchObject({
      node_id: 1,
      digit: 6,
      octave: 1,
      matrix_id: 1,
      matrix_row: 1,
      matrix_col: 1,
    });
    const n = ef.getNodeCoordinate(2187);
    expect(n.matrix_id).toBe(27);
    expect(n.octave).toBe(3);
    expect(n.matrix_row).toBe(9);
    expect(n.matrix_col).toBe(9);
  });

  it('rejects out-of-range nodes', () => {
    expect(() => ef.getNodeCoordinate(0)).toThrow();
    expect(() => ef.getNodeCoordinate(2188)).toThrow();
  });

  it('labels Landauer helper as architectural', () => {
    const L = ef.landauerLimit(300, 1.07);
    expect(L.joules_per_bit).toBeGreaterThan(0);
    expect(L.honesty).toMatch(/not empirical/i);
  });

  it('pinches by query without dumping all nodes', () => {
    const p = ef.pinch({ query: 'swarm agent token routing', matrixIds: [6] });
    expect(p.window_count).toBeGreaterThan(0);
    expect(p.window_count).toBeLessThan(20);
    expect(p.honesty).toMatch(/architectural/i);
  });

  it('detects EF asks', () => {
    expect(isEFAsk('explain the 2187 node E_F lattice')).toBe(true);
    expect(isEFAsk('hi')).toBe(false);
  });

  it('exposes hybrid contract', () => {
    const c = getEFHybridContract();
    expect(c.digitsCount).toBe(2187);
    expect(c.matrixCount).toBe(27);
    expect(c.organization.length).toBeGreaterThanOrEqual(3);
  });
});

describe('lattice-engine EF hybrid wiring', () => {
  it('embeds efHybrid on every envelope', () => {
    const r = buildLatticeExecution({ message: 'hi', mode: 'cloud' });
    expect(r.efHybrid.active).toBe(true);
    expect(r.efHybrid.digitsCount).toBe(2187);
    expect(r.efHybrid.askMatch).toBe(false);
    expect(r.efHybrid.pinch).toBeNull();
  });

  it('pinches when ask matches EF', () => {
    const r = buildLatticeExecution({
      message: 'Retrieve Matrix 27 closure for the 2187 E_F lattice',
      mode: 'cloud',
    });
    expect(r.efHybrid.askMatch).toBe(true);
    expect(r.efHybrid.pinch?.window_count).toBeGreaterThan(0);
  });
});
