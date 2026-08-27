#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  AGENT_NAME,
  PAPER_NAME,
  HONESTY,
  PHANTOM,
  TRIALS_PER_SCALE,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const KOMAMRI_SCRIPT = path.join(ROOT, 'scripts', 'bench_komamri_live.jl');
const KOMAMRI_RECEIPT = path.join(OUT, 'komamri_live_receipt.json');

async function loadPriorKomamriReceipt() {
  try {
    return JSON.parse(await fs.readFile(KOMAMRI_RECEIPT, 'utf8'));
  } catch {
    return null;
  }
}

async function maybeRunKomamriLive() {
  if (process.env.SYNTHIO_SKIP_KOMAMRI === '1') {
    const prior = await loadPriorKomamriReceipt();
    return { attempted: false, reason: 'SYNTHIO_SKIP_KOMAMRI=1', priorReceipt: prior || undefined };
  }
  const julia = spawnSync('julia', ['--version'], { encoding: 'utf8' });
  if (julia.status !== 0) {
    const prior = await loadPriorKomamriReceipt();
    return { attempted: false, reason: 'julia_not_on_path', priorReceipt: prior || undefined };
  }
  const run = spawnSync('julia', [KOMAMRI_SCRIPT], {
    encoding: 'utf8',
    cwd: ROOT,
    env: process.env,
    timeout: 600_000,
  });
  if (run.status !== 0) {
    return {
      attempted: true,
      ok: false,
      reason: 'julia_bench_failed',
      stderr: (run.stderr || '').slice(-2000),
    };
  }
  const receipt = JSON.parse(await fs.readFile(KOMAMRI_RECEIPT, 'utf8'));
  return { attempted: true, ok: receipt.allPass === true, receipt };
}

function mdReport(report) {
  const s = report.results.summary;
  const e3 = report.results.experiments.find((e) => e.id === 'E3_live_wall_clock_bloch_cpu');
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Agent:** ${AGENT_NAME}`,
    `**Generated:** ${report.generatedAt}`,
    `**Host:** ${report.host.cpus} CPU · ${report.host.platform} · Node ${report.host.node}`,
    `**Timing:** \`${report.host.timedWith}\` · backend \`${report.host.backend}\``,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All pass | ${report.results.all_pass} |`,
    `| Passed | ${report.results.n_pass}/${report.results.n_total} |`,
    `| Mean edge reduction (legacy/MRI) | ${s.meanEdgeReduction.toFixed(3)}× |`,
    `| Mean token reduction | ${(s.meanTokenReduction * 100).toFixed(1)}% |`,
    `| Mean **live** wall-clock speedup | ${s.meanSpeedup.toFixed(3)}× |`,
    `| Mean measured voxel×TR reduction | ${(s.meanVoxelReduction * 100).toFixed(1)}% |`,
    `| Mean measured byte reduction | ${(s.meanByteReduction * 100).toFixed(1)}% |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    '',
    '### E3 live wall-clock rows',
    '',
    '| N | Legacy ms | MRI ms | Speedup | Voxel↓ |',
    '|--:|----------:|--------:|--------:|-------:|',
  ];
  for (const r of e3?.rows || []) {
    lines.push(
      `| ${r.n} | ${r.legacyMs.toFixed(2)} ± ${r.legacyStd.toFixed(2)} | ${r.mriMs.toFixed(2)} ± ${r.mriStd.toFixed(2)} | ${r.speedup.toFixed(2)}× | ${(r.voxelReduction * 100).toFixed(1)}% |`,
    );
  }
  lines.push('');
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- Pass: \`${e.pass}\``, '');
  }
  const kReceipt = report.komamriLive?.receipt || report.komamriLive?.priorReceipt;
  if (kReceipt) {
    lines.push(
      '### Companion — live KomaMRI.jl CPU',
      '',
      `| Mean KomaMRI speedup | ${Number(kReceipt.meanSpeedup).toFixed(3)}× |`,
      `| KomaMRI version | ${kReceipt.komaVersion} |`,
      `| Julia | ${kReceipt.juliaVersion} |`,
      `| All pass | ${kReceipt.allPass} |`,
      `| Source | ${report.komamriLive?.attempted ? 'ran_this_host' : 'shipped_receipt'} |`,
      '',
    );
  }
  lines.push('## Honesty', '', HONESTY.note, '', '→ ∞^∞', '');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments();
  const komamriLive = await maybeRunKomamriLive();
  const host = {
    cpus: os.cpus().length,
    platform: `${os.platform()}-${os.arch()}`,
    node: process.version,
    timedWith: 'process.hrtime.bigint',
    backend: 'node_bloch_cpu',
    phantom: PHANTOM,
    trialsPerScale: TRIALS_PER_SCALE,
    hostname: os.hostname(),
  };
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    paperName: PAPER_NAME,
    generatedAt: new Date().toISOString(),
    operator: 'Synthio · Syntheverse Sandbox · SynthOBS family',
    honestyBoundary: HONESTY.note,
    host,
    komamriLive,
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        agent: AGENT_NAME,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
        summary: results.summary,
        komamriLive: komamriLive.attempted
          ? { ok: komamriLive.ok, meanSpeedup: komamriLive.receipt?.meanSpeedup }
          : { attempted: false, reason: komamriLive.reason },
        host,
      },
      null,
      2,
    ),
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
