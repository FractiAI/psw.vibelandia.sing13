import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_ID,
  ENGINE_SHELF_PINNED,
  TITLE,
} from '../../research/synthobs-cancer-rhyme-expedition/src/constants.mjs';
import { runFullExpedition } from '../../research/synthobs-cancer-rhyme-expedition/src/experiments.mjs';

describe('Cancer rhyme expedition', () => {
  const report = runFullExpedition();

  it('stays a Rhyming Expedition Soft Story with pin deferred', () => {
    expect(DOCUMENT_ID).toContain('CANCER-RHYME');
    expect(TITLE.toLowerCase()).toContain('cancer');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(report.engineShelfPin).toBe('deferred');
    expect(report.rhymingExpeditionArm).toBe(true);
  });

  it('separates prior results, hypotheses, and findings', () => {
    expect(report.previouslyDemonstrated.length).toBeGreaterThanOrEqual(2);
    expect(report.newHypotheses.length).toBeGreaterThanOrEqual(3);
    expect(report.newFindings.length).toBeGreaterThanOrEqual(1);
  });

  it('beats disease identity and relation bags with relational fingerprints', () => {
    expect(report.models.C_rhymeFp).toBeGreaterThan(report.models.A_disease + 0.2);
    expect(report.models.C_rhymeFp).toBeGreaterThan(report.models.B_relBag + 0.1);
    expect(report.signals).toEqual(
      expect.arrayContaining(['C_beats_A', 'C_beats_B', 'oracle_planted']),
    );
  });

  it('compresses disease taxonomy into fewer strong rhymes', () => {
    expect(report.compression.diseaseTaxonomyComplexity).toBeGreaterThanOrEqual(20);
    expect(report.compression.strongRhymeComplexity).toBeLessThanOrEqual(12);
    expect(report.compression.compressionDiseaseOverRhymes).toBeGreaterThanOrEqual(2);
    expect(report.signals).toEqual(expect.arrayContaining(['compression']));
  });

  it('transfers relational structure across cancer pairs', () => {
    expect(report.transfer.transferAccuracy).toBeGreaterThan(0.4);
    expect(report.transfer.diseaseIdentityBaseline).toBeLessThan(
      report.transfer.transferAccuracy,
    );
    expect(report.signals).toEqual(expect.arrayContaining(['transfer']));
  });

  it('separates local−shared divergence on malignant-like Soft Story phenotypes', () => {
    expect(report.localShared.signal).toBe(true);
    expect(report.localShared.meanDivergenceMalignantLike).toBeGreaterThan(
      report.localShared.meanDivergenceIndeterminate,
    );
  });

  it('rediscovers planted motifs and fires a positive Soft Story signal', () => {
    const planted = report.rhymeAtlas.filter((a) => a.tier === 'rediscovered_planted');
    expect(planted.length).toBeGreaterThanOrEqual(4);
    expect(report.positiveExpeditionSignal).toBe(true);
  });
});
