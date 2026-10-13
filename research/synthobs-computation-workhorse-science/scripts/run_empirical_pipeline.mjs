#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  HONESTY,
  STANDALONE_REPO,
  SIMULATION_EXECUTED,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';
import { runCw2Simulation } from '../src/computational-lab.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

async function main() {
  const cw2 = runCw2Simulation();
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
    simulationExecuted: SIMULATION_EXECUTED,
    cw2: {
      seed: cw2.seed,
      repetitions: cw2.repetitions,
      summary: cw2.summary,
      pipelineEffect: cw2.pipelineEffect,
      environmentEffect: cw2.environmentEffect,
      honesty: cw2.honesty,
    },
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(path.join(OUT, 'cw2_summary.json'), `${JSON.stringify(cw2, null, 2)}\n`);
  await fs.writeFile(
    path.join(OUT, 'empirical_report.md'),
    `# ${STUDY_TITLE}\n\n**Status:** CW-2 synthetic simulation executed (seed ${cw2.seed}, ${cw2.repetitions} reps)\n\n\`all_pass\`: ${results.all_pass}\n`,
  );
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: STANDALONE_REPO,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
        cw2Seed: cw2.seed,
      },
      null,
      2,
    ),
  );
  process.exit(results.all_pass ? 0 : 1);
}

main();
