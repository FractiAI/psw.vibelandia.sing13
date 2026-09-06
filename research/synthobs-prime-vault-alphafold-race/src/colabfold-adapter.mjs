/**
 * ColabFold adapter — AlphaFold-class lane for the Prime-Vault race.
 *
 * Live path: COLABFOLD_LIVE=1 and a resolvable `colabfold_batch` (or COLABFOLD_BIN).
 * CI / default: discovery + contract fixtures; does not fabricate AF structures.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(PKG_ROOT, 'fixtures', 'fasta');
const RECEIPT_DIR = path.join(PKG_ROOT, 'data', 'colabfold_receipts');

export const COLABFOLD_LIVE = process.env.COLABFOLD_LIVE === '1';

/** Canonical FastA fixtures for the three race tiers. */
export const RACE_FASTA = Object.freeze({
  simple_ubiquitin: path.join(FIXTURES, 'tier1_ubiquitin.fasta'),
  complex_il2: path.join(FIXTURES, 'tier2_il2_complex.fasta'),
  frontier_orphan: path.join(FIXTURES, 'tier3_orphan_synthetic.fasta'),
});

export function resolveColabfoldBin() {
  if (process.env.COLABFOLD_BIN) return process.env.COLABFOLD_BIN;
  const which = spawnSync('which', ['colabfold_batch'], { encoding: 'utf8' });
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();
  return null;
}

export function discoverColabfold() {
  const bin = resolveColabfoldBin();
  const fixturesOk = Object.values(RACE_FASTA).every((p) => fs.existsSync(p));
  return {
    engine: 'colabfold',
    bin,
    installed: Boolean(bin),
    liveRequested: COLABFOLD_LIVE,
    liveEligible: Boolean(bin) && COLABFOLD_LIVE,
    fixturesOk,
    fixtures: RACE_FASTA,
    honesty:
      'ColabFold is the AlphaFold-class comparison lane. Live inference only when COLABFOLD_LIVE=1 and colabfold_batch is installed. Default CI validates adapter contract + FastA fixtures — it does not invent pLDDT or PDB coordinates.',
  };
}

/**
 * Run ColabFold on one FastA when live; otherwise return a deferred receipt.
 * @param {string} tierId
 * @param {string} fastaPath
 * @param {{ outDir?: string }} [opts]
 */
export function runColabfoldTier(tierId, fastaPath, opts = {}) {
  const discovery = discoverColabfold();
  const outDir =
    opts.outDir || path.join(RECEIPT_DIR, tierId, String(Date.now()));

  if (!discovery.liveEligible) {
    return {
      tierId,
      lane: 'colabfold',
      mode: discovery.installed ? 'installed_idle' : 'not_installed',
      fastaPath,
      live: false,
      latencyMs: null,
      plddtMean: null,
      exitCode: null,
      outDir: null,
      note: discovery.installed
        ? 'colabfold_batch found — set COLABFOLD_LIVE=1 to race live'
        : 'Install ColabFold (colabfold_batch) then set COLABFOLD_LIVE=1',
      discovery,
    };
  }

  fs.mkdirSync(outDir, { recursive: true });
  const t0 = performance.now();
  const run = spawnSync(
    discovery.bin,
    [fastaPath, outDir, '--num-models', '1', '--num-recycle', '1'],
    { encoding: 'utf8', timeout: 3_600_000 },
  );
  const latencyMs = performance.now() - t0;
  const receipt = {
    tierId,
    lane: 'colabfold',
    mode: 'live',
    fastaPath,
    live: true,
    latencyMs,
    plddtMean: null,
    exitCode: run.status,
    stdoutTail: (run.stdout || '').slice(-2000),
    stderrTail: (run.stderr || '').slice(-2000),
    outDir,
    discovery,
  };
  fs.mkdirSync(RECEIPT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(RECEIPT_DIR, `${tierId}-latest.json`),
    JSON.stringify(receipt, null, 2),
  );
  return receipt;
}

/** Race one tier: live prime-vault vs ColabFold lane (live or deferred). */
export function raceTier(tier, primeVaultFold) {
  const fastaPath = RACE_FASTA[tier.id];
  const pv = primeVaultFold(tier.residues, tier.octave);
  const cf = runColabfoldTier(tier.id, fastaPath);
  return {
    tierId: tier.id,
    tierName: tier.name,
    primeVault: pv,
    colabfold: cf,
    latencyAdvantageMs:
      cf.live && cf.latencyMs != null ? cf.latencyMs - pv.latencyMs : null,
    comparisonMode: cf.mode,
  };
}
