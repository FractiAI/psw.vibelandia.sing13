import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runExpedition } from '../../research/synthobs-app-dnmt3a-rhyme-validation/src/experiments.mjs';
import {
  proveCouplingSymmetry,
  proveZscoreMeanNearZero,
  zScoreColumns,
} from '../../research/synthobs-app-dnmt3a-rhyme-validation/src/math.mjs';
import { loadExonFeatureObjects } from '../../research/synthobs-app-dnmt3a-rhyme-validation/src/load.mjs';
import {
  EXON_FEATURE_KEYS,
  DOC_ID,
  ENGINE_SHELF_PINNED,
  FOCUS_LABEL,
} from '../../research/synthobs-app-dnmt3a-rhyme-validation/src/constants.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const suite = join(root, 'research/synthobs-app-dnmt3a-rhyme-validation');

describe('APP↔DNMT3A unknown-biology rhyme validation', () => {
  it('constants lock Soft Story application companion (not ENGINE_SHELF)', () => {
    expect(DOC_ID).toContain('APP-DNMT3A-RHYME-VALIDATION');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(FOCUS_LABEL).toBe('APP↔DNMT3A');
  });

  it('math lemmas: cosine symmetry + z-score mean near zero', () => {
    const objects = loadExonFeatureObjects(['APP', 'DNMT3A']);
    const { zObjects } = zScoreColumns(objects, [...EXON_FEATURE_KEYS]);
    const sym = proveCouplingSymmetry(zObjects[0].z, zObjects[1].z);
    expect(sym.ok).toBe(true);
    const zm = proveZscoreMeanNearZero(objects, [...EXON_FEATURE_KEYS]);
    expect(zm.ok).toBe(true);
  });

  it('runExpedition: focus STRING empty, INS↔POMC 0.947, OT Alzheimer/AML, unknown gate pass', () => {
    const report = runExpedition();
    expect(report.mathProofs.ok).toBe(true);
    expect(report.experiments.e3.focusEmpty).toBe(true);
    expect(report.experiments.e3.positiveControlScore).toBe(0.947);
    expect(report.experiments.e4.focusA.top[0].score).toBeGreaterThan(0.8);
    expect(report.experiments.e4.focusB.top[0].score).toBeGreaterThan(0.8);
    expect(report.experiments.e1.maxCoupling).toBeGreaterThan(0);
    expect(report.experiments.e5.passes).toBe(true);
    expect(report.verdict.supportsUnknownFollowUp).toBe(true);
    expect(report.verdict.newWiringDiscovery).toBe(true);
    expect(report.experiments.e6.passes).toBe(true);
    expect(report.experiments.e6.discovery).toBe('new_wiring_from_existing_wet_labs');
  });

  it('pipeline writes empirical_report.json with locked metrics', () => {
    execFileSync(process.execPath, [join(suite, 'scripts/run_empirical_pipeline.mjs')], {
      cwd: root,
      stdio: 'pipe',
    });
    const report = JSON.parse(readFileSync(join(suite, 'data/empirical_report.json'), 'utf8'));
    expect(report.documentId).toBe(DOC_ID);
    expect(report.experiments.e3.focusEmpty).toBe(true);
    expect(report.experiments.e3.positiveControlScore).toBe(0.947);
    expect(report.mathProofs.ok).toBe(true);
  });
});
