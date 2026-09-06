/**
 * Prime Vault Chat — suite locks for the edge Omni-Lattice chat engine.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SHIP_BLOG_SLUG,
  DOOR,
} from './constants.mjs';
import {
  createPrimeVaultChatEngine,
  generateSemanticPrimes,
  queryPrimeVaultChat,
  DEFAULT_VOCABULARY,
} from '../../../lib/prime-vault-chat-engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO = path.resolve(PKG_ROOT, '..', '..');

function experimentPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    PHI_EGS,
  };
}

function experimentPrimes() {
  const primes = generateSemanticPrimes(DEFAULT_VOCABULARY.length);
  return {
    id: 'E2_semantic_primes',
    pass:
      primes[0] === 2 &&
      primes.length === DEFAULT_VOCABULARY.length &&
      primes.every((p, i) => i === 0 || p % 2 === 1),
    n: primes.length,
  };
}

function experimentDeterminism() {
  const a = queryPrimeVaultChat('What is the fractal constant?', { octaveTier: 7 });
  const b = queryPrimeVaultChat('What is the fractal constant?', { octaveTier: 7 });
  const stripClock = (s) => s.replace(/→ Edge clock:.*$/m, '').trim();
  const nodesEqual =
    a.nodes.length === b.nodes.length &&
    a.nodes.every(
      (n, i) =>
        n.concept === b.nodes[i].concept &&
        n.primeVault === b.nodes[i].primeVault &&
        n.amplitude === b.nodes[i].amplitude,
    );
  return {
    id: 'E3_deterministic_reply',
    pass:
      stripClock(a.reply) === stripClock(b.reply) &&
      nodesEqual &&
      a.nodes.length >= 1 &&
      a.trainingCostUsd === 0 &&
      a.latencyMs < 50,
    latencyMs: a.latencyMs,
  };
}

function experimentIntentBoost() {
  const protein = queryPrimeVaultChat('protein folding race vs AlphaFold', {
    octaveTier: 7,
  });
  const hit = protein.nodes.some((n) =>
    /protein|prime|container/i.test(n.concept),
  );
  return {
    id: 'E4_intent_resonance',
    pass: hit && protein.nodes[0].amplitude > 0,
    top: protein.nodes[0]?.concept,
  };
}

function experimentZeroTraining() {
  const engine = createPrimeVaultChatEngine({ octaveTier: 7 });
  const r = engine.queryLattice('hello lattice');
  return {
    id: 'E5_zero_training_cost',
    pass: r.trainingCostUsd === 0 && /zero training|\$0\.00 training/i.test(r.reply),
  };
}

function experimentSurfaces() {
  const paper =
    (fs.existsSync(path.join(MONOREPO, 'docs', PAPER_NAME)) &&
      fs.readFileSync(path.join(MONOREPO, 'docs', PAPER_NAME), 'utf8')) ||
    '';
  const blogPath = path.join(MONOREPO, 'interfaces', SHIP_BLOG_FILE);
  const blog = fs.existsSync(blogPath) ? fs.readFileSync(blogPath, 'utf8') : '';
  const door = fs.existsSync(path.join(MONOREPO, 'interfaces', 'prime-vault-chat.html'))
    ? fs.readFileSync(path.join(MONOREPO, 'interfaces', 'prime-vault-chat.html'), 'utf8')
    : '';
  const api = fs.existsSync(path.join(MONOREPO, 'api', 'prime-vault-chat.js'))
    ? fs.readFileSync(path.join(MONOREPO, 'api', 'prime-vault-chat.js'), 'utf8')
    : '';
  const checks = {
    paperHonesty: /Honesty boundary/i.test(paper),
    paperDocId: paper.includes(DOC_ID),
    paperPhi: /1\.618|Φ|PHI/i.test(paper),
    paperFair: /Fair Exchange/i.test(paper),
    paperZero: /\$0|0\.00 training|zero training/i.test(paper),
    paperOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('prime-vault-chat'),
    blogDoor: blog.includes(DOOR) || blog.includes('/prime-vault-chat'),
    blogHonesty: /Honesty/i.test(blog),
    doorChatUi: /pvc-thread|Message Prime Vault/i.test(door),
    apiSeat: /checkLatticeEmailAccess|x-lattice-email/i.test(api),
  };
  return {
    id: 'E6_surfaces',
    pass: Object.values(checks).every(Boolean),
    ...checks,
  };
}

function experimentRegistry() {
  return {
    id: 'E7_registry',
    pass: REGISTRY_ID === 'synthobs-prime-vault-chat-2026-09',
    REGISTRY_ID,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhi(),
    experimentPrimes(),
    experimentDeterminism(),
    experimentIntentBoost(),
    experimentZeroTraining(),
    experimentSurfaces(),
    experimentRegistry(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    experiments,
    n_pass: experiments.filter((e) => e.pass).length,
    n_total: experiments.length,
    all_pass: failed.length === 0,
    failed,
  };
}
