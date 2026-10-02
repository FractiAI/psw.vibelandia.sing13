import { describe, expect, it } from 'vitest';
import {
  DOC_ID,
  REGISTRY_ID,
  MIN_CANDIDATES,
  FORBIDDEN_CONFIRMATION_TOKENS,
} from '../../research/synthobs-beyond-crispr-biological-discovery/src/constants.mjs';
import { CANDIDATES } from '../../research/synthobs-beyond-crispr-biological-discovery/src/candidates.mjs';
import { runLiteratureScan } from '../../research/synthobs-beyond-crispr-biological-discovery/src/literature-scan.mjs';
import {
  buildResearchQueue,
  answerUltimateQuestions,
  researchInterest,
} from '../../research/synthobs-beyond-crispr-biological-discovery/src/scoring.mjs';
import { runAllExperiments } from '../../research/synthobs-beyond-crispr-biological-discovery/src/experiments.mjs';

describe('beyond-crispr biological discovery', () => {
  it('locks document and registry ids', () => {
    expect(DOC_ID).toContain('BEYOND-CRISPR');
    expect(REGISTRY_ID).toBe('synthobs-beyond-crispr-biological-discovery-2026-10');
  });

  it('scores at least eight candidates with complete axes', () => {
    expect(CANDIDATES.length).toBeGreaterThanOrEqual(MIN_CANDIDATES);
    for (const c of CANDIDATES) {
      expect(typeof researchInterest(c)).toBe('number');
      expect(c.antiBias.architectureAbsentCasesDocumented).toBe(true);
    }
  });

  it('keeps CRISPR as baseline and C4 as positive control, never gap discovery', () => {
    const queue = buildResearchQueue();
    expect(queue.declaredWinner).toBeNull();
    const c1 = queue.ranked.find((r) => r.id === 'C1');
    expect(c1?.role).toBe('baseline_known_adaptive_immunity');
    const c4 = queue.ranked.find((r) => r.id === 'C4');
    expect(c4?.role).toBe('positive_control_framework_validation');
    expect(c4?.literatureStatus).toBe('positive_control');
    expect(
      queue.ranked.some((r) => r.role === 'gap_discovery_candidate' && r.id === 'C1'),
    ).toBe(false);
    expect(
      queue.ranked.some((r) => r.role === 'gap_discovery_candidate' && r.id === 'C4'),
    ).toBe(false);
    expect(queue.gapDiscoveryIds.length).toBeGreaterThanOrEqual(1);
  });

  it('answers ultimate questions with a gap lead and novel prediction not in search criteria', () => {
    const answers = answerUltimateQuestions();
    expect(answers.frameworkValidation?.id).toBe('C4');
    expect(answers.mostSurprisingArchitecture.id).not.toBe('C4');
    expect(answers.mostSurprisingArchitecture.statement.length).toBeGreaterThan(40);
    expect(answers.novelTestablePrediction.yes).toBe(true);
    expect(answers.novelTestablePrediction.notInSearchCriteria).toBe(true);
  });

  it('scans curated literature without forbidden confirmation slogans', () => {
    const lit = runLiteratureScan();
    expect(lit.n).toBeGreaterThanOrEqual(8);
    const blob = JSON.stringify(CANDIDATES).toLowerCase();
    for (const t of FORBIDDEN_CONFIRMATION_TOKENS) {
      expect(blob.includes(t.toLowerCase())).toBe(false);
    }
  });

  it('passes the full experiment suite', () => {
    const report = runAllExperiments();
    expect(report.all_pass).toBe(true);
    expect(report.n_pass).toBe(report.n_total);
  });
});
