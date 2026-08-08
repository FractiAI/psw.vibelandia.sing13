/**
 * SIQHFT E_F 2187 monograph structural suite.
 * Honesty: index + honesty-gate checks — not calorimeter / SI proof.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EFKernel } from '../../../lib/ef-kernel.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const dataDir = join(__dirname, '../data');
mkdirSync(dataDir, { recursive: true });

const paperPath = join(root, 'docs/SYNTHOBS_SIQHFT_EF_2187_MONOGRAPH_2026-08.md');
const paper = readFileSync(paperPath, 'utf8');
const ef = new EFKernel();

const experiments = [
  {
    id: 'E1_paper_honesty_boundary',
    pass: /Honesty boundary/i.test(paper) && /does not claim/i.test(paper),
  },
  {
    id: 'E2_document_id',
    pass: paper.includes('WP-SYNTHOBS-SIQHFT-EF-2187-MONOGRAPH-2026-08'),
  },
  {
    id: 'E3_synthobs_operator',
    pass: /SynthOBS Autonomous Agent/i.test(paper),
  },
  {
    id: 'E4_digits_2187',
    pass: ef.phiDigits.length === 2187,
    length: ef.phiDigits.length,
  },
  {
    id: 'E5_matrices_27',
    pass: ef.matrices.length === 27,
  },
  {
    id: 'E6_landauer_not_claimed_as_calorimeter',
    pass:
      /calorimeter/i.test(paper) &&
      /not claim|does not claim|No calorimeter/i.test(paper) &&
      /architectural/i.test(ef.landauerLimit().honesty),
  },
  {
    id: 'E7_si_not_authorized',
    pass: /not.*superintelligence arrival|SIM/i.test(paper),
  },
  {
    id: 'E8_standalone_pointer',
    pass: paper.includes('synthobs-ef-2187-monograph'),
  },
  {
    id: 'E9_node_2187',
    pass: ef.getNodeCoordinate(2187).matrix_id === 27,
    node: ef.getNodeCoordinate(2187),
  },
];

const nPass = experiments.filter((e) => e.pass).length;
const report = {
  docId: 'WP-SYNTHOBS-SIQHFT-EF-2187-MONOGRAPH-2026-08',
  registryId: 'synthobs-siqhft-ef-2187-monograph-2026-08',
  generatedAt: new Date().toISOString(),
  standalone: 'https://github.com/FractiAI/synthobs-ef-2187-monograph',
  honestyBoundary:
    'Structural monograph + kernel index suite. Narrative AR/SDR metrics are not lab receipts.',
  results: {
    n_total: experiments.length,
    n_pass: nPass,
    all_pass: nPass === experiments.length,
    failed: experiments.filter((e) => !e.pass).map((e) => e.id),
    experiments,
  },
};

writeFileSync(join(dataDir, 'empirical_report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify({
    ok: report.results.all_pass,
    passed: `${nPass}/${experiments.length}`,
    failed: report.results.failed,
    json: join(dataDir, 'empirical_report.json'),
  }),
);
process.exit(report.results.all_pass ? 0 : 1);
