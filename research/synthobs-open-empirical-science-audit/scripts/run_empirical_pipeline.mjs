#!/usr/bin/env node
/** Open empirical science corpus audit pipeline */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'data');

const report = runAllExperiments();

await mkdir(DATA, { recursive: true });
await writeFile(join(DATA, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# Empirical report · Open empirical science corpus audit',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  `**Summary:** ${report.summary.pass}/${report.summary.total} pass`,
  '',
  '| ID | Title | Result | Pass |',
  '|----|-------|--------|------|',
  ...report.experiments.map(
    (e) => `| ${e.id} | ${e.title} | ${e.result ?? (e.pass ? 'support' : 'refute')} | ${e.pass ? '✓' : '✗'} |`,
  ),
  '',
  report.experiments.find((e) => e.id === 'E7_boundary_verdict')?.honesty ?? '',
].join('\n');

await writeFile(join(DATA, 'empirical_report.md'), md, 'utf8');

console.log('synthobs-open-empirical-science-audit:', report.summary.pass + '/' + report.summary.total, 'pass');
if (!report.summary.all_pass) process.exitCode = 1;
