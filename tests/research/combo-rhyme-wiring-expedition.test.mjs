import { describe, it, expect } from 'vitest';
import { runExpedition } from '../../research/synthobs-combo-rhyme-wiring-expedition/src/experiments.mjs';
import { DOC_ID, ENGINE_SHELF_PINNED } from '../../research/synthobs-combo-rhyme-wiring-expedition/src/constants.mjs';

describe('Combo rhyme wiring expedition', () => {
  it('locks Soft Story application companion (not ENGINE_SHELF)', () => {
    expect(DOC_ID).toContain('COMBO-RHYME-WIRING');
    expect(ENGINE_SHELF_PINNED).toBe(false);
  });

  it('surfaces new STRING-empty candidates and passes combo gate', () => {
    const report = runExpedition();
    expect(report.experiments.e1.passes).toBe(true);
    expect(report.experiments.e3.passes).toBe(true);
    expect(report.experiments.e4.nNewEmpty).toBeGreaterThanOrEqual(1);
    expect(report.verdict.comboWiringExpeditionPass).toBe(true);
    const labels = report.verdict.newWiringCandidates.map((c) => c.label);
    expect(labels).toContain('NPY↔PDX1');
    expect(labels).toContain('APP↔TMPRSS2');
  });
});
