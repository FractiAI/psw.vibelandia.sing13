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

  it('holds the six-property spirit profile with necessary mechanisms', () => {
    expect(report.spiritProfile).toHaveLength(6);
    for (const row of report.spiritProfile) {
      expect(row.headHolds, row.id).toBe(true);
      expect(row.baselinesFail, row.id).toBe(true);
      expect(row.ablationDrop, row.id).toBeGreaterThanOrEqual(0.05);
    }
    expect(report.verdict.spiritCorrespondence).toBe(true);
  });

  it('needs redundancy plus repair across octave depth', () => {
    const s = report.octaveInvariance.survival;
    expect(s.C_five_repair[1024]).toBeGreaterThanOrEqual(0.85);
    expect(s.C_five_no_repair[1024]).toBeLessThanOrEqual(0.1);
    expect(s.C_single_drift2[1024]).toBeLessThanOrEqual(0.1);
  });

  it('has a finite horizon per copy count and needs copies that grow with depth', () => {
    const sweep = report.octaveInvariance.sweep;
    for (let i = 1; i < sweep.length; i += 1) {
      expect(sweep[i].horizonOctaves).toBeGreaterThan(sweep[i - 1].horizonOctaves);
      expect(Number.isFinite(sweep[i].horizonOctaves)).toBe(true);
    }
    const need = report.octaveInvariance.copiesForDepth;
    expect(need.at(-1).copiesNeeded).toBeGreaterThan(need[0].copiesNeeded);
  });

  it('reports the 50% shell-loss limit instead of hiding it', () => {
    expect(report.substrateLoss.results[0.5].nine).toBeLessThan(0.95);
    expect(report.substrateLoss.results[0.3].nine).toBeGreaterThanOrEqual(0.95);
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
