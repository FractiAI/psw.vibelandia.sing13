/**
 * Prime-Vault Race · guest door pipe.
 * Same Lattice / Let's Chat email allowlist (x-lattice-email · ?email=).
 * GET ?email= — seat check only.
 * GET (header email) — measured race receipt + live prime-vault fold for one tier.
 * Honesty: ColabFold wall/pLDDT from measured receipt; vault runs closed-form on this edge.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_PATH = join(
  __dirname,
  '..',
  'research',
  'synthobs-prime-vault-alphafold-race',
  'data',
  'race_results.json',
);

let libs;
async function loadLibs() {
  if (!libs) {
    libs = await import('../lib/lattice-access.mjs');
  }
  return libs;
}

const PHI_EGS = (1 + Math.sqrt(5)) / 2;

const TIERS = Object.freeze({
  simple_ubiquitin: { id: 'simple_ubiquitin', residues: 76, octave: 1, label: 'Ubiquitin (76 aa)' },
  complex_il2: { id: 'complex_il2', residues: 264, octave: 2, label: 'IL-2 + IL-2Rβ (264 aa)' },
  frontier_orphan: { id: 'frontier_orphan', residues: 89, octave: 3, label: 'Orphan synthetic (89 aa)' },
});

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-lattice-email, X-Lattice-Email',
  );
}

function generateOddPrimes(n) {
  const primes = [];
  let candidate = 3;
  while (primes.length < n) {
    let isPrime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate += 2;
  }
  return primes;
}

function primeVaultFold(residues, octave = 1) {
  const t0 = performance.now();
  const primes = generateOddPrimes(residues);
  let energy = 0;
  for (let i = 0; i < primes.length; i++) {
    const pk = primes[i];
    energy += (PHI_EGS ** octave) / pk ** PHI_EGS * Math.exp(-(i + 1) / PHI_EGS);
  }
  return {
    lane: 'prime_vault',
    residues,
    octave,
    primes: primes.length,
    energy,
    latencyMs: performance.now() - t0,
    live: true,
  };
}

function loadResults() {
  try {
    return JSON.parse(readFileSync(RESULTS_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function emailFromReq(req, L) {
  const header =
    req.headers?.['x-lattice-email'] ||
    req.headers?.['X-Lattice-Email'] ||
    '';
  const q = typeof req.query?.email === 'string' ? req.query.email : '';
  return L.normalizeEmail(header || q);
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.json({ ok: false, reason: 'GET only' });
  }

  const L = await loadLibs();
  const email = emailFromReq(req, L);
  const access = L.checkLatticeEmailAccess(email);

  const url = new URL(req.url || '/', 'http://localhost');
  const seatOnly =
    url.searchParams.has('email') &&
    !req.headers?.['x-lattice-email'] &&
    !req.headers?.['X-Lattice-Email'] &&
    !url.searchParams.get('tier') &&
    !url.searchParams.get('race');

  if (seatOnly || (!access.ok && url.searchParams.has('email'))) {
    res.statusCode = access.ok ? 200 : 401;
    return res.json({
      ok: access.ok,
      privilege: access.privilege,
      reason: access.reason,
      email: access.email,
      expiresAt: access.expiresAt,
      product: 'prime-vault-race',
      sameSeatAs: ['lets-chat', 'lattice-chat'],
    });
  }

  if (!access.ok) {
    res.statusCode = 401;
    return res.json({
      ok: false,
      privilege: 'none',
      reason: access.reason || 'Enter the email the Purser seated for Lattice / Let\'s Chat.',
      product: 'prime-vault-race',
    });
  }

  const results = loadResults();
  const tierKey = url.searchParams.get('tier') || '';
  const runLive = url.searchParams.get('race') === '1' || Boolean(tierKey);

  const payload = {
    ok: true,
    privilege: access.privilege,
    email: access.email,
    expiresAt: access.expiresAt,
    product: 'prime-vault-race',
    door: '/prime-vault-race',
    honesty:
      'Prime-vault = live closed-form Φ fold on this edge. ColabFold = measured receipt (CPU · single_sequence · 1 model). Latency race ≠ GDT-TS / CASP. Same email seat as Let\'s Chat and Lattice Chat.',
    fairExchange: true,
    phiEgs: PHI_EGS,
    receipt: results,
    tiers: Object.values(TIERS),
  };

  if (runLive) {
    const key = TIERS[tierKey] ? tierKey : 'simple_ubiquitin';
    const meta = TIERS[key];
    const vault = primeVaultFold(meta.residues, meta.octave);
    const colab = results?.tiers?.[key]?.colabfold || null;
    payload.race = {
      tier: key,
      label: meta.label,
      primeVault: vault,
      colabfold: colab,
      speedup:
        colab?.wallMs && vault.latencyMs > 0
          ? colab.wallMs / vault.latencyMs
          : null,
    };
  }

  res.statusCode = 200;
  return res.json(payload);
}
