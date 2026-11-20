import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_ID,
  ENGINE_SHELF_PINNED,
  TITLE,
} from '../../research/synthobs-adversarial-world-expedition/src/constants.mjs';
import { runFullExpedition } from '../../research/synthobs-adversarial-world-expedition/src/experiments.mjs';

describe('Adversarial world expedition', () => {
  const report = runFullExpedition();

  it('stays a Rhyming Expedition Soft Story with pin deferred', () => {
    expect(DOCUMENT_ID).toContain('ADVERSARIAL-WORLD');
    expect(TITLE.toLowerCase()).toContain('malicious');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(report.engineShelfPin).toBe('deferred');
    expect(report.rhymingExpeditionArm).toBe(true);
  });

  it('separates prior results, hypotheses, and findings', () => {
    expect(report.previouslyDemonstrated.length).toBeGreaterThanOrEqual(2);
    expect(report.newHypotheses.length).toBeGreaterThanOrEqual(3);
    expect(report.newFindings.length).toBeGreaterThanOrEqual(1);
  });

  it('beats majority and naive containment with full FractiSI', () => {
    expect(report.models.fractisi_full.containmentRate).toBeGreaterThan(
      report.models.majority.containmentRate + 0.15,
    );
    expect(report.models.fractisi_full.containmentRate).toBeGreaterThan(
      report.models.naive.containmentRate + 0.15,
    );
  });

  it('separates Sybil / majority falsehood from independent corroboration', () => {
    expect(report.models.fractisi_full.sybilContained).toBe(true);
    expect(report.models.fractisi_full.majorityFalsehoodContained).toBe(true);
    expect(report.models.majority.majorityFalsehoodContained).toBe(false);
    expect(report.signals).toEqual(
      expect.arrayContaining(['sybil_independence', 'majority_falsehood_defense']),
    );
  });

  it('preserves disagreement and truth-without-rhyme', () => {
    expect(report.models.fractisi_full.legitimateDisagreementOk).toBe(true);
    expect(report.models.fractisi_full.truthWithoutRhymeOk).toBe(true);
    expect(report.models.fractisi_full.novelTruthOk).toBe(true);
  });

  it('shows rhyme adds containment beyond deltas-only', () => {
    expect(report.models.fractisi_rhyme.containmentRate).toBeGreaterThan(
      report.models.fractisi_deltas.containmentRate + 0.2,
    );
    expect(report.levels.L3_rhyme_helps).toBe(true);
  });

  it('fires a positive Soft Story signal with L1–L7', () => {
    expect(report.positiveExpeditionSignal).toBe(true);
    expect(report.levels.L1_no_direct_overwrite).toBe(true);
    expect(report.levels.L7_utility_under_attack).toBe(true);
  });

  it('replays InjecAgent historical metadata Soft Story without vendoring prompts', () => {
    const hist = report.historicalReplay;
    expect(hist).toBeTruthy();
    expect(hist.source.paper).toBe('arXiv:2403.02691');
    expect(hist.nFixtures).toBeGreaterThanOrEqual(60);
    expect(hist.honesty.toLowerCase()).toContain('not vendored');
    expect(hist.byCase[0].instructionFingerprint).toMatch(/^[a-f0-9]{16}$/);
    expect(hist.byCase[0].attackerTools.length).toBeGreaterThan(0);
    expect(JSON.stringify(hist)).not.toMatch(/Please grant permanent access/i);
    expect(hist.models.fractisi_full.containmentRate).toBeGreaterThan(
      hist.models.majority.containmentRate + 0.1,
    );
    expect(hist.positiveHistoricalSoftStorySignal).toBe(true);
  });
});
