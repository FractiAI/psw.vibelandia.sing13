#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_ID, REGISTRY_ID, STUDY_TITLE, PHI_EGS, HONESTY, STANDALONE_REPO } from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

async function main() {
  const results = await runAllExperiments();
  const generatedAt = new Date().toISOString();
  const report = {
    schema: 'synthobs-empirical-report/v1',
    generatedAt,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    studyTitle: STUDY_TITLE,
    phiEgs: PHI_EGS,
    honesty: HONESTY,
    standaloneRepo: STANDALONE_REPO,
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(
    path.join(OUT, 'empirical_report.md'),
    `# ${STUDY_TITLE}\n\n**Status:** design verified · comparative findings **awaiting execution**\n\n\`all_pass\`: ${results.all_pass}\n`,
  );
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: STANDALONE_REPO,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
      },
      null,
      2,
    ),
  );
  process.exit(results.all_pass ? 0 : 1);
}

main();
