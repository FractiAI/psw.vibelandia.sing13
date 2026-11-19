import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runExpedition } from '../../research/synthobs-ins-pomc-endocrine-rhyme-validation/src/experiments.mjs';
import {
  proveCouplingSymmetry,
  proveZscoreMeanNearZero,
  zScoreColumns,
} from '../../research/synthobs-ins-pomc-endocrine-rhyme-validation/src/math.mjs';
import { loadExonFeatureObjects } from '../../research/synthobs-ins-pomc-endocrine-rhyme-validation/src/load.mjs';
import {
  EXON_FEATURE_KEYS,
  DOC_ID,
  ENGINE_SHELF_PINNED,
  STRING_SUPPORT_FLOOR,
} from '../../research/synthobs-ins-pomc-endocrine-rhyme-validation/src/constants.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const suite = join(root, 'research/synthobs-ins-pomc-endocrine-rhyme-validation');

describe('INS↔POMC endocrine rhyme validation', () => {
  it('constants lock Soft Story application companion (not ENGINE_SHELF)', () => {
    expect(DOC_ID).toContain('INS-POMC-ENDOCRINE-RHYME-VALIDATION');
    expect(ENGINE_SHELF_PINNED).toBe(false);
  });

  it('math lemmas: cosine symmetry + z-score mean near zero', () => {
    const objects = loadExonFeatureObjects(['INS', 'POMC']);
    const { zObjects } = zScoreColumns(objects, [...EXON_FEATURE_KEYS]);
    const sym = proveCouplingSymmetry(zObjects[0].z, zObjects[1].z);
    expect(sym.ok).toBe(true);
    const zm = proveZscoreMeanNearZero(objects, [...EXON_FEATURE_KEYS]);
    expect(zm.ok).toBe(true);
  });

  it('runExpedition: STRING ≥ 0.9, NPY-SOD1 empty, math ok, gate winner INS↔POMC', () => {
    const report = runExpedition();
    expect(report.mathProofs.ok).toBe(true);
    expect(report.experiments.e3.focusStringScore).toBeGreaterThanOrEqual(STRING_SUPPORT_FLOOR);
    expect(report.experiments.e3.negativeControlEmpty).toBe(true);
    expect(report.experiments.e5.insPomcWins).toBe(true);
    expect(report.experiments.e1.maxCoupling).toBeGreaterThan(0);
    expect(report.verdict.supportsMetabolicFollowUp).toBe(true);
  });

  it('pipeline writes empirical_report.json with locked metrics', () => {
    execFileSync(process.execPath, [join(suite, 'scripts/run_empirical_pipeline.mjs')], {
      cwd: root,
      stdio: 'pipe',
    });
    const report = JSON.parse(readFileSync(join(suite, 'data/empirical_report.json'), 'utf8'));
    expect(report.documentId).toBe(DOC_ID);
    expect(report.experiments.e3.focusStringScore).toBeGreaterThanOrEqual(0.9);
    expect(report.experiments.e3.negativeControlEmpty).toBe(true);
    expect(report.mathProofs.ok).toBe(true);
    const neg = report.experiments.e3.comparisons.find((c) => c.pair === 'NPY↔SOD1');
    expect(neg.empty).toBe(true);
  });
});
