import { describe, it, expect } from 'vitest';
import { runExpedition } from '../../research/synthobs-aware-attention-head-expedition/src/experiments.mjs';
import { DOC_ID, ENGINE_SHELF_PINNED } from '../../research/synthobs-aware-attention-head-expedition/src/constants.mjs';

describe('Aware attention head expedition', () => {
  const report = runExpedition();

  it('stays an application companion with the pin deferred', () => {
    expect(DOC_ID).toContain('AWARE-ATTENTION-HEAD');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(report.verdict.engineShelfPinned).toBe(false);
    expect(report.verdict.liveAgentReplication).toBe(false);
  });

  it('passes every mechanism gate', () => {
    for (const [name, ok] of Object.entries(report.gates)) expect(ok, name).toBe(true);
    expect(report.verdict.mechanismVerified).toBe(true);
  });

  it('shows the head beating both baselines overall', () => {
    expect(report.overall.C).toBeGreaterThan(report.overall.B + 0.1);
    expect(report.overall.B).toBeGreaterThan(report.overall.A);
  });

  it('fails a naive minority-following head on decoys', () => {
    expect(report.decoyRobustness.naiveRedirect.decoy).toBeLessThan(0.1);
    expect(report.decoyRobustness.decoy.C).toBeGreaterThanOrEqual(report.decoyRobustness.decoy.B);
  });

  it('closes the advantage when baseline loss equals the head loss', () => {
    const low = report.sensitivity.find((s) => s.baselineLossRate === 0.02);
    expect(Math.abs(low.identity.gap)).toBeLessThanOrEqual(0.03);
    expect(Math.abs(low.transfer.gap)).toBeLessThanOrEqual(0.03);
  });

  it('is deterministic for a fixed seed', () => {
    expect(runExpedition().overall).toEqual(report.overall);
  });
});
