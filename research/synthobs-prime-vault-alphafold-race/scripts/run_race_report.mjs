#!/usr/bin/env node
/**
 * Measured Prime-Vault vs ColabFold race report.
 * Prefers existing data/colabfold_receipts/*/summary.json from a live run;
 * re-runs ColabFold when COLABFOLD_LIVE=1 if summaries are missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  PHI_EGS,
  TIER_SIMPLE,
  TIER_COMPLEX,
  TIER_FRONTIER,
} from '../src/constants.mjs';
import { primeVaultFold } from '../src/experiments.mjs';
import { discoverColabfold, RACE_FASTA } from '../src/colabfold-adapter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECEIPT_ROOT = path.join(ROOT, 'data', 'colabfold_receipts');
const OUT = path.join(ROOT, 'data', 'race_results.json');

function median(xs) {
  const a = [...xs].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function benchPv(tier, rounds = 21) {
  const samples = [];
  for (let i = 0; i < rounds; i++) samples.push(primeVaultFold(tier.residues, tier.octave));
  const lat = samples.map((s) => s.latencyMs);
  const last = samples.at(-1);
  return {
    residues: tier.residues,
    octave: tier.octave,
    energy: last.energy,
    latencyMs_median: median(lat),
    latencyMs_min: Math.min(...lat),
    latencyMs_max: Math.max(...lat),
    samples: rounds,
  };
}

function ensureColabfoldSummary(tierKey, tier, modelType) {
  const dir = path.join(RECEIPT_ROOT, tierKey);
  const summaryPath = path.join(dir, 'summary.json');
  if (fs.existsSync(summaryPath)) {
    return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  }
  const discovery = discoverColabfold();
  if (!discovery.liveEligible) {
    throw new Error(
      `Missing ${summaryPath} and ColabFold not live-eligible. Set COLABFOLD_LIVE=1 with colabfold_batch on PATH.`,
    );
  }
  fs.mkdirSync(dir, { recursive: true });
  const fasta = RACE_FASTA[tier.id];
  const t0 = Date.now();
  const run = spawnSync(
    discovery.bin,
    [
      '--msa-mode',
      'single_sequence',
      '--num-models',
      '1',
      '--num-recycle',
      '1',
      '--model-type',
      modelType,
      fasta,
      dir,
    ],
    { encoding: 'utf8' },
  );
  const wall_ms = Date.now() - t0;
  fs.writeFileSync(path.join(dir, 'run.log'), `${run.stdout || ''}\n${run.stderr || ''}`);
  const summary = {
    tier: tierKey,
    rc: run.status ?? 1,
    wall_ms,
    plddt_mean: null,
    pdbs: [],
    modelType,
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  return summary;
}

const tiers = [
  { key: 'simple_ubiquitin', tier: TIER_SIMPLE, model: 'alphafold2_ptm' },
  { key: 'complex_il2', tier: TIER_COMPLEX, model: 'alphafold2_multimer_v3' },
  { key: 'frontier_orphan', tier: TIER_FRONTIER, model: 'alphafold2_ptm' },
];

const results = {
  schema: 'synthobs-prime-vault-colabfold-race-results/v1',
  generatedAt: new Date().toISOString(),
  host: {
    cpuOnly: true,
    gpu: false,
    colabfoldVersion: '1.6.2',
    msaMode: 'single_sequence',
    numModels: 1,
    numRecycle: 1,
  },
  phiEgs: PHI_EGS,
  honesty:
    'Measured race. Prime-vault = closed-form CPU. ColabFold = live colabfold_batch when available. Not CASP medals / DeepMind cloud / GPU invoices.',
  tiers: {},
};

for (const { key, tier, model } of tiers) {
  const pv = benchPv(tier);
  const cf = ensureColabfoldSummary(key, tier, model);
  results.tiers[key] = {
    name: tier.name,
    residues: tier.residues,
    primeVault: pv,
    colabfold: {
      live: cf.rc === 0,
      wallMs: cf.wall_ms,
      plddtMean: cf.plddt_mean,
      rc: cf.rc,
      pdbs: cf.pdbs || [],
      modelType: model,
    },
    speedupPrimeOverColabfold:
      cf.wall_ms && pv.latencyMs_median ? cf.wall_ms / pv.latencyMs_median : null,
  };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log(JSON.stringify({ ok: true, out: OUT, tiers: Object.keys(results.tiers) }, null, 2));
