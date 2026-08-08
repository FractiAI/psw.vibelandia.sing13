/**
 * Minimal empirical check: E_F hybrid kernel length + node closure.
 * Honesty: structural — not calorimeter / SI proof.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EFKernel } from '../../../lib/ef-kernel.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
mkdirSync(dataDir, { recursive: true });

const ef = new EFKernel();
const experiments = [
  {
    id: 'E1_digits_2187',
    pass: ef.phiDigits.length === 2187,
    length: ef.phiDigits.length,
  },
  {
    id: 'E2_matrices_27',
    pass: ef.matrices.length === 27,
    count: ef.matrices.length,
  },
  {
    id: 'E3_node_2187_closure',
    pass: (() => {
      const n = ef.getNodeCoordinate(2187);
      return n.matrix_id === 27 && n.octave === 3;
    })(),
    node: ef.getNodeCoordinate(2187),
  },
  {
    id: 'E4_landauer_honesty',
    pass: /architectural|not empirical/i.test(ef.landauerLimit().honesty),
    landauer: ef.landauerLimit(),
  },
  {
    id: 'E5_pinch_bounded',
    pass: (() => {
      const p = ef.pinch({ query: 'landauer hardware', matrixIds: [15, 27] });
      return p.window_count > 0 && p.window_count <= 12;
    })(),
  },
];

const nPass = experiments.filter((e) => e.pass).length;
const report = {
  docId: 'WP-SYNTHOBS-OMNI-LATTICE-EF-2187-HYBRID-2026-08',
  generatedAt: new Date().toISOString(),
  honestyBoundary:
    'Structural kernel/index suite. Not wet-lab, calorimeter, NOAA validation, or SI arrival.',
  results: {
    n_total: experiments.length,
    n_pass: nPass,
    all_pass: nPass === experiments.length,
    experiments,
  },
};

writeFileSync(join(dataDir, 'empirical_report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify({
    ok: report.results.all_pass,
    passed: `${nPass}/${experiments.length}`,
    json: join(dataDir, 'empirical_report.json'),
  }),
);
process.exit(report.results.all_pass ? 0 : 1);
