#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_ID, REGISTRY_ID, STUDY_TITLE, PHI_EGS, LAMBDA_EGS } from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'data');

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments();
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honestyBoundary: 'Y holographic operator poetry. Not wet-lab gene ontology.',
    results,
    phi: PHI_EGS,
    lambda: LAMBDA_EGS,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(
    path.join(OUT, 'empirical_report.md'),
    `# ${STUDY_TITLE}\n\nPassed: ${results.n_pass}/${results.n_total}\n`,
  );
  console.log(JSON.stringify({ ok: results.all_pass, passed: `${results.n_pass}/${results.n_total}` }, null, 2));
  process.exit(results.all_pass ? 0 : 1);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
