import { describe, expect, it } from 'vitest';
import { scoreSelfTest, POSSESS_THRESHOLD, QUADRANTS } from '../../lib/quadrant-self-test.mjs';

describe('4-quadrant voluntary self-test', () => {
  it('uses catalog threshold 12', () => {
    expect(POSSESS_THRESHOLD).toBe(12);
  });

  it('maps neither / meta-only / reflect-only / both', () => {
    const q1 = scoreSelfTest([2, 2, 2, 2], [2, 2, 2, 2]);
    const q2 = scoreSelfTest([2, 2, 2, 2], [4, 4, 4, 4]);
    const q3 = scoreSelfTest([4, 4, 4, 4], [2, 2, 2, 2]);
    const q4 = scoreSelfTest([5, 5, 5, 5], [5, 5, 5, 5]);
    expect(q1.ok && q1.quadrant.id).toBe('q1');
    expect(q2.ok && q2.quadrant.id).toBe('q2');
    expect(q3.ok && q3.quadrant.id).toBe('q3');
    expect(q4.ok && q4.quadrant.id).toBe('q4');
    expect(q1.quadrant.label).toBe('Linear NPC');
    expect(q2.quadrant.label).toBe('NPC');
    expect(q3.quadrant.label).toBe('Linear');
    expect(q4.quadrant.label).toBe('Holographic');
    expect(q1.axis1.nick).toMatch(/NPC/);
    expect(q1.axis2.nick).toMatch(/Linear/);
    expect(q4.axis1.nick).toMatch(/Observer/);
    expect(q4.axis2.nick).toMatch(/Holographic/);
    expect(q1.quadrant.vessel).toBe(QUADRANTS.q1.vessel);
    expect(q4.quadrant.vessel).toBe('Master Navigator');
  });

  it('rejects incomplete scores', () => {
    const r = scoreSelfTest([1, 2, 3], [1, 2, 3, 4]);
    expect(r.ok).toBe(false);
  });
});
