#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runExpedition } from '../src/experiments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });
const t0 = Date.now();
const report = runExpedition();
report.ms = Date.now() - t0;
report.generatedAt = new Date().toISOString();
writeFileSync(join(dataDir, 'empirical_report.json'), JSON.stringify(report, null, 2));

const v = report.verdict;
const cand = (v.newWiringCandidates || []).map((c) => c.label).join(', ') || 'none';
const nl = String.fromCharCode(10);
writeFileSync(
  join(dataDir, 'empirical_report.md'),
  [
    '# Combo Rhyme Wiring Expedition · empirical report',
    '',
    '**Document ID:** `' + report.documentId + '`',
    '**New STRING-empty candidates:** ' + cand,
    '**Cross-rhyme recoveries:** ' + (v.crossRhymeRecoveries || []).join(', '),
    '**Gate:** **' + v.comboWiringExpeditionPass + '**',
    '',
    v.summary || '',
    '',
    '→ ∞^∞',
    '',
  ].join(nl),
);
console.log(JSON.stringify({ ok: true, pass: v.comboWiringExpeditionPass, candidates: v.newWiringCandidates, ms: report.ms }, null, 2));
