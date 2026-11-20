import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_ID,
  ENGINE_SHELF_PINNED,
  TITLE,
} from '../../research/synthobs-diverse-redundancy-inbreeding-expedition/src/constants.mjs';
import {
  runFullExpedition,
  survivalClone,
  survivalDiverse,
} from '../../research/synthobs-diverse-redundancy-inbreeding-expedition/src/experiments.mjs';

describe('Diverse redundancy · inbreeding expedition', () => {
  const report = runFullExpedition();

  it('stays a Rhyming Expedition Soft Story with pin deferred', () => {
    expect(DOCUMENT_ID).toContain('DIVERSE-REDUNDANCY-INBREEDING');
    expect(TITLE.toLowerCase()).toContain('diverse');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(report.engineShelfPin).toBe('deferred');
    expect(report.rhymingExpeditionArm).toBe(true);
  });

  it('caps clone survival under common-cause β while diverse keeps depth', () => {
    const h = report.e1.headline;
    expect(h.clone5).toBeLessThan(0.5);
    expect(Math.abs(h.clone9 - h.clone5)).toBeLessThan(0.02);
    expect(h.diverse5).toBeGreaterThan(h.clone5 + 0.2);
    expect(report.e1.signal).toBe(true);
  });

  it('estimates positive Backblaze β̂ and plugs it into the depth table', () => {
    expect(report.e2.betaHat).toBeGreaterThan(0.03);
    expect(report.e2.signal).toBe(true);
    expect(report.e3.signal).toBe(true);
    const d6 = report.e3.table.find((r) => r.depth === 6);
    expect(d6.clone5).toBeLessThan(d6.diverse5);
    expect(Math.abs(d6.clone9 - d6.clone5)).toBeLessThan(0.02);
  });

  it('moves Soft Story biology boards in the buffering direction', () => {
    expect(report.e4.deltaEssential).toBeLessThan(0);
    expect(report.e4.signal).toBe(true);
    expect(report.e5.deltaLoeuf).toBeGreaterThan(0);
    expect(report.e5.signal).toBe(true);
  });

  it('fires a positive expedition signal on E1–E5', () => {
    expect(report.positiveExpeditionSignal).toBe(true);
    expect(report.signals).toEqual(['E1', 'E2', 'E3', 'E4', 'E5']);
  });

  it('is deterministic for the closed-form survival helpers', () => {
    expect(survivalClone(6, 5, 0.02, 0.2)).toBeCloseTo(0.2621, 3);
    expect(survivalDiverse(6, 5, 0.02, 0.2)).toBeCloseTo(0.9972, 3);
  });
});
