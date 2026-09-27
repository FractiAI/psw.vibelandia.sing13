import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  phiNestGrammarOk,
  nestWeights,
  selfSimilarRatioError,
  constantNeutralGeometryOk,
  normalizedMixWeights,
  generalizedClosure,
} from '../../research/synthobs-egs-recursive-fidelity-test/src/nest-grammar.mjs';
import {
  PHI_EGS,
  SQRT2,
  PROTOCOL_VERSION,
  ANTI_BASELINE_BIAS,
} from '../../research/synthobs-egs-recursive-fidelity-test/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-egs-recursive-fidelity-test/src/experiments.mjs';

describe('ERFT V5 constant-neutral + grammar recursive fidelity', () => {
  it('uses V5 protocol id with C/G layers', () => {
    expect(PROTOCOL_VERSION).toMatch(/^ERFT-V5-/);
    expect(ANTI_BASELINE_BIAS.version).toBe(5);
    expect(ANTI_BASELINE_BIAS.layers).toEqual(expect.arrayContaining(['ERFT-C', 'ERFT-G']));
  });

  it('Φ algebra closes; mix normalizes every arm; geometry is constant-neutral', () => {
    expect(phiNestGrammarOk()).toBe(true);
    expect(selfSimilarRatioError(PHI_EGS)).toBeLessThan(1e-10);
    const w = nestWeights(PHI_EGS);
    expect(w.wMajor + w.wMinor).toBeCloseTo(1, 12);
    const d = nestWeights(SQRT2);
    expect(Math.abs(d.partition_sum - 1)).toBeGreaterThan(0.05);
    const mixD = normalizedMixWeights(SQRT2);
    expect(mixD.wMajor + mixD.wMinor).toBeCloseTo(1, 12);
    expect(constantNeutralGeometryOk()).toBe(true);
  });

  it('generalized closure is defined for arbitrary c (not Φ-only)', () => {
    const xs = new Float64Array([1, 2, 3, 4]);
    const { wMajor, wMinor } = normalizedMixWeights(SQRT2);
    const out = generalizedClosure(xs, 1, 1.5, wMajor, wMinor);
    expect(Number.isFinite(out)).toBe(true);
    expect(out).not.toBe(1.5); // re-entry actually mixes
  });

  it('empirical suite passes; reports paired Δ (no Φ-crown gate)', async () => {
    const results = await runAllExperiments();
    expect(results.n_pass).toBe(results.n_total);
    expect(results.all_pass).toBe(true);
    expect(results.PROTOCOL_VERSION).toMatch(/^ERFT-V5-/);
    expect(results.layers).toEqual(expect.arrayContaining(['ERFT-C', 'ERFT-G']));
    expect(results.extensions).toEqual(expect.arrayContaining(['ERFT-D']));
    const e1 = results.experiments.find((e) => e.id === 'E1_five_arm_matched');
    expect(e1.mode).toBe('constant_neutral');
    expect(e1.scoreboard.paired_delta_baseline_minus_phi).toBeDefined();
    expect(e1.scoreboard.paired_delta_baseline_minus_phi.n).toBeGreaterThan(0);
    const e1g = results.experiments.find((e) => e.id === 'E1g_grammar_closure');
    expect(e1g.mode).toBe('grammar');
    const e3 = results.experiments.find((e) => e.id === 'E3_constant_sweep');
    expect(e3.train_min).toBeDefined();
    const e3b = results.experiments.find((e) => e.id === 'E3b_depth_optima');
    expect(e3b.optima.length).toBeGreaterThanOrEqual(4);
    const ed = results.experiments.find((e) => e.id === 'ED_dynamic_constant_regulation');
    expect(ed).toBeDefined();
    expect(ed.preserves_v5).toBe(true);
    expect(ed.falsification).toBeDefined();
  });

  it('committed empirical report matches live V5 pipeline', async () => {
    const reportPath = path.join(
      process.cwd(),
      'research/synthobs-egs-recursive-fidelity-test/data/empirical_report.json',
    );
    const onDisk = JSON.parse(readFileSync(reportPath, 'utf8'));
    expect(onDisk.protocol).toMatch(/^ERFT-V5-/);
    const live = await runAllExperiments();
    expect(onDisk.results.n_pass).toBe(live.n_pass);
    expect(onDisk.results.PROTOCOL_VERSION).toBe(live.PROTOCOL_VERSION);
  });
});
