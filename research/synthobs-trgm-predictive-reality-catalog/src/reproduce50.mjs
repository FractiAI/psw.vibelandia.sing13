/**
 * Reproduce TRGM #50 from clean module imports: fixture hashes, provenance,
 * runner metrics — no retuning.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DIGITAL_SEED, EXPECTED_CATALOG_ENTRIES_50 } from './constants.mjs';
import { runAllExperiments as runTrgm50 } from '../../synthobs-tiny-reality-generation-model/src/experiments.mjs';
import { loadWaveNodeFqCatalog } from '../../synthobs-tiny-reality-generation-model/src/wave-node-fq-catalog.mjs';
import { loadProvenance } from '../../synthobs-tiny-reality-generation-model/src/genetic-nodes-lab.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRGM50 = path.resolve(__dirname, '../../synthobs-tiny-reality-generation-model');
const GENETIC = path.join(TRGM50, 'data/molecular/genetic');

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function hashTrgm50Fixtures() {
  const files = [
    'PROVENANCE.json',
    'chrM.hs1.fa',
    'genes.panel.json',
    'exons.panel.json',
    'cpg.panel.json',
    'hg38.chrom.sizes',
    'wave_node_fq_catalog.json',
    '../hs1.chrom.sizes',
  ];
  const hashes = {};
  for (const rel of files) {
    const p = path.join(GENETIC, rel);
    if (!fs.existsSync(p)) {
      hashes[rel] = { ok: false, error: 'missing' };
      continue;
    }
    hashes[rel] = { ok: true, sha256: sha256File(p), bytes: fs.statSync(p).size };
  }
  return hashes;
}

export async function reproduceTrgm50() {
  const hashes = hashTrgm50Fixtures();
  const provenance = loadProvenance();
  const catalog = loadWaveNodeFqCatalog();
  const results = await runTrgm50();

  const fixtureOk = Object.values(hashes).every((h) => h.ok);
  const catalogN = catalog.entries?.length ?? 0;
  const catalogOk = catalogN === EXPECTED_CATALOG_ENTRIES_50;

  const metrics = {
    seed: results.seed,
    all_pass: results.all_pass,
    n_pass: results.n_pass,
    n_total: results.n_total,
    heldViability: results.lab?.held?.summary?.viabilityRate,
    nullViability: results.lab?.nullBaseline?.viabilityRate,
    triadic_all_pass: results.triadic_all_pass,
    genetic_all_pass: results.genetic_all_pass,
    catalog_all_pass: results.catalog_all_pass,
    catalogEntries: catalogN,
    genesByChannel: results.catalog?.genesByChannel,
  };

  // Locked expectations from #50 executed battery (not retuned here)
  const locked = {
    seed: DIGITAL_SEED,
    n_total: 24,
    heldViability: 1,
    nullViability: 0,
    catalogEntries: EXPECTED_CATALOG_ENTRIES_50,
  };

  const metricsMatch =
    metrics.seed === locked.seed &&
    metrics.n_total === locked.n_total &&
    metrics.all_pass === true &&
    metrics.heldViability === locked.heldViability &&
    metrics.nullViability === locked.nullViability &&
    metrics.catalogEntries === locked.catalogEntries;

  return {
    ok: fixtureOk && catalogOk && metricsMatch,
    runner: 'research/synthobs-tiny-reality-generation-model/src/experiments.mjs#runAllExperiments',
    provenance,
    hashes,
    locked,
    metrics,
    fixtureOk,
    catalogOk,
    metricsMatch,
  };
}
