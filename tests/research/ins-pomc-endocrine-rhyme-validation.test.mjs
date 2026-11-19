/**
 * INS↔POMC endocrine rhyme validation — node:test + assert
 * (vitest optional; this file runs under `node --test` when rolldown bindings are missing)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.ok(DOC_ID.includes('INS-POMC-ENDOCRINE-RHYME-VALIDATION'));
    assert.equal(ENGINE_SHELF_PINNED, false);
  });

  it('math lemmas: cosine symmetry + z-score mean near zero', () => {
    const objects = loadExonFeatureObjects(['INS', 'POMC']);
    const { zObjects } = zScoreColumns(objects, [...EXON_FEATURE_KEYS]);
    const sym = proveCouplingSymmetry(zObjects[0].z, zObjects[1].z);
    assert.equal(sym.ok, true);
    const zm = proveZscoreMeanNearZero(objects, [...EXON_FEATURE_KEYS]);
    assert.equal(zm.ok, true);
  });

  it('runExpedition: STRING ≥ 0.9, NPY-SOD1 empty, math ok, gate winner INS↔POMC', () => {
    const report = runExpedition();
    assert.equal(report.mathProofs.ok, true);
    assert.ok(report.experiments.e3.focusStringScore >= STRING_SUPPORT_FLOOR);
    assert.equal(report.experiments.e3.negativeControlEmpty, true);
    assert.equal(report.experiments.e5.insPomcWins, true);
    assert.ok(report.experiments.e1.maxCoupling > 0);
    assert.equal(report.verdict.supportsMetabolicFollowUp, true);
  });

  it('pipeline writes empirical_report.json with locked metrics', () => {
    execFileSync(process.execPath, [join(suite, 'scripts/run_empirical_pipeline.mjs')], {
      cwd: root,
      stdio: 'pipe',
    });
    const report = JSON.parse(readFileSync(join(suite, 'data/empirical_report.json'), 'utf8'));
    assert.equal(report.documentId, DOC_ID);
    assert.ok(report.experiments.e3.focusStringScore >= 0.9);
    assert.equal(report.experiments.e3.negativeControlEmpty, true);
    assert.equal(report.mathProofs.ok, true);
    const neg = report.experiments.e3.comparisons.find((c) => c.pair === 'NPY↔SOD1');
    assert.equal(neg.empty, true);
  });
});
