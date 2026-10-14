import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllExperiments } from '../../research/synthobs-independent-research-convergence-fhg/src/experiments.mjs';
import { IRC_MARGIN_GATE } from '../../research/synthobs-independent-research-convergence-fhg/src/constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const REPORT = path.join(
  ROOT,
  'research/synthobs-independent-research-convergence-fhg/data/empirical_report.json',
);

describe('synthobs-independent-research-convergence-fhg', () => {
  it('runAllExperiments passes all four gates in-process', () => {
    const r = runAllExperiments();
    expect(r.n_total).toBe(4);
    expect(r.all_pass).toBe(true);
    expect(r.integrated_panel_run).toBe(true);
    const e2 = r.experiments.find((e) => e.id === 'E2_integrated_fhg_panel');
    expect(e2.pass).toBe(true);
    expect(e2.panel.meanMargin).toBeGreaterThanOrEqual(IRC_MARGIN_GATE);
  });

  it('committed empirical_report.json matches suite schema and all_pass', () => {
    expect(fs.existsSync(REPORT)).toBe(true);
    const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    expect(report.suite).toBe('synthobs-independent-research-convergence-fhg');
    expect(report.results.all_pass).toBe(true);
    expect(report.results.convergenceLayer.meanIrcMargin).toBeGreaterThanOrEqual(IRC_MARGIN_GATE);
  });
});
