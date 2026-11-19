import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runExpedition } from '../../research/synthobs-wmap-residual-lag11-validation/src/experiments.mjs';
import {
  DOC_ID,
  ENGINE_SHELF_PINNED,
  FOCUS_LAGS,
} from '../../research/synthobs-wmap-residual-lag11-validation/src/constants.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const suite = join(root, 'research/synthobs-wmap-residual-lag11-validation');

describe('WMAP residual lag 11 / 14 unknown-physics validation', () => {
  it('constants lock Soft Story application companion (not ENGINE_SHELF)', () => {
    expect(DOC_ID).toContain('WMAP-RESIDUAL-LAG11-VALIDATION');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(FOCUS_LAGS).toEqual([11, 14]);
  });

  it('runExpedition: lag 11/14 candidate_novel_physics, nearAcousticSpacing false, known controls', () => {
    const report = runExpedition();
    expect(report.mathProofs.ok).toBe(true);
    expect(report.experiments.e1.bothCandidateNovel).toBe(true);
    expect(report.experiments.e1.lag11.corr).toBeGreaterThan(0.4);
    expect(report.experiments.e1.lag14.corr).toBeGreaterThan(0.4);
    expect(report.experiments.e1.lag11.pResidualShuffle).toBeLessThan(0.05);
    expect(report.experiments.e1.lag14.pResidualShuffle).toBeLessThan(0.05);
    expect(report.experiments.e2.bothFarFromAcoustic).toBe(true);
    expect(report.experiments.e3.controlsExist).toBe(true);
    expect(report.verdict.unknownPhysicsCandidateConfirmed).toBe(true);
    expect(report.verdict.newWiringDiscovery).toBe(true);
    expect(report.experiments.e5.passes).toBe(true);
  });

  it('pipeline writes empirical_report.json with locked metrics', () => {
    execFileSync(process.execPath, [join(suite, 'scripts/run_empirical_pipeline.mjs')], {
      cwd: root,
      stdio: 'pipe',
    });
    const report = JSON.parse(readFileSync(join(suite, 'data/empirical_report.json'), 'utf8'));
    expect(report.documentId).toBe(DOC_ID);
    expect(report.experiments.e1.lag11.verdict).toBe('candidate_novel_physics');
    expect(report.experiments.e1.lag14.verdict).toBe('candidate_novel_physics');
    expect(report.experiments.e1.lag11.nearAcousticSpacing).toBe(false);
    expect(report.experiments.e1.lag14.nearAcousticSpacing).toBe(false);
    expect(report.mathProofs.ok).toBe(true);
  });
});
