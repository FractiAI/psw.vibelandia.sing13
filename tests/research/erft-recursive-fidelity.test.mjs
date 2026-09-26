import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  phiNestGrammarOk,
  nestWeights,
  selfSimilarRatioError,
} from '../../research/synthobs-egs-recursive-fidelity-test/src/nest-grammar.mjs';
import { PHI_EGS, PROTOCOL_VERSION } from '../../research/synthobs-egs-recursive-fidelity-test/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-egs-recursive-fidelity-test/src/experiments.mjs';

describe('ERFT V4 engine-grammar recursive fidelity', () => {
  it('uses V4 protocol id', () => {
    expect(PROTOCOL_VERSION).toMatch(/^ERFT-V4-/);
  });

  it('Φ partition satisfies self-similar nest closure', () => {
    expect(phiNestGrammarOk()).toBe(true);
    expect(selfSimilarRatioError(PHI_EGS)).toBeLessThan(1e-10);
    const w = nestWeights(PHI_EGS);
    expect(w.phi_exact).toBe(true);
    expect(w.wMajor + w.wMinor).toBeCloseTo(1, 12);
  });

  it('baseline arm is explicit dyadic 1:1 (not degenerate 1/c)', () => {
    const b = nestWeights(1.0);
    expect(b.dyadic).toBe(true);
    expect(b.wMajor).toBe(0.5);
    expect(b.wMinor).toBe(0.5);
  });

  it('empirical suite passes with nest + engine grammar', async () => {
    const results = await runAllExperiments();
    expect(results.n_pass).toBe(results.n_total);
    expect(results.all_pass).toBe(true);
    const e1 = results.experiments.find((e) => e.id === 'E1_five_arm_matched');
    const mean = e1.scoreboard.mean_final_rfd_by_arm;
    expect(mean.egs).toBeLessThan(mean.baseline);
    const improvement = (mean.baseline - mean.egs) / mean.baseline;
    expect(improvement).toBeGreaterThan(0.15);
    const e0d = results.experiments.find((e) => e.id === 'E0d_engine_grammar_lock');
    expect(e0d?.pass).toBe(true);
  });

  it('committed empirical report matches live V3 pipeline', async () => {
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
