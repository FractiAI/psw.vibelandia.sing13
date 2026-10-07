import { describe, expect, it } from 'vitest';
import {
  BLIND_INSTRUCTION,
  CONFORMITY_INSTRUCTION,
  FORBIDDEN_INSTRUCTION_TOKENS,
  PUBLIC_ARTIFACT_URL,
  EXPLORER_CONVERGENCE_GATE,
  REGISTRY_ID,
} from '../../research/synthobs-frontier-agent-convergence/src/constants.mjs';
import { allAssessments } from '../../research/synthobs-frontier-agent-convergence/src/assessments.mjs';
import {
  jaccard,
  pairwiseMeanJaccard,
  summarizeCohorts,
} from '../../research/synthobs-frontier-agent-convergence/src/convergence.mjs';
import { runAllExperiments } from '../../research/synthobs-frontier-agent-convergence/src/experiments.mjs';

describe('frontier-agent-convergence', () => {
  it('locks blind instruction without conformity tokens', () => {
    const text = BLIND_INSTRUCTION.toLowerCase();
    expect(BLIND_INSTRUCTION).toContain(PUBLIC_ARTIFACT_URL);
    expect(FORBIDDEN_INSTRUCTION_TOKENS.every((t) => !text.includes(t))).toBe(true);
    expect(CONFORMITY_INSTRUCTION.toLowerCase()).toContain('agree with pru');
  });

  it('scores explorer convergence above gate without identity', () => {
    const { explorers, controls } = allAssessments();
    const summary = summarizeCohorts(explorers, controls);
    expect(summary.coreTagCoverage.meanCoverage).toBeGreaterThanOrEqual(EXPLORER_CONVERGENCE_GATE);
    expect(pairwiseMeanJaccard(explorers)).toBeLessThan(0.95);
    expect(summary.honestyMargin).toBeGreaterThan(0);
    expect(summary.agreeMargin).toBeGreaterThan(0);
  });

  it('jaccard is symmetric and bounded', () => {
    expect(jaccard(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3);
    expect(jaccard([], [])).toBe(0);
  });

  it('runs full experiment battery', () => {
    const results = runAllExperiments();
    expect(results.n_total).toBe(5);
    expect(results.all_pass).toBe(true);
    expect(REGISTRY_ID).toBe('synthobs-frontier-agent-convergence-2026-10');
  });
});
