import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  phiNestGrammarOk,
  nestWeights,
  selfSimilarRatioError,
} from '../../research/synthobs-egs-recursive-fidelity-test/src/nest-grammar.mjs';
import { PHI_EGS, SQRT2, PROTOCOL_VERSION } from '../../research/synthobs-egs-recursive-fidelity-test/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-egs-recursive-fidelity-test/src/experiments.mjs';

describe('ERFT V4 engine-grammar recursive fidelity', () => {
  it('uses V4 protocol id', () => {
    expect(PROTOCOL_VERSION).toMatch(/^ERFT-V4-/);
  });

  it('Φ partition satisfies self-similar nest closure; decoy two-level ≠ 1', () => {
    expect(phiNestGrammarOk()).toBe(true);
    expect(selfSimilarRatioError(PHI_EGS)).toBeLessThan(1e-10);
    const w = nestWeights(PHI_EGS);
    expect(w.phi_exact).toBe(true);
    expect(w.wMajor + w.wMinor).toBeCloseTo(1, 12);
    const d = nestWeights(SQRT2);
    expect(Math.abs(d.partition_sum - 1)).toBeGreaterThan(0.05);
  });

  it('empirical suite passes; Φ beats baseline on named four-arm mean (random excluded)', async () => {
    const results = await runAllExperiments();
    expect(results.n_pass).toBe(results.n_total);
    expect(results.all_pass).toBe(true);
    const e1 = results.experiments.find((e) => e.id === 'E1_five_arm_matched');
    const named = e1.scoreboard.named_mean_final_rfd_by_arm;
    const improvement = (named.baseline - named.egs) / named.baseline;
    expect(improvement).toBeGreaterThan(0.15);
    expect(named.egs).toBeLessThan(named.baseline);
  });

  it('committed empirical report matches live V4 pipeline', async () => {
    const reportPath = path.join(
      process.cwd(),
      'research/synthobs-egs-recursive-fidelity-test/data/empirical_report.json',
    );
    const onDisk = JSON.parse(readFileSync(reportPath, 'utf8'));
    expect(onDisk.protocol).toMatch(/^ERFT-V4-/);
    const live = await runAllExperiments();
    expect(onDisk.results.n_pass).toBe(live.n_pass);
    expect(onDisk.results.PROTOCOL_VERSION).toBe(live.PROTOCOL_VERSION);
  });
});
